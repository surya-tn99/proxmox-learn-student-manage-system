import json
import base64
import hmac
import hashlib
import os
import time
from typing import Optional
from pathlib import Path
from fastapi import Depends, Header, HTTPException

# Resolve config.json relative to this script's location
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent  # Goes up from backend/ to project root
CONFIG_FILE = PROJECT_ROOT / 'config.json'

with open(CONFIG_FILE, 'r') as f:
    RAW = json.load(f)

API_KEY = RAW['api_key']  # Read from config.json (no env file needed)
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
TOKEN_TTL = 60 * 60 * 24  # 24 hours


def _enc(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode()


def _dec(data: str) -> bytes:
    return base64.urlsafe_b64decode(data.encode())


def create_token(user: dict) -> str:
    payload = {
        "user_id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "student_id": user.get("student_id"),
        "exp": int(time.time()) + TOKEN_TTL,
    }
    body = _enc(json.dumps(payload).encode())
    sig = _enc(hmac.new(SECRET_KEY.encode(), body.encode(), hashlib.sha256).digest())
    return f"{body}.{sig}"


def decode_token(token: str) -> Optional[dict]:
    try:
        body, sig = token.split(".")
        expected = _enc(hmac.new(SECRET_KEY.encode(), body.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(_dec(body))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(authorization[7:])
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user


def require_api_key(x_api_key: str = Header(None)) -> str:
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )
    return x_api_key