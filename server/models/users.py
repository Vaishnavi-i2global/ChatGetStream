from pydantic import BaseModel, EmailStr
from typing import Optional

class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str
    profile_pic: Optional[str] = None  # URL of profile image

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    username: str
    email: EmailStr
    profile_pic: Optional[str] = None