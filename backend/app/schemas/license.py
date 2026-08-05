from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class LicenseKeyGenerateRequest(BaseModel):
    count: int = Field(default=1, ge=1, le=100)
    expires_at: datetime | None = None


class LicenseAssignRequest(BaseModel):
    user_id: int


class LicenseKeyResponse(BaseModel):
    id: int
    key: str
    status: str
    assigned_to_user_id: int | None = None
    assigned_to_email: EmailStr | None = None
    used_by_user_id: int | None
    used_by_email: EmailStr | None = None
    used_at: datetime | None
    expires_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True
