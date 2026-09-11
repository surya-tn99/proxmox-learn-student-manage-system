from fastapi import APIRouter, Depends

import db_client
from auth import get_current_user, require_admin

router = APIRouter(prefix="/grades")


@router.get("")
def list_grades(user: dict = Depends(get_current_user)):
    if user["role"] == "admin":
        grades = db_client.get("/grades")
    else:
        grades = db_client.get("/grades", params={"student_id": user.get("student_id")})
    students = {s["id"]: s["name"] for s in db_client.get("/students")}
    courses = {c["id"]: c["name"] for c in db_client.get("/courses")}
    for g in grades:
        g["student_name"] = students.get(g["student_id"])
        g["course_name"] = courses.get(g["course_id"])
    return grades


@router.post("", dependencies=[Depends(require_admin)])
def create_grade(payload: dict):
    return db_client.post("/grades", json=payload)


@router.put("/{grade_id}", dependencies=[Depends(require_admin)])
def update_grade(grade_id: int, payload: dict):
    return db_client.put(f"/grades/{grade_id}", json=payload)


@router.delete("/{grade_id}", dependencies=[Depends(require_admin)])
def delete_grade(grade_id: int):
    return db_client.delete(f"/grades/{grade_id}")