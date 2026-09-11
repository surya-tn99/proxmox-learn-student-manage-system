from fastapi import APIRouter, Depends

import db_client
from auth import require_admin

router = APIRouter(prefix="/courses", dependencies=[Depends(require_admin)])


@router.get("")
def list_courses():
    return db_client.get("/courses")


@router.post("")
def create_course(payload: dict):
    return db_client.post("/courses", json=payload)


@router.get("/{course_id}")
def get_course(course_id: int):
    return db_client.get(f"/courses/{course_id}")


@router.put("/{course_id}")
def update_course(course_id: int, payload: dict):
    return db_client.put(f"/courses/{course_id}", json=payload)


@router.delete("/{course_id}")
def delete_course(course_id: int):
    return db_client.delete(f"/courses/{course_id}")