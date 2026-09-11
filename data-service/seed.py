from datetime import date, timedelta

from sqlalchemy.orm import Session

from auth import hash_password
from models import Course, Grade, Student, User


def seed(db: Session) -> None:
    students = [
        Student(name="Aarav Sharma", email="aarav@example.com", phone="+91 98100 11111", enrollment_date=date.today() - timedelta(days=300)),
        Student(name="Priya Patel", email="priya@example.com", phone="+91 98200 22222", enrollment_date=date.today() - timedelta(days=280)),
        Student(name="Rohan Gupta", email="rohan@example.com", phone="+91 98300 33333", enrollment_date=date.today() - timedelta(days=250)),
        Student(name="Sneha Iyer", email="sneha@example.com", phone="+91 98400 44444", enrollment_date=date.today() - timedelta(days=200)),
        Student(name="Vikram Singh", email="vikram@example.com", phone="+91 98500 55555", enrollment_date=date.today() - timedelta(days=150)),
        Student(name="Ananya Rao", email="ananya@example.com", phone="+91 98600 66666", enrollment_date=date.today() - timedelta(days=120)),
        Student(name="Karan Mehta", email="karan@example.com", phone="+91 98700 77777", enrollment_date=date.today() - timedelta(days=90)),
        Student(name="Divya Nair", email="divya@example.com", phone="+91 98800 88888", enrollment_date=date.today() - timedelta(days=45)),
    ]
    db.add_all(students)
    db.flush()

    users = [
        User(username="admin", hashed_password=hash_password("admin123"), role="admin", student_id=None),
        User(username="student", hashed_password=hash_password("student123"), role="student", student_id=students[0].id),
    ]
    db.add_all(users)

    courses = [
        Course(name="Mathematics", code="MATH101", description="Algebra and calculus basics", credits=4),
        Course(name="Physics", code="PHY101", description="Mechanics and thermodynamics", credits=4),
        Course(name="Computer Science", code="CS101", description="Introduction to programming", credits=5),
        Course(name="English Literature", code="ENG101", description="Reading and comprehension", credits=3),
        Course(name="Chemistry", code="CHEM101", description="Organic and inorganic chemistry", credits=4),
    ]
    db.add_all(courses)
    db.flush()

    marks_per_student = [
        (students[0].id, [85, 92, 78, 88, 74]),
        (students[1].id, [91, 67, 82, 95, 79]),
        (students[2].id, [72, 84, 90, 76, 68]),
        (students[3].id, [96, 88, 93, 85, 90]),
        (students[4].id, [58, 73, 66, 81, 77]),
        (students[5].id, [89, 76, 84, 92, 71]),
        (students[6].id, [64, 69, 75, 70, 82]),
        (students[7].id, [87, 90, 95, 86, 83]),
    ]

    def letter(m: int) -> str:
        if m >= 90:
            return "A"
        if m >= 80:
            return "B"
        if m >= 70:
            return "C"
        if m >= 60:
            return "D"
        return "F"

    grades = []
    for student_id, marks_list in marks_per_student:
        for course_idx, marks in enumerate(marks_list):
            grades.append(
                Grade(
                    student_id=student_id,
                    course_id=courses[course_idx].id,
                    marks=marks,
                    grade=letter(marks),
                )
            )
    db.add_all(grades)
    db.commit()