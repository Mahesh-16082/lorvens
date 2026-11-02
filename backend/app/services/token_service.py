import uuid
from datetime import datetime, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.revoked_token import RevokedToken


def is_token_revoked(db: Session, jti: str) -> bool:
    """Check if a token identifier has been recorded as revoked."""
    stmt = select(RevokedToken.id).where(RevokedToken.jti == jti).limit(1)
    return db.scalar(stmt) is not None


def revoke_token(
    db: Session,
    jti: str,
    user_id: uuid.UUID,
    expires_at: datetime,
) -> bool:
    """
    Revoke a token by recording its unique identifier (jti).

    Ensures that already expired tokens do not create unnecessary database records.
    """
    now = datetime.now(timezone.utc)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    # If the token is already expired naturally, skip storing to save database space.
    if expires_at <= now:
        return False

    # Prevent duplicate revocation entries
    if is_token_revoked(db, jti):
        return True

    revoked_entry = RevokedToken(
        jti=jti,
        user_id=user_id,
        expires_at=expires_at,
    )
    db.add(revoked_entry)
    db.commit()
    db.refresh(revoked_entry)

    return True


def purge_expired_revoked_tokens(db: Session) -> int:
    """
    Remove revoked token records that are already past their expiration date.
    Maintains low database storage overhead.
    """
    now = datetime.now(timezone.utc)
    stmt = delete(RevokedToken).where(RevokedToken.expires_at <= now)
    result = db.execute(stmt)
    db.commit()
    return result.rowcount or 0
