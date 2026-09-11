import os

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

DB_API_URL = os.getenv("DB_API_URL", "http://127.0.0.1:8001")
API_KEY = os.getenv("API_KEY", "dev-shared-key-change-me")

_client = httpx.Client(
    base_url=DB_API_URL,
    headers={"X-API-Key": API_KEY},
    timeout=10.0,
)


def _call(method: str, path: str, **kwargs):
    try:
        response = _client.request(method, path, **kwargs)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Data service unreachable: {exc}")
    if response.status_code >= 400:
        detail = response.text
        if "application/json" in response.headers.get("content-type", ""):
            detail = response.json().get("detail", detail)
        raise HTTPException(status_code=response.status_code, detail=detail)
    if response.status_code == 204:
        return None
    if not response.content:
        return None
    return response.json()


def get(path: str, **kwargs):
    return _call("GET", path, **kwargs)


def post(path: str, **kwargs):
    return _call("POST", path, **kwargs)


def put(path: str, **kwargs):
    return _call("PUT", path, **kwargs)


def delete(path: str, **kwargs):
    return _call("DELETE", path, **kwargs)