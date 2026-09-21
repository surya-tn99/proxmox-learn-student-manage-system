import json
from pathlib import Path
import httpx
from fastapi import HTTPException

# Resolve config.json relative to this script's location
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent  # Goes up from backend/ to project root
CONFIG_FILE = PROJECT_ROOT / 'config.json'

with open(CONFIG_FILE, 'r') as f:
    RAW = json.load(f)

# Database API URL from config.json (data-service IP and port)
# data-service runs on VM 10.10.10.13:8001
DB_API_URL = RAW['services']['database']['internal_ip'] + ':' + str(RAW['services']['database']['internal_port'])

# Extract just the IP:port format
DB_API_URL = f"http://{RAW['services']['database']['internal_ip']}:{RAW['services']['database']['internal_port']}"

API_KEY = "dev-shared-key-change-me"  # Default, or read from config if needed

_client = httpx.Client(
    base_url=DB_API_URL,
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