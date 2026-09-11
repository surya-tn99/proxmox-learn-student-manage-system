import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "..", "data", "student.db"))

DB_DIR = os.path.dirname(os.path.abspath(DB_PATH))
os.makedirs(DB_DIR, exist_ok=True)

engine = create_engine(
    f"sqlite:///{os.path.abspath(DB_PATH)}",
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()