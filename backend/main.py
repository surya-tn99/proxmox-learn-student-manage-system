from config import PROXMOX_IP, database, frontend_url

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, courses, dashboard, grades, students

app = FastAPI(title="backend", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(grades.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}


# Optional: expose database config for debugging
@app.get("/config/database")
def config_db():
    return {
        "database_host": database['host'],
        "database_port": database['port'],
        "connection_string": database['connection_string']
    }