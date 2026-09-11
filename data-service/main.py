from dotenv import load_dotenv

load_dotenv()

from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import require_api_key, verify_password
from database import Base, SessionLocal, engine, get_db
from models import Course, Grade, Student, User
from schemas import (
    CourseCreate,
    CourseOut,
    DashboardStats,
    GradeCreate,
    GradeOut,
    LoginRequest,
    StudentCreate,
    StudentOut,
    UserCreate,
    UserOut,
)
from seed import seed

Base.metadata.create_all(bind=engine)


def seed_if_empty() -> None:
    db = SessionLocal()
    try:
        if db.query(User).first() is None:
            seed(db)
    finally:
        db.close()


seed_if_empty()

app = FastAPI(title="data-service", docs_url="/docs")


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------- users
@app.post("/users", response_model=UserOut, dependencies=[Depends(require_api_key)])
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    user = User(username=payload.username, hashed_password=payload.hashed_password, role=payload.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/login", response_model=UserOut)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return user


# ---------------------------------------------------------------- students
@app.get("/students", response_model=List[StudentOut], dependencies=[Depends(require_api_key)])
def list_students(db: Session = Depends(get_db), q: Optional[str] = Query(None)):
    query = db.query(Student)
    if q:
        pattern = f"%{q}%"
        query = query.filter(Student.name.ilike(pattern) | Student.email.ilike(pattern))
    return query.order_by(Student.name).all()


@app.post("/students", response_model=StudentOut, dependencies=[Depends(require_api_key)])
def create_student(payload: StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(Student).filter(Student.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    student = Student(**payload.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@app.get("/students/{student_id}", response_model=StudentOut, dependencies=[Depends(require_api_key)])
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.put("/students/{student_id}", response_model=StudentOut, dependencies=[Depends(require_api_key)])
def update_student(student_id: int, payload: StudentCreate, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student


@app.delete("/students/{student_id}", dependencies=[Depends(require_api_key)])
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.query(Grade).filter(Grade.student_id == student_id).delete()
    db.delete(student)
    db.commit()
    return {"deleted": True}


# ---------------------------------------------------------------- courses
@app.get("/courses", response_model=List[CourseOut], dependencies=[Depends(require_api_key)])
def list_courses(db: Session = Depends(get_db)):
    return db.query(Course).order_by(Course.name).all()


@app.post("/courses", response_model=CourseOut, dependencies=[Depends(require_api_key)])
def create_course(payload: CourseCreate, db: Session = Depends(get_db)):
    existing = db.query(Course).filter(Course.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course code already exists")
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@app.get("/courses/{course_id}", response_model=CourseOut, dependencies=[Depends(require_api_key)])
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@app.put("/courses/{course_id}", response_model=CourseOut, dependencies=[Depends(require_api_key)])
def update_course(course_id: int, payload: CourseCreate, db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(course, key, value)
    db.commit()
    db.refresh(course)
    return course


@app.delete("/courses/{course_id}", dependencies=[Depends(require_api_key)])
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.query(Grade).filter(Grade.course_id == course_id).delete()
    db.delete(course)
    db.commit()
    return {"deleted": True}


# ---------------------------------------------------------------- grades
@app.get("/grades", response_model=List[GradeOut], dependencies=[Depends(require_api_key)])
def list_grades(
    db: Session = Depends(get_db),
    student_id: Optional[int] = Query(None),
    course_id: Optional[int] = Query(None),
):
    query = db.query(Grade)
    if student_id is not None:
        query = query.filter(Grade.student_id == student_id)
    if course_id is not None:
        query = query.filter(Grade.course_id == course_id)
    return query.order_by(Grade.student_id, Grade.course_id).all()


@app.post("/grades", response_model=GradeOut, dependencies=[Depends(require_api_key)])
def create_grade(payload: GradeCreate, db: Session = Depends(get_db)):
    if not db.get(Student, payload.student_id):
        raise HTTPException(status_code=404, detail="Student not found")
    if not db.get(Course, payload.course_id):
        raise HTTPException(status_code=404, detail="Course not found")
    existing = (
        db.query(Grade)
        .filter(Grade.student_id == payload.student_id, Grade.course_id == payload.course_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Grade already exists for this student and course")
    grade = Grade(**payload.model_dump())
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade


@app.put("/grades/{grade_id}", response_model=GradeOut, dependencies=[Depends(require_api_key)])
def update_grade(grade_id: int, payload: GradeCreate, db: Session = Depends(get_db)):
    grade = db.get(Grade, grade_id)
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(grade, key, value)
    db.commit()
    db.refresh(grade)
    return grade


@app.delete("/grades/{grade_id}", dependencies=[Depends(require_api_key)])
def delete_grade(grade_id: int, db: Session = Depends(get_db)):
    grade = db.get(Grade, grade_id)
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    db.delete(grade)
    db.commit()
    return {"deleted": True}


# ---------------------------------------------------------------- stats
@app.get("/dashboard/stats", response_model=DashboardStats, dependencies=[Depends(require_api_key)])
def dashboard_stats(db: Session = Depends(get_db)):
    students = db.query(Student).count()
    courses = db.query(Course).count()
    grades = db.query(Grade).count()
    avg_marks = db.query(func.avg(Grade.marks)).first()[0] or 0
    return DashboardStats(
        total_students=students,
        total_courses=courses,
        total_grades=grades,
        avg_marks=round(avg_marks, 2),
    )