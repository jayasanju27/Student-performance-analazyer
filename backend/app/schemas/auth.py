from pydantic import BaseModel, Field
from typing import Optional

class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=72)
    expected_role: Optional[str] = Field(default=None, max_length=32)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    email: str
    student_id: Optional[int] = None
    register_number: Optional[str] = None
    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    department_code: Optional[str] = None
    must_change_password: bool = False


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=72)
    new_password: str = Field(min_length=8, max_length=72)

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    must_change_password: bool = False

    class Config:
        from_attributes = True
