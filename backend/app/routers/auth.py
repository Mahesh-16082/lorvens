from datetime import datetime, timedelta, timezone
import hmac
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_authenticated_admin_context
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.auth import (
    MessageResponse,
    SendOTPRequest,
    TokenResponse,
    VerifyOTPRequest,
)
from app.services.email_service import (
    EmailDeliveryError,
    send_otp_email,
)
from app.services.otp_service import (
    OTPCooldownError,
    OTPExpiredError,
    OTPInvalidError,
    OTPMaxAttemptsError,
    OTPNotFoundError,
    OTPRequestLimitError,
    create_otp,
    verify_otp,
)
from app.services.token_service import revoke_token

router = APIRouter(prefix="/auth", tags=["Admin Authentication"])


def get_admin_by_email(db: Session, email: str) -> User | None:
    """Query user by email."""
    return db.scalar(
        select(User).where(User.email == email.lower())
    )


@router.post("/send-otp", response_model=MessageResponse)
async def send_admin_otp(
    request: SendOTPRequest,
    db: Session = Depends(get_db),
):
    """
    Generate and dispatch a single-use login OTP to the configured admin email.
    Enforces cooldown and hourly limits with database-level concurrency protection.
    """
    email = str(request.email).strip().lower()
    admin_email = settings.ADMIN_EMAIL.strip().lower()

    if not hmac.compare_digest(email, admin_email):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This email is not authorized for admin access.",
        )

    admin = get_admin_by_email(db, email)

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This email is not authorized for admin access.",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive.",
        )

    if admin.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    # Check OTP rate limits and create OTP under exclusive lock
    try:
        otp_record, otp = create_otp(db, admin.id)
    except OTPCooldownError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc),
        )
    except OTPRequestLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc),
        )

    # Deliver OTP via SMTP
    try:
        await send_otp_email(admin.email, otp)
    except EmailDeliveryError:
        otp_record.consumed_at = datetime.now(timezone.utc)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to send OTP. Please try again later.",
        )

    return MessageResponse(
        message="OTP sent successfully to the authorized admin email."
    )


@router.post("/verify-otp", response_model=TokenResponse)
def verify_admin_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db),
):
    """
    Verify single-use OTP and issue a signed JWT access token.
    Enforces expiration, maximum incorrect attempts, and single-use invalidation.
    """
    email = str(request.email).strip().lower()
    admin_email = settings.ADMIN_EMAIL.strip().lower()

    if not hmac.compare_digest(email, admin_email):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This email is not authorized for admin access.",
        )

    admin = get_admin_by_email(db, email)

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This email is not authorized for admin access.",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive.",
        )

    if admin.role != "admin" or not admin.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    try:
        verify_otp(db, admin.id, request.otp)
    except OTPExpiredError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired.",
        )
    except OTPMaxAttemptsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum OTP verification attempts exceeded.",
        )
    except OTPInvalidError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP.",
        )
    except OTPNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP.",
        )

    access_token = create_access_token(
        subject=str(admin.id),
        expires_delta=timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout", response_model=MessageResponse)
def logout_admin(
    admin_context: tuple[User, dict[str, Any]] = Depends(
        get_authenticated_admin_context
    ),
    db: Session = Depends(get_db),
):
    """
    Revoke the current JWT access token using its unique token identifier (jti).
    Requires a valid authenticated admin token.
    """
    admin, payload = admin_context
    jti = payload["jti"]
    exp_timestamp = payload["exp"]

    expires_at = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
    revoke_token(db, jti=jti, user_id=admin.id, expires_at=expires_at)

    return MessageResponse(
        message="Logged out successfully."
    )
