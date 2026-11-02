
from email.message import EmailMessage

import aiosmtplib
from aiosmtplib.errors import SMTPException

from app.core.config import settings


class EmailDeliveryError(Exception):
    """Raised when an email cannot be delivered."""


async def send_otp_email(
    recipient_email: str,
    otp: str
) -> None:
    """Send an authentication OTP through SMTP."""

    message = EmailMessage()

    message["Subject"] = "Lorvens - Admin Login Verification"
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = recipient_email

    message.set_content(
        f"""
Hello Administrator,

Your Lorvens admin login verification code is:

{otp}

This OTP is valid for {settings.OTP_EXPIRE_MINUTES} minutes.

For security reasons:
- Do not share this OTP with anyone.
- This OTP can only be used once.
- Request a new OTP if this one expires.

If you did not request this login, please ignore this email.

Regards,
Lorvens Security Team
"""
    )

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            sender=settings.SMTP_FROM_EMAIL,
            recipients=[recipient_email],
            start_tls=settings.SMTP_USE_TLS,
            timeout=20,
        )

    except (SMTPException, OSError) as exc:
        raise EmailDeliveryError(
            "Unable to deliver authentication email."
        ) from exc
