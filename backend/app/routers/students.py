import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi import File, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.academic import Student, Department
from ..models.performance import Marks, Attendance, SemesterResult, RiskAnalysis, InternalAssessment
from ..models.auth_session import AuthSession
from ..models.user import User
from ..schemas.student import StudentCreate, StudentUpdate, StudentOut, StudentDetailOut
from ..services.auth import get_current_user, require_role, get_password_hash
from ..services.risk_engine import evaluate_student_risk
from ..services.grading import recalculate_student_results
from ..services.audit_service import record_audit_log
from ..models.academic import Faculty

router = APIRouter(prefix="/api/students", tags=["Students"])

def enrich_student_summary(student: Student, db: Session) -> dict:
    dept_name = student.department.name if student.department else "Engineering"
    dept_code = student.department.code if student.department else "ENG"

    # Latest CGPA
    latest_res = db.query(SemesterResult).filter(
        SemesterResult.student_id == student.id
    ).order_by(SemesterResult.semester.desc()).first()
    
    cgpa = latest_res.cgpa if latest_res else 0.0
    latest_sgpa = latest_res.sgpa if latest_res else 0.0
    status = latest_res.result_status if latest_res else "PASS"

    # Attendance
    att_records = db.query(Attendance).filter(Attendance.student_id == student.id).all()
    if att_records:
        held = sum(a.classes_held for a in att_records)
        att = sum(a.classes_attended for a in att_records)
        attendance_pct = round((att / held * 100), 1) if held > 0 else 85.0
    else:
        attendance_pct = 85.0

    # Risk level
    risk = db.query(RiskAnalysis).filter(RiskAnalysis.student_id == student.id).first()
    risk_level = risk.risk_level if risk else "Low"

    return {
        "id": student.id,
        "user_id": student.user_id,
        "register_number": student.register_number,
        "full_name": student.full_name,
        "department_id": student.department_id,
        "department_name": dept_name,
        "department_code": dept_code,
        "year": student.year,
        "semester": student.semester,
        "section": student.section,
        "email": student.email,
        "phone": student.phone,
        "admission_year": student.admission_year,
        "avatar_url": student.avatar_url,
        "cgpa": cgpa,
        "latest_sgpa": latest_sgpa,
        "attendance_pct": attendance_pct,
        "risk_level": risk_level,
        "result_status": status
    }

@router.get("", response_model=List[StudentOut])
def list_students(
    search: Optional[str] = Query(None, description="Search by name or register number"),
    department_id: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    semester: Optional[int] = Query(None),
    section: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enforce role-based visibility:
    # 1. Students can only see their own record
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student:
            return []
        return [enrich_student_summary(student, db)]

    query = db.query(Student)

    # 2. Faculty can access only students in their assigned department
    if current_user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if not faculty or not faculty.department_id:
            raise HTTPException(status_code=403, detail="Faculty department is not configured")
        query = query.filter(Student.department_id == faculty.department_id)

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter((Student.full_name.ilike(s)) | (Student.register_number.ilike(s)))
    if department_id:
        query = query.filter(Student.department_id == department_id)
    if year:
        query = query.filter(Student.year == year)
    if semester:
        query = query.filter(Student.semester == semester)
    if section:
        query = query.filter(Student.section == section)

    students = query.all()
    results = [enrich_student_summary(st, db) for st in students]

    # In-memory filter on computed risk_level / status if requested
    if risk_level and risk_level != "All":
        results = [r for r in results if r["risk_level"].lower() == risk_level.lower()]
    if status and status != "All":
        results = [r for r in results if r["result_status"].lower() == status.lower()]

    return results

@router.get("/{student_id}", response_model=StudentDetailOut)
def get_student_detail(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # If role is student, only allow viewing own profile
    if current_user.role == "student":
        current_student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not current_student or current_student.id != student_id:
            raise HTTPException(status_code=403, detail="Students can only access their own profile")

    # If role is faculty, ensure student is within faculty's department
    if current_user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if not faculty or not faculty.department_id or student.department_id != faculty.department_id:
            raise HTTPException(status_code=403, detail="Faculty can only access students in their assigned department")


    summary = enrich_student_summary(student, db)

    # Risk evaluation
    risk_data = evaluate_student_risk(student.id, db)

    # Detailed marks with subject details
    marks = db.query(Marks).filter(Marks.student_id == student_id).all()
    marks_list = []
    for m in marks:
        marks_list.append({
            "id": m.id,
            "subject_id": m.subject_id,
            "subject_code": m.subject.code if m.subject else "",
            "subject_name": m.subject.name if m.subject else "",
            "credits": m.subject.credits if m.subject else 4,
            "semester": m.semester,
            "internal_marks": m.internal_marks,
            "external_marks": m.external_marks,
            "total_marks": m.total_marks,
            "grade": m.grade,
            "grade_point": m.grade_point,
            "is_passed": m.is_passed
        })

    ia_assessments = db.query(InternalAssessment).filter(
        InternalAssessment.student_id == student_id
    ).order_by(InternalAssessment.semester.asc(), InternalAssessment.subject_id.asc()).all()
    ia_list = []
    for assessment in ia_assessments:
        class_averages = db.query(
            func.avg(InternalAssessment.ia1_mark),
            func.avg(InternalAssessment.ia2_mark)
        ).join(
            Student, Student.id == InternalAssessment.student_id
        ).filter(
            InternalAssessment.subject_id == assessment.subject_id,
            InternalAssessment.semester == assessment.semester,
            Student.department_id == student.department_id,
            Student.semester == student.semester
        ).first()
        ia_list.append({
            "subject_code": assessment.subject.code if assessment.subject else "",
            "subject_name": assessment.subject.name if assessment.subject else "",
            "semester": assessment.semester,
            "ia1_mark": assessment.ia1_mark,
            "ia1_max": assessment.max_ia1,
            "ia2_mark": assessment.ia2_mark,
            "ia2_max": assessment.max_ia2,
            "class_ia1_avg": round(class_averages[0], 1) if class_averages and class_averages[0] is not None else None,
            "class_ia2_avg": round(class_averages[1], 1) if class_averages and class_averages[1] is not None else None,
        })

    # Attendance details
    att = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    att_list = []
    for a in att:
        att_list.append({
            "id": a.id,
            "subject_id": a.subject_id,
            "subject_code": a.subject.code if a.subject else "",
            "subject_name": a.subject.name if a.subject else "",
            "semester": a.semester,
            "classes_held": a.classes_held,
            "classes_attended": a.classes_attended,
            "attendance_percentage": a.attendance_percentage
        })

    # Results details
    res = db.query(SemesterResult).filter(SemesterResult.student_id == student_id).order_by(SemesterResult.semester.asc()).all()
    res_list = [{
        "semester": r.semester,
        "total_credits": r.total_credits,
        "earned_credits": r.earned_credits,
        "sgpa": r.sgpa,
        "cgpa": r.cgpa,
        "result_status": r.result_status
    } for r in res]

    return {
        **summary,
        "contributing_factors": risk_data.get("contributing_factors", []),
        "recommendations": risk_data.get("recommendations", []),
        "risk_score": risk_data.get("risk_score", 0.0),
        "marks": marks_list,
        "ia_assessments": ia_list,
        "attendance": att_list,
        "semester_results": res_list
    }

@router.post("", response_model=StudentOut)
def create_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    # Check if reg exists
    if db.query(Student).filter(Student.register_number == payload.register_number.strip().upper()).first():
        raise HTTPException(status_code=400, detail="Register number already exists")

    # Check email
    if db.query(User).filter(User.email == payload.email.strip().lower()).first():
        raise HTTPException(status_code=400, detail="User with this email already exists")

    register_number = payload.register_number.strip().upper()
    user = User(
        email=payload.email.strip().lower(),
        password_hash=get_password_hash(register_number),
        full_name=payload.full_name,
        role="student",
        is_active=True,
        must_change_password=False,
    )
    db.add(user)
    db.flush()

    student = Student(
        user_id=user.id,
        register_number=register_number,
        full_name=payload.full_name,
        department_id=payload.department_id,
        year=payload.year,
        semester=payload.semester,
        section=payload.section.upper(),
        email=payload.email.strip().lower(),
        phone=payload.phone,
        avatar_url=payload.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={payload.full_name.replace(' ', '')}",
        admission_year=payload.admission_year
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    # Initial risk evaluation
    evaluate_student_risk(student.id, db)

    record_audit_log(
        db,
        action="CREATE_STUDENT",
        entity_type="STUDENT",
        details=f"Created student {student.register_number} ({student.full_name})",
        user_id=admin_user.id,
        user_email=admin_user.email,
        role=admin_user.role
    )

    return enrich_student_summary(student, db)


@router.post("/accounts/bulk")
def bulk_create_or_reset_student_accounts(
    student_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "faculty"])),
):
    if not student_file.filename or not student_file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Upload a CSV file containing the student list")
    contents = student_file.file.read(2_000_001)
    if len(contents) > 2_000_000:
        raise HTTPException(status_code=413, detail="CSV file must be smaller than 2 MB")
    try:
        reader = csv.DictReader(io.StringIO(contents.decode("utf-8-sig")))
        rows = [
            {str(key or "").strip().lower(): (value or "").strip() for key, value in row.items()}
            for row in reader
        ]
    except (UnicodeDecodeError, csv.Error) as error:
        raise HTTPException(status_code=400, detail=f"Unable to read CSV: {error}")
    if not rows:
        raise HTTPException(status_code=400, detail="CSV must contain a header and at least one student row")
    if len(rows) > 500:
        raise HTTPException(status_code=400, detail="Upload no more than 500 students at a time")
    if "register_number" not in rows[0] or "full_name" not in rows[0]:
        raise HTTPException(status_code=400, detail="CSV must include register_number and full_name columns")

    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first() if current_user.role == "faculty" else None
    if current_user.role == "faculty" and not faculty:
        raise HTTPException(status_code=403, detail="Faculty department is not configured")

    prepared = []
    seen_register_numbers = set()
    for line_number, row in enumerate(rows, start=2):
        register_number = row.get("register_number", "").upper()
        full_name = row.get("full_name", "")
        if not register_number or not full_name:
            raise HTTPException(status_code=400, detail=f"Row {line_number}: register_number and full_name are required")
        if len(register_number.encode("utf-8")) > 72:
            raise HTTPException(status_code=400, detail=f"Row {line_number}: register_number is too long for the default password")
        if register_number in seen_register_numbers:
            raise HTTPException(status_code=400, detail=f"Row {line_number}: duplicate register_number {register_number}")
        seen_register_numbers.add(register_number)

        try:
            department_id = int(row["department_id"]) if row.get("department_id") else None
            department_code = row.get("department_code", "").upper()
            department = (
                db.query(Department).filter(Department.id == department_id).first()
                if department_id is not None else
                db.query(Department).filter(Department.code == department_code).first()
            )
            year = int(row.get("year") or 1)
            semester = int(row.get("semester") or 1)
            admission_year = int(row.get("admission_year") or 2026)
        except (KeyError, ValueError):
            raise HTTPException(status_code=400, detail=f"Row {line_number}: invalid department, year, semester, or admission_year")
        if not department:
            raise HTTPException(status_code=400, detail=f"Row {line_number}: department_id or department_code must identify a department")
        if year < 1 or year > 8 or semester < 1 or semester > 12:
            raise HTTPException(status_code=400, detail=f"Row {line_number}: year or semester is outside the supported range")
        if faculty and department.id != faculty.department_id:
            raise HTTPException(status_code=403, detail=f"Row {line_number}: faculty may only manage students in their department")
        email = (row.get("email") or f"{register_number.lower()}@students.academiq.demo").lower()
        prepared.append({
            "register_number": register_number,
            "full_name": full_name,
            "department": department,
            "year": year,
            "semester": semester,
            "section": (row.get("section") or "A").upper(),
            "email": email,
            "phone": row.get("phone") or None,
            "admission_year": admission_year,
        })

    created = 0
    reset = 0
    try:
        for details in prepared:
            student = db.query(Student).filter(Student.register_number == details["register_number"]).first()
            if student and faculty and student.department_id != faculty.department_id:
                raise HTTPException(status_code=403, detail=f"Faculty may not manage {details['register_number']}")
            user = db.query(User).filter(User.id == student.user_id).first() if student else None
            email_owner = db.query(User).filter(User.email == details["email"]).first()
            if email_owner and (not user or email_owner.id != user.id):
                raise HTTPException(status_code=400, detail=f"Email {details['email']} is already in use")
            if student is None:
                if email_owner:
                    raise HTTPException(status_code=400, detail=f"Email {details['email']} is already in use")
                user = User(
                    email=details["email"],
                    password_hash=get_password_hash(details["register_number"]),
                    full_name=details["full_name"],
                    role="student",
                    is_active=True,
                    must_change_password=False,
                )
                db.add(user)
                db.flush()
                student = Student(
                    user_id=user.id,
                    register_number=details["register_number"],
                    full_name=details["full_name"],
                    department_id=details["department"].id,
                    year=details["year"],
                    semester=details["semester"],
                    section=details["section"],
                    email=details["email"],
                    phone=details["phone"],
                    admission_year=details["admission_year"],
                )
                db.add(student)
                created += 1
            else:
                user = user or db.query(User).filter(User.email == student.email).first()
                if user is None:
                    user = User(
                        email=details["email"],
                        password_hash=get_password_hash(details["register_number"]),
                        full_name=details["full_name"],
                        role="student",
                        is_active=True,
                        must_change_password=False,
                    )
                    db.add(user)
                    db.flush()
                    student.user_id = user.id
                    created += 1
                else:
                    if user.role != "student":
                        raise HTTPException(status_code=400, detail=f"Account for {student.register_number} is not a student account")
                    user.email = details["email"]
                    user.full_name = details["full_name"]
                    user.password_hash = get_password_hash(details["register_number"])
                    user.must_change_password = False
                    user.is_active = True
                    reset += 1
                student.full_name = details["full_name"]
                student.department_id = details["department"].id
                student.year = details["year"]
                student.semester = details["semester"]
                student.section = details["section"]
                student.email = details["email"]
                student.phone = details["phone"]
                student.admission_year = details["admission_year"]
        db.commit()
    except Exception:
        db.rollback()
        raise

    record_audit_log(
        db,
        action="BULK_STUDENT_ACCOUNTS",
        entity_type="STUDENT",
        details=f"Created {created} student records and reset {reset} student accounts from CSV",
        user_id=current_user.id,
        user_email=current_user.email,
        role=current_user.role,
    )
    return {
        "message": f"Processed {len(prepared)} student accounts. Default password is each student's register number.",
        "created": created,
        "reset": reset,
    }

@router.put("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    auth_user: User = Depends(require_role(["admin", "faculty"]))
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)
    recalculate_student_results(student.id, db)
    evaluate_student_risk(student.id, db)

    record_audit_log(
        db,
        action="UPDATE_STUDENT",
        entity_type="STUDENT",
        details=f"Updated profile for student {student.register_number} ({student.full_name})",
        user_id=auth_user.id,
        user_email=auth_user.email,
        role=auth_user.role
    )

    return enrich_student_summary(student, db)

@router.delete("/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    reg = student.register_number
    name = student.full_name
    user = db.query(User).filter(User.id == student.user_id).first()
    db.delete(student)
    if user:
        db.query(AuthSession).filter(AuthSession.user_id == user.id).delete(synchronize_session=False)
        db.delete(user)
    db.commit()

    record_audit_log(
        db,
        action="DELETE_STUDENT",
        entity_type="STUDENT",
        details=f"Deleted student {reg} ({name})",
        user_id=admin_user.id,
        user_email=admin_user.email,
        role=admin_user.role
    )

    return {"message": f"Student {reg} deleted successfully"}
