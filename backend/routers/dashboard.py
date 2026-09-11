from fastapi import APIRouter, Depends

import db_client
from auth import require_admin

router = APIRouter(prefix="/dashboard", dependencies=[Depends(require_admin)])


@router.get("/stats")
def dashboard_stats():
    return db_client.get("/dashboard/stats")