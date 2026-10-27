from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from .database import engine, Base, SessionLocal
from .models import *
from .routers import auth, students, academic, marks, attendance, results, risk, analytics, upload, audit
from .services.seed_data import seed_database, seed_demo_assessment_history_if_empty, ensure_student_accounts, seed_from_csv_files_if_missing
from .services.auth import get_password_hash

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Academic Performance & University Result Analyzer API",
    description="Enterprise University ERP & Academic Performance Analytics System",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(academic.router)
app.include_router(marks.router)
app.include_router(attendance.router)
app.include_router(results.router)
app.include_router(risk.router)
app.include_router(analytics.router)
app.include_router(upload.router)
app.include_router(audit.router)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        if "must_change_password" not in {column["name"] for column in inspect(engine).get_columns("users")}:
            with engine.begin() as connection:
                connection.execute(text(
                    "ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE"
                ))
            for student in db.query(Student).all():
                user = db.query(User).filter(User.id == student.user_id).first()
                if user:
                    user.password_hash = get_password_hash(student.register_number)
                    user.must_change_password = False
            faculty_user = db.query(User).filter(User.email == "faculty@college.com").first()
            if faculty_user and not db.query(User).filter(User.email == "faculty@academiq.demo").first():
                faculty_user.email = "faculty@academiq.demo"
                faculty_user.password_hash = get_password_hash("Faculty@123")
            db.commit()
        db.query(User).filter(
            User.role == "student",
            User.must_change_password.is_(True),
        ).update({User.must_change_password: False}, synchronize_session=False)
        db.commit()
        seed_database(db, force_reset=False)
        seed_from_csv_files_if_missing(db)
        seed_demo_assessment_history_if_empty(db)
        ensure_student_accounts(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "Student Academic Performance & University Result Analyzer API is live and operational",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
