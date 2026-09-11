from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import db_client
from auth import create_token

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/auth/login")
def login(payload: LoginRequest):
    user = db_client.post("/login", json=payload.model_dump())
    token = create_token(user)
    return {
        "token": token,
        "role": user["role"],
        "username": user["username"],
        "student_id": user.get("student_id"),
    }