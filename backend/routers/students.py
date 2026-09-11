from fastapi import APIRouter, Depends

import db_client
from auth import require_admin

router = APIRouter(prefix="/students", dependencies=[Depends(require_admin)])


@router.get("")
def list_students(q: str = None):
    return db_client.get("/students", params={"q": q} if q else None)


@router.post("")
def create_student(payload: dict):
    return db_client.post("/students", json=payload)


@router.get("/{student_id}")
def get_student(student_id: int):
    return db_client.get(f"/students/{student_id}")


@router.put("/{student_id}")
def update_student(student_id: int, payload: dict):
    return db_client.put(f"/students/{student_id}", json=payload)


@router.delete("/{student_id}")
def delete_student(student_id: int):
    return db_client.delete(f"/students/{student_id}")