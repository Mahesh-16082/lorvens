from app.services.email_service import (
    send_otp_email,
    EmailDeliveryError,
)

__all__ = [
    "send_otp_email",
    "EmailDeliveryError",
]