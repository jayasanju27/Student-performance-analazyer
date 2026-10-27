import csv
import io
import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.academic import Student, Subject, Faculty, FacultySubject
from ..models.performance import Marks, InternalAssessment, UniversityExamResult
from ..models.user import User
from ..schemas.performance import MarksCreate, MarksUpdate, MarksOut, InternalAssessmentCreate
from ..services.auth import get_current_user, require_role
from ..services.grading import get_grade_for_percentage, recalculate_student_results
from ..services.risk_engine import evaluate_student_risk
from ..services.audit_service import record_audit_log

router = APIRouter(prefix="/api/marks", tags=["Marks"])

def enrich_mark(m: Marks) -> dict:
    return {
        "id": m.id,
        "student_id": m.student_id,
        "subject_id": m.subject_id,
        "semester": m.semester,
        "internal_marks": m.internal_marks,
        "external_marks": m.external_marks,
        "total_marks": m.total_marks,
        "grade": m.grade,
        "grade_point": m.grade_point,
        "is_passed": m.is_passed,
        "subject_code": m.subject.code if m.subject else "",
        "subject_name": m.subject.name if m.subject else "",
        "credits": m.subject.credits if m.subject else 4,
        "student_name": m.student.full_name if m.student else "",
        "register_number": m.student.register_number if m.student else ""
    }

@router.get("/student/{student_id}", response_model=List[MarksOut])
def get_student_marks(
    student_id: int,
    semester: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enforce: student can only view their own marks
    if current_user.role == "student":
        stud = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not stud or stud.id != student_id:
            raise HTTPException(status_code=403, detail="Students can only access their own academic records")

    query = db.query(Marks).filter(Marks.student_id == student_id)
    if semester:
        query = query.filter(Marks.semester == semester)
    marks = query.all()
    return [enrich_mark(m) for m in marks]

@router.get("/subject/{subject_id}", response_model=List[MarksOut])
def get_subject_marks(
    subject_id: int,
    semester: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "faculty"]))
):
    # Enforce: faculty can only view marks for assigned subjects
    if current_user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if faculty:
            assigned = db.query(FacultySubject).filter(
                FacultySubject.faculty_id == faculty.id,
                FacultySubject.subject_id == subject_id
            ).first()
            if not assigned:
                raise HTTPException(status_code=403, detail="Faculty can only access marks for assigned subjects")

    query = db.query(Marks).filter(Marks.subject_id == subject_id)
    if semester:
        query = query.filter(Marks.semester == semester)
    marks = query.all()
    return [enrich_mark(m) for m in marks]

@router.post("", response_model=MarksOut)
def record_marks(
    payload: MarksCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "faculty"]))
):
    # Enforce: faculty can only enter marks for assigned subjects
    if current_user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if faculty:
            assigned = db.query(FacultySubject).filter(
                FacultySubject.faculty_id == faculty.id,
                FacultySubject.subject_id == payload.subject_id
            ).first()
            if not assigned:
                raise HTTPException(status_code=403, detail="Faculty can only record marks for assigned subjects")

    subject = db.query(Subject).filter(Subject.id == payload.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Validate max marks
    if payload.internal_marks > subject.max_internal or payload.internal_marks < 0:
        raise HTTPException(status_code=400, detail=f"Internal marks must be between 0 and {subject.max_internal}")
    if payload.external_marks > subject.max_external or payload.external_marks < 0:
        raise HTTPException(status_code=400, detail=f"External marks must be between 0 and {subject.max_external}")

    total = round(payload.internal_marks + payload.external_marks, 1)
    grade, gp, is_passed = get_grade_for_percentage(total, db)
    # Check minimum external cutoff (40%)
    if payload.external_marks < (subject.max_external * 0.40):
        is_passed = False
        grade = "F"
        gp = 0.0

    existing = db.query(Marks).filter(
        Marks.student_id == payload.student_id,
        Marks.subject_id == payload.subject_id,
        Marks.semester == payload.semester
    ).first()

    if existing:
        existing.internal_marks = payload.internal_marks
        existing.external_marks = payload.external_marks
        existing.total_marks = total
        existing.grade = grade
        existing.grade_point = gp
        existing.is_passed = is_passed
        m_rec = existing
    else:
        m_rec = Marks(
            student_id=payload.student_id,
            subject_id=payload.subject_id,
            semester=payload.semester,
            internal_marks=payload.internal_marks,
            external_marks=payload.external_marks,
            total_marks=total,
            grade=grade,
            grade_point=gp,
            is_passed=is_passed
        )
        db.add(m_rec)

    db.commit()
    db.refresh(m_rec)

    # Recalculate SGPA & Risk
    recalculate_student_results(student.id, db)
    evaluate_student_risk(student.id, db)

    record_audit_log(
        db,
        action="RECORD_MARKS",
        entity_type="MARKS",
        details=f"Recorded marks for {student.register_number} in {subject.code}: Total {total} (Grade: {grade})",
        user_id=current_user.id,
        user_email=current_user.email,
        role=current_user.role
    )

    return enrich_mark(m_rec)

@router.get("/arrears")
def get_arrears_list(
    filter: Optional[str] = Query("All"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Marks).filter((Marks.is_passed == False) | (Marks.grade == "F"))
    if current_user.role == "student":
        stud = db.query(Student).filter(Student.user_id == current_user.id).first()
        if stud:
            query = query.filter(Marks.student_id == stud.id)
        else:
            return []
    elif current_user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if faculty and faculty.department_id:
            query = query.join(Student).filter(Student.department_id == faculty.department_id)

    failed_marks = query.all()
    university_query = db.query(UniversityExamResult)
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student:
            return []
        university_query = university_query.filter(UniversityExamResult.student_id == student.id)
    elif current_user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if faculty and faculty.department_id:
            university_query = university_query.join(Student).filter(Student.department_id == faculty.department_id)

    university_attempts = university_query.order_by(
        UniversityExamResult.imported_at.asc(),
        UniversityExamResult.id.asc()
    ).all()
    attempts_by_subject = {}
    for attempt in university_attempts:
        key = (attempt.student_id, attempt.subject_id)
        attempts_by_subject.setdefault(key, []).append(attempt)

    arrears = []
    for m in failed_marks:
        st = m.student
        sub = m.subject
        if not st or not sub:
            continue
        if (st.id, sub.id) in attempts_by_subject:
            continue
        arrear_type = "Current" if m.semester == st.semester else "Previous"
        arrears.append({
            "id": m.id,
            "source": "Marks",
            "student_id": st.id,
            "register_number": st.register_number,
            "student_name": st.full_name,
            "subject_id": sub.id,
            "subject_code": sub.code,
            "subject_name": sub.name,
            "semester_failed": m.semester,
            "type": arrear_type,
            "attempts": 2 if arrear_type == "Previous" else 1,
            "status": "Active" if not m.is_passed else "Cleared",
            "exam_session": "Nov/Dec 2025" if arrear_type == "Previous" else "Apr/May 2026"
        })

    for attempts in attempts_by_subject.values():
        failures = [attempt for attempt in attempts if attempt.result_status == "FAIL"]
        if not failures:
            continue
        latest = attempts[-1]
        student = latest.student
        subject = latest.subject
        arrear_type = "Current" if latest.semester == student.semester else "Previous"
        is_cleared = latest.result_status == "PASS"
        arrears.append({
            "id": -latest.id,
            "source": "University result",
            "student_id": student.id,
            "register_number": student.register_number,
            "student_name": student.full_name,
            "subject_id": subject.id,
            "subject_code": subject.code,
            "subject_name": subject.name,
            "semester_failed": failures[0].semester,
            "type": arrear_type,
            "attempts": len(attempts),
            "status": "Cleared" if is_cleared else "Active",
            "semester_cleared": latest.semester if is_cleared else None,
            "exam_session": latest.exam_session
        })

    if filter == "Active":
        arrears = [a for a in arrears if a["status"] == "Active"]
    elif filter == "Current":
        arrears = [a for a in arrears if a["type"] == "Current" and a["status"] == "Active"]
    elif filter == "Previous":
        arrears = [a for a in arrears if a["type"] == "Previous" and a["status"] == "Active"]
    elif filter == "Cleared":
        arrears = [a for a in arrears if a["status"] == "Cleared"]
    return arrears

@router.post("/arrears/{mark_id}/clear")
def clear_arrear_mark(
    mark_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "faculty"]))
):
    mark = db.query(Marks).filter(Marks.id == mark_id).first()
    if not mark:
        raise HTTPException(status_code=404, detail="Arrear mark not found")
    mark.external_marks = 45.0
    mark.total_marks = round(mark.internal_marks + 45.0, 1)
    grade, gp, is_passed = get_grade_for_percentage(mark.total_marks, db)
    mark.grade = grade
    mark.grade_point = gp
    mark.is_passed = True
    db.commit()
    db.refresh(mark)
    recalculate_student_results(mark.student_id, db)
    evaluate_student_risk(mark.student_id, db)

    record_audit_log(
        db,
        action="CLEAR_ARREAR",
        entity_type="MARKS",
        details=f"Supplementary cleared for student {mark.student.register_number} in {mark.subject.code}: New Grade {grade}",
        user_id=current_user.id,
        user_email=current_user.email,
        role=current_user.role
    )
    return {"message": "Arrear successfully cleared and results recalculated", "mark": enrich_mark(mark)}

def ensure_faculty_subject_access(current_user: User, subject_id: int, db: Session):
    if current_user.role != "faculty":
        return
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=403, detail="Faculty profile is required to access assessment records")
    assignment = db.query(FacultySubject).filter(
        FacultySubject.faculty_id == faculty.id,
        FacultySubject.subject_id == subject_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=403, detail="Faculty can only access assigned subjects")


@router.get("/ia/{subject_id}/{semester}")
def get_ia_marks(
    subject_id: int,
    semester: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    ensure_faculty_subject_access(current_user, subject_id, db)

    # Find students who have an IA record for this subject or fall back to department/all students
    student_ids_with_ia = [
        r[0] for r in db.query(InternalAssessment.student_id).filter(
            InternalAssessment.subject_id == subject_id
        ).distinct().all()
    ]
    if student_ids_with_ia:
        students = db.query(Student).filter(Student.id.in_(student_ids_with_ia)).all()
    else:
        students = db.query(Student).filter(
            Student.department_id == subject.department_id
        ).all()
        if not students:
            students = db.query(Student).all()

    if current_user.role == "student":
        stud = db.query(Student).filter(Student.user_id == current_user.id).first()
        if stud:
            students = [s for s in students if s.id == stud.id]
        else:
            students = []

    assessments = db.query(InternalAssessment).filter(
        InternalAssessment.subject_id == subject_id,
        InternalAssessment.student_id.in_([student.id for student in students])
    ).all() if students else []
    assessments_by_student = {assessment.student_id: assessment for assessment in assessments}

    out = []
    for st in students:
        assessment = assessments_by_student.get(st.id)
        ia1 = assessment.ia1_mark if assessment else None
        ia2 = assessment.ia2_mark if assessment else None
        ia1_max = assessment.max_ia1 if assessment else 50
        ia2_max = assessment.max_ia2 if assessment else 50
        complete = ia1 is not None and ia2 is not None
        diff = round(ia2 - ia1, 1) if complete else None
        converted = round((((ia1 / ia1_max + ia2 / ia2_max) / 2.0) * subject.max_internal), 1) if complete else None
        out.append({
            "id": assessment.id if assessment else st.id,
            "student_id": st.id,
            "register_number": st.register_number,
            "student_name": st.full_name,
            "subject_id": subject_id,
            "semester": semester,
            "ia1_mark": ia1,
            "ia1_max": ia1_max,
            "ia2_mark": ia2,
            "ia2_max": ia2_max,
            "converted_internal": converted,
            "ia_diff": diff,
            "trend": "Pending" if not complete else ("Improved" if diff > 0 else ("Declined" if diff < 0 else "Steady"))
        })
    return out

@router.post("/ia")
def record_ia_mark(
    payload: InternalAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "faculty"]))
):
    ensure_faculty_subject_access(current_user, payload.subject_id, db)
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    subject = db.query(Subject).filter(Subject.id == payload.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    if payload.ia1_mark > payload.ia1_max or payload.ia2_mark > payload.ia2_max:
        raise HTTPException(status_code=400, detail="IA marks cannot exceed their configured maximum")

    assessment = db.query(InternalAssessment).filter(
        InternalAssessment.student_id == payload.student_id,
        InternalAssessment.subject_id == payload.subject_id,
        InternalAssessment.semester == payload.semester
    ).first()
    if assessment is None:
        assessment = InternalAssessment(
            student_id=payload.student_id,
            subject_id=payload.subject_id,
            semester=payload.semester,
            ia1_mark=payload.ia1_mark,
            ia2_mark=payload.ia2_mark,
            max_ia1=payload.ia1_max,
            max_ia2=payload.ia2_max,
        )
        db.add(assessment)
    else:
        assessment.ia1_mark = payload.ia1_mark
        assessment.ia2_mark = payload.ia2_mark
        assessment.max_ia1 = payload.ia1_max
        assessment.max_ia2 = payload.ia2_max

    db.commit()
    db.refresh(assessment)
    converted = round((((payload.ia1_mark / payload.ia1_max + payload.ia2_mark / payload.ia2_max) / 2.0) * subject.max_internal), 1)
    diff = round(payload.ia2_mark - payload.ia1_mark, 1)
    record_audit_log(
        db,
        action="RECORD_IA_MARKS",
        entity_type="INTERNAL_ASSESSMENT",
        details=f"Saved IA marks for {student.register_number} in {subject.code}: IA1={payload.ia1_mark}, IA2={payload.ia2_mark}",
        user_id=current_user.id,
        user_email=current_user.email,
        role=current_user.role
    )
    return {
        "id": assessment.id,
        "student_id": payload.student_id,
        "register_number": student.register_number,
        "student_name": student.full_name,
        "subject_id": payload.subject_id,
        "semester": payload.semester,
        "ia1_mark": payload.ia1_mark,
        "ia1_max": payload.ia1_max,
        "ia2_mark": payload.ia2_mark,
        "ia2_max": payload.ia2_max,
        "converted_internal": converted,
        "ia_diff": diff,
        "trend": "Improved" if diff > 0 else ("Declined" if diff < 0 else "Steady")
    }


@router.get("/ia/template")
def download_ia_template():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["RegNo", "Name", "Subject", "IA1", "IA2", "MaxMarks"])
    writer.writerow(["REG2026CSE001", "Aditya Verma", "CS301", 42, 46, 50])
    writer.writerow(["REG2026CSE002", "Ananya Krishnan", "CS301", 44, 47, 50])
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=academiq_ia_template.csv"}
    )


def resolve_subject(raw_value: str, all_subjects: List[Subject]) -> Optional[Subject]:
    if not raw_value:
        return None
    val = str(raw_value).strip()
    if not val or val.upper() == "NAN":
        return None
    val_lower = val.lower()

    # 1. Exact match by subject code (case-insensitive)
    for sub in all_subjects:
        if sub.code.strip().lower() == val_lower:
            return sub

    # 2. Exact match by subject name (case-insensitive)
    for sub in all_subjects:
        if sub.name.strip().lower() == val_lower:
            return sub

    # 3. Match label "CODE - Name (Sem N)" or "CODE - Name" (case-insensitive)
    for sub in all_subjects:
        label = f"{sub.code} - {sub.name} (Sem {sub.semester})".lower()
        if label == val_lower:
            return sub
        label_no_sem = f"{sub.code} - {sub.name}".lower()
        if label_no_sem == val_lower:
            return sub

    # 4. Extract code if value starts with "CODE - " or "CODE: "
    parts = val.split(" - ", 1)
    if len(parts) == 2:
        code_part = parts[0].strip().lower()
        for sub in all_subjects:
            if sub.code.strip().lower() == code_part:
                return sub

    # 5. Check if val starts with code
    for sub in all_subjects:
        code_lower = sub.code.strip().lower()
        if val_lower.startswith(code_lower + " ") or val_lower.startswith(code_lower + "-"):
            return sub

    # 6. Fallback substring match on name
    for sub in all_subjects:
        if sub.name.strip().lower() in val_lower or val_lower in sub.name.strip().lower():
            return sub

    return None


@router.post("/ia/import")
async def import_ia_marks(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "faculty"]))
):
    filename = (file.filename or "").lower()
    contents = await file.read()
    try:
        if filename.endswith(".csv"):
            frame = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith((".xlsx", ".xls")):
            xl = pd.ExcelFile(io.BytesIO(contents))
            target_sheet = 0
            for sname in xl.sheet_names:
                if "ia mark" in sname.lower() or "ia_mark" in sname.lower():
                    target_sheet = sname
                    break
            frame = pd.read_excel(xl, sheet_name=target_sheet)
        else:
            raise HTTPException(status_code=400, detail="Upload a CSV or Excel file (.csv, .xlsx, .xls)")
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Could not read the assessment file: {error}") from error

    columns = {
        str(column).strip().lower().replace(" ", "").replace("_", ""): column
        for column in frame.columns
    }
    required = {"regno", "name", "subject", "ia1", "ia2", "maxmarks"}
    missing = sorted(required - columns.keys())
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing)}"
        )

    all_subjects = db.query(Subject).all()
    students_by_reg = {s.register_number.upper(): s for s in db.query(Student).all()}

    unknown_subjects = set()
    unknown_regnos = set()
    parsed_rows = []
    seen = set()

    for index, (_, row) in enumerate(frame.iterrows(), start=2):
        reg_val = row[columns["regno"]]
        register_number = "" if pd.isna(reg_val) else str(reg_val).strip().upper()
        name_val = row[columns["name"]]
        student_name = "" if pd.isna(name_val) else str(name_val).strip()
        sub_val = row[columns["subject"]]
        subject_str = "" if pd.isna(sub_val) else str(sub_val).strip()

        if not register_number or register_number == "NAN":
            unknown_regnos.add(f"(empty at row {index})")
            continue

        student = students_by_reg.get(register_number)
        if not student:
            unknown_regnos.add(register_number)

        subject = resolve_subject(subject_str, all_subjects)
        if not subject:
            unknown_subjects.add(subject_str if subject_str else f"(empty at row {index})")

        if not student or not subject:
            continue

        try:
            ia1 = float(row[columns["ia1"]])
            ia2 = float(row[columns["ia2"]])
            max_marks = float(row[columns["maxmarks"]])
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail=f"Row {index}: IA1, IA2, and MaxMarks must be numbers")

        if not 0 < max_marks <= 100 or not 0 <= ia1 <= max_marks or not 0 <= ia2 <= max_marks:
            raise HTTPException(status_code=400, detail=f"Row {index}: marks must be between 0 and MaxMarks (0–100)")

        key = (student.id, subject.id, subject.semester)
        if key in seen:
            continue
        seen.add(key)
        parsed_rows.append((student, subject, ia1, ia2, max_marks))

    # If anything was not found, list all unknown subjects and RegNos once in the error message
    if unknown_subjects or unknown_regnos:
        error_parts = []
        if unknown_subjects:
            error_parts.append(f"Unknown subjects: {', '.join(sorted(unknown_subjects))}")
        if unknown_regnos:
            error_parts.append(f"Unknown RegNos: {', '.join(sorted(unknown_regnos))}")
        raise HTTPException(status_code=400, detail="; ".join(error_parts))

    try:
        for student, subject, ia1, ia2, max_marks in parsed_rows:
            assessment = db.query(InternalAssessment).filter(
                InternalAssessment.student_id == student.id,
                InternalAssessment.subject_id == subject.id,
                InternalAssessment.semester == subject.semester
            ).first()
            if assessment is None:
                assessment = InternalAssessment(
                    student_id=student.id,
                    subject_id=subject.id,
                    semester=subject.semester
                )
                db.add(assessment)
            assessment.ia1_mark = ia1
            assessment.ia2_mark = ia2
            assessment.max_ia1 = max_marks
            assessment.max_ia2 = max_marks

            # Synchronize converted internal marks into Marks table
            converted_int = round((((ia1 / max_marks + ia2 / max_marks) / 2.0) * subject.max_internal), 1)
            mark = db.query(Marks).filter(
                Marks.student_id == student.id,
                Marks.subject_id == subject.id,
                Marks.semester == subject.semester
            ).first()
            if mark is None:
                mark = Marks(
                    student_id=student.id,
                    subject_id=subject.id,
                    semester=subject.semester,
                    internal_marks=converted_int,
                    external_marks=0.0,
                    total_marks=converted_int,
                    grade="F",
                    grade_point=0.0,
                    is_passed=False
                )
                db.add(mark)
            else:
                mark.internal_marks = converted_int
                mark.total_marks = round(mark.internal_marks + mark.external_marks, 1)
                grade, gp, is_passed = get_grade_for_percentage(mark.total_marks, db)
                mark.grade = grade
                mark.grade_point = gp
                mark.is_passed = is_passed

        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "imported_count": len(parsed_rows),
        "message": f"Successfully imported {len(parsed_rows)} IA records."
    }
