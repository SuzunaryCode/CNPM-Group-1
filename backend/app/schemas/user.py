from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    company_name: str | None = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=100)

class UserResponse(UserBase):
    id: int
    role: str
    plan: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class StaffCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=100)


class UserProfileUpdate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)


class UserPlanUpdate(BaseModel):
    plan: str = Field(pattern="^(FREE|PRO)$")


class AdminUserUpdate(BaseModel):
    company_name: str | None = None
    is_active: bool | None = None
    plan: str | None = Field(None, pattern="^(FREE|PRO)$")


class LicenseActivateRequest(BaseModel):
    key: str = Field(..., min_length=1, max_length=64)

