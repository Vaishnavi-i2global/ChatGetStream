from fastapi import APIRouter
from server.models.users import UserSignup, UserLogin, UserResponse
from server.service.users import signup_user, login_user

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user: UserSignup):
    return await signup_user(user)

@router.post("/login")
async def login(user: UserLogin):
    return await login_user(user)
