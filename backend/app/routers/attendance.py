from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.academic import Student, Subject, Faculty, FacultySubject
from ..models.performance import Attendance
from ..models.user import User
from ..schemas.performance import AttendanceCreate, AttendanceOut
from ..services.auth import get_current_user, require_role
from ..services.risk_engine import evaluate_student_risk
from ..services.audit_service import record_audit_log

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

def enrich_attendance(a: Attendance) -> dict:
    return {
        "id": a.id,
        "student_id": a.student_id,
        "subject_id": a.subject_id,
        "semester": a.semester,
        "classes_held": a.classes_held,
        "classes_attended": a.classes_attended,
        "attendance_percentage": a.attendance_percentage,
        "subject_code": a.subject.code if a.subject else "",
        "subject_name": a.subject.name if a.subject else "",
        "student_name": a.student.full_name if a.student else "",
        "register_number": a.student.register_number if a.student else ""
    }

@router.get("/student/{student_id}", response_model=List[AttendanceOut])
def get_student_attendance(
    student_id: int,
    semester: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enforce: student can only view their own attendance
    if current_user.role == "student":
        stud = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not stud or stud.id != student_id:
            raise HTTPException(status_code=403, detail="Students can only access their own attendance records")

    query = db.query(Attendance).filter(Attendance.student_id == student_id)
    if semester:
        query = query.filter(Attendance.semester == semester)
    records = query.all()
    return [enrich_attendance(a) for a in records]

@router.post("", response_model=AttendanceOut)
def record_attendance(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "faculty"]))
):
    # Enforce: faculty can only update attendance for assigned subjects
    if current_user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if faculty:
            assigned = db.query(FacultySubject).filter(
                FacultySubject.faculty_id == faculty.id,
                FacultySubject.subject_id == payload.subject_id
            ).first()
            if not assigned:
                raise HTTPException(status_code=403, detail="Faculty can only record attendance for assigned subjects")

    if payload.classes_held <= 0:
        raise HTTPException(status_code=400, detail="Classes held must be greater than 0")
    if payload.classes_attended > payload.classes_held:
        raise HTTPException(status_code=400, detail="Attended classes cannot exceed classes held")

    pct = round((payload.classes_attended / payload.classes_held) * 100.0, 1)

    existing = db.query(Attendance).filter(
        Attendance.student_id == payload.student_id,
        Attendance.subject_id == payload.subject_id,
        Attendance.semester == payload.semester
    ).first()


    if existing:
        existing.classes_held = payload.classes_held
        existing.classes_attended = payload.classes_attended
        existing.attendance_percentage = pct
        rec = existing
    else:
        rec = Attendance(
            student_id=payload.student_id,
            subject_id=payload.subject_id,
            semester=payload.semester,
            classes_held=payload.classes_held,
            classes_attended=payload.classes_attended,
            attendance_percentage=pct
        )
        db.add(rec)

    db.commit()
    db.refresh(rec)

    evaluate_student_risk(payload.student_id, db)

    student = db.query(Student).filter(Student.id == payload.student_id).first()
    subject = db.query(Subject).filter(Subject.id == payload.subject_id).first()

    record_audit_log(
        db,
        action="RECORD_ATTENDANCE",
        entity_type="ATTENDANCE",
        details=f"Recorded attendance for {student.register_number if student else payload.student_id} in {subject.code if subject else payload.subject_id}: {pct}% ({payload.classes_attended}/{payload.classes_held})",
        user_id=current_user.id,
        user_email=current_user.email,
        role=current_user.role
    )

    return enrich_attendance(rec)

