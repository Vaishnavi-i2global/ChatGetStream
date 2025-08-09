from fastapi import HTTPException
from server.database import db
from passlib.context import CryptContext
from server.models.users import UserSignup, UserLogin, UserResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def signup_user(user: UserSignup) -> UserResponse:
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = get_password_hash(user.password)
    new_user = {
        "username": user.username,
        "email": user.email,
        "password": hashed_pw,
        "profile_pic": user.profile_pic
    }
    await db.users.insert_one(new_user)
    return UserResponse(username=user.username, email=user.email, profile_pic=user.profile_pic)

async def login_user(user: UserLogin) -> dict:
    db_user = await db.users.find_one({"username": user.username})
    print(db_user)
    if not db_user:
        raise HTTPException(status_code=401, detail="no connection to the database or user not found")
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {"message": f"Welcome back, {user.username}!"}
