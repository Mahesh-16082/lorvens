from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User


def ensure_admin_account(db: Session) -> User:
    """Create the configured admin account if it doesn't exist."""

    admin_email = settings.ADMIN_EMAIL.strip().lower()

    admin = db.scalar(
        select(User).where(User.email == admin_email)
    )

    if admin:
        if admin.role != "admin":
            raise RuntimeError(
                "Configured ADMIN_EMAIL belongs to a non-admin account."
            )

        if not admin.is_active:
            raise RuntimeError(
                "Configured admin account is inactive."
            )

        return admin

    existing_admin = db.scalar(
        select(User).where(User.role == "admin")
    )

    if existing_admin:
        raise RuntimeError(
            "Another admin account already exists. "
            "Resolve the admin email configuration before starting."
        )

    admin = User(
        full_name="Lorvens Administrator",
        email=admin_email,
        hashed_password=None,
        is_email_verified=True,
        role="admin",
        is_active=True,
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return admin