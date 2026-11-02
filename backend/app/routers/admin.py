from fastapi import APIRouter, Depends

from app.core.deps import get_admin_user
from app.models.user import User

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/dashboard")
def admin_dashboard(
    admin: User = Depends(get_admin_user),
):
    return {
        "message": "Welcome to Lorvens Admin Dashboard",
        "admin_email": admin.email,
        "role": admin.role,
    }