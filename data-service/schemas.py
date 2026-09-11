from datetime import date
from typing import Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    username: str
    role: str = "student"


class UserCreate(UserBase):
    hashed_password: str


class UserOut(BaseModel):
    id: int
    username: str
    role: str
    student_id: Optional[int] = None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class StudentBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    enrollment_date: Optional[date] = None


class StudentCreate(StudentBase):
    pass


class StudentOut(StudentBase):
    id: int

    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    credits: int = 3


class CourseCreate(CourseBase):
    pass


class CourseOut(CourseBase):
    id: int

    class Config:
        from_attributes = True


class GradeBase(BaseModel):
    student_id: int
    course_id: int
    marks: int
    grade: str


class GradeCreate(GradeBase):
    pass


class GradeOut(GradeBase):
    id: int

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_students: int
    total_courses: int
    total_grades: int
    avg_marks: float