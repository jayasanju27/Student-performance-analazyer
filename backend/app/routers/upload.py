import io
import csv
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.academic import Student, Subject, Department
from ..models.performance import Marks, Attendance
from ..schemas.upload import UploadPreviewResponse, UploadRowRecord, BatchCommitRequest
from ..services.auth import require_role
from ..services.grading import get_grade_for_percentage, recalculate_student_results
from ..services.risk_engine import evaluate_student_risk
from .marks import resolve_subject

router = APIRouter(prefix="/api/upload", tags=["CSV/Excel Upload"])

@router.get("/template")
def download_csv_template():
    """
    Returns a sample CSV template with columns and 2 example rows.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Register Number",
        "Student Name",
        "Department Code",
        "Semester",
        "Subject Code",
        "Subject Name",
        "Internal Mark",
        "External Mark",
        "Attendance"
    ])
    writer.writerow(["REG2026CSE001", "Aditya Verma", "CSE", 3, "CS301", "Database Management Systems", 28, 62, 92.5])
    writer.writerow(["REG2026CSE002", "Ananya Krishnan", "CSE", 3, "CS301", "Database Management Systems", 29, 65, 96.0])
    writer.writerow(["REG2026ECE001", "Siddharth Sen", "ECE", 3, "EC301", "Microprocessors & Microcontrollers", 27, 60, 94.0])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=student_marks_template.csv"}
    )

@router.post("/preview", response_model=UploadPreviewResponse)
async def preview_and_validate_upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user = Depends(require_role(["admin", "faculty"]))
):
    """
    Parses and validates CSV or Excel upload rows against the database without saving yet.
    Flags invalid records with specific error descriptions so the user can correct them!
    """
    filename = file.filename.lower()
    contents = await file.read()

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Only CSV or Excel (.xlsx/.xls) files are supported")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    # Normalize column names: strip spaces and convert to lowercase
    col_mapping = {}
    for col in df.columns:
        norm = col.strip().lower().replace(" ", "_").replace("-", "_")
        col_mapping[norm] = col

    def get_val(row, *aliases, default=""):
        for a in aliases:
            if a in col_mapping:
                v = row[col_mapping[a]]
                if pd.notna(v):
                    return v
        return default

    # Pre-fetch lookup caches
    students_by_reg = {s.register_number.upper(): s for s in db.query(Student).all()}
    all_subjects = db.query(Subject).all()
    subjects_by_code = {sub.code.upper(): sub for sub in all_subjects}
    departments_by_code = {d.code.upper(): d for d in db.query(Department).all()}

    preview_records: List[UploadRowRecord] = []
    valid_count = 0
    invalid_count = 0

    for idx, (_, row) in enumerate(df.iterrows()):
        row_num = idx + 2  # account for header
        reg = str(get_val(row, "register_number", "reg_number", "reg_no", "regno", default="")).strip().upper()
        name = str(get_val(row, "student_name", "name", "student", default="")).strip()
        dept_code = str(get_val(row, "department_code", "dept_code", "department", default="CSE")).strip().upper()
        
        try:
            sem = int(float(get_val(row, "semester", "sem", default=1)))
        except (ValueError, TypeError):
            sem = 1

        raw_sub = str(get_val(row, "subject", "subject_code", "sub_code", "course_code", "subject_name", default="")).strip()
        sub_code = str(get_val(row, "subject_code", "sub_code", "course_code", default="")).strip().upper()
        sub_name = str(get_val(row, "subject_name", "sub_name", "course_name", default="")).strip()

        # Parse marks & attendance
        errs = []
        try:
            int_mark = float(get_val(row, "internal_mark", "internal", "internals", default=0))
        except (ValueError, TypeError):
            int_mark = 0.0
            errs.append("Internal marks must be a valid number")

        try:
            ext_mark = float(get_val(row, "external_mark", "external", "externals", default=0))
        except (ValueError, TypeError):
            ext_mark = 0.0
            errs.append("External marks must be a valid number")

        try:
            att_val = float(get_val(row, "attendance", "att", "attendance_percentage", default=85.0))
        except (ValueError, TypeError):
            att_val = 85.0

        # Validate register number
        if not reg:
            errs.append("Register Number is required")
        elif reg not in students_by_reg:
            errs.append(f"Student '{reg}' not found in database")

        # Validate subject code using flexible resolver
        subj_obj = resolve_subject(raw_sub or sub_code, all_subjects) if (raw_sub or sub_code) else None
        if not raw_sub and not sub_code:
            errs.append("Subject Code is required")
        elif not subj_obj:
            errs.append(f"Subject '{raw_sub or sub_code}' not found in curriculum")
        else:
            sub_code = subj_obj.code
            if not sub_name:
                sub_name = subj_obj.name
            if int_mark < 0 or int_mark > subj_obj.max_internal:
                errs.append(f"Internal marks ({int_mark}) out of range [0 - {subj_obj.max_internal}]")
            if ext_mark < 0 or ext_mark > subj_obj.max_external:
                errs.append(f"External marks ({ext_mark}) out of range [0 - {subj_obj.max_external}]")

        if att_val < 0 or att_val > 100:
            errs.append(f"Attendance ({att_val}%) must be between 0 and 100")

        is_valid = len(errs) == 0
        if is_valid:
            valid_count += 1
        else:
            invalid_count += 1

        preview_records.append(UploadRowRecord(
            row_number=row_num,
            register_number=reg,
            student_name=name or (students_by_reg[reg].full_name if reg in students_by_reg else "N/A"),
            department_code=dept_code,
            semester=sem,
            subject_code=sub_code,
            subject_name=sub_name,
            internal_marks=int_mark,
            external_marks=ext_mark,
            attendance=att_val,
            is_valid=is_valid,
            error_message="; ".join(errs) if errs else None
        ))

    return UploadPreviewResponse(
        total_records=len(preview_records),
        valid_records_count=valid_count,
        invalid_records_count=invalid_count,
        records=preview_records
    )

@router.post("/commit")
def commit_upload_records(
    payload: BatchCommitRequest,
    db: Session = Depends(get_db),
    user = Depends(require_role(["admin", "faculty"]))
):
    """
    Saves validated student marks and attendance records into the database,
    and updates GPA / Risk calculations automatically!
    """
    imported_count = 0
    updated_students = set()

    for rec in payload.records:
        if not rec.is_valid:
            continue  # Skip uncorrected invalid rows

        student = db.query(Student).filter(Student.register_number == rec.register_number.upper()).first()
        subject = db.query(Subject).filter(Subject.code == rec.subject_code.upper()).first()
        if not subject:
            subject = resolve_subject(rec.subject_code, db.query(Subject).all())

        if not student or not subject:
            continue

        tot = round(rec.internal_marks + rec.external_marks, 1)
        grade, gp, is_passed = get_grade_for_percentage(tot, db)
        if rec.external_marks < (subject.max_external * 0.40):
            is_passed = False
            grade = "F"
            gp = 0.0

        # Save or update Marks
        m_rec = db.query(Marks).filter(
            Marks.student_id == student.id,
            Marks.subject_id == subject.id,
            Marks.semester == rec.semester
        ).first()

        if m_rec:
            m_rec.internal_marks = rec.internal_marks
            m_rec.external_marks = rec.external_marks
            m_rec.total_marks = tot
            m_rec.grade = grade
            m_rec.grade_point = gp
            m_rec.is_passed = is_passed
        else:
            m_rec = Marks(
                student_id=student.id,
                subject_id=subject.id,
                semester=rec.semester,
                internal_marks=rec.internal_marks,
                external_marks=rec.external_marks,
                total_marks=tot,
                grade=grade,
                grade_point=gp,
                is_passed=is_passed
            )
            db.add(m_rec)

        # Save or update Attendance
        att_pct = rec.attendance if rec.attendance is not None else 85.0
        held = 45
        attended = int(round((att_pct / 100.0) * held))

        a_rec = db.query(Attendance).filter(
            Attendance.student_id == student.id,
            Attendance.subject_id == subject.id,
            Attendance.semester == rec.semester
        ).first()

        if a_rec:
            a_rec.classes_held = held
            a_rec.classes_attended = attended
            a_rec.attendance_percentage = att_pct
        else:
            a_rec = Attendance(
                student_id=student.id,
                subject_id=subject.id,
                semester=rec.semester,
                classes_held=held,
                classes_attended=attended,
                attendance_percentage=att_pct
            )
            db.add(a_rec)

        imported_count += 1
        updated_students.add(student.id)

    db.commit()

    # Recalculate Results and Risk for all touched students
    for sid in updated_students:
        recalculate_student_results(sid, db)
        evaluate_student_risk(sid, db)

    from ..services.audit_service import record_audit_log
    record_audit_log(
        db,
        action="DATA_IMPORT",
        entity_type="IMPORT",
        details=f"Committed batch import of {imported_count} academic records for {len(updated_students)} students",
        user_id=user.id,
        user_email=user.email,
        role=user.role
    )

    return {
        "success": True,
        "imported_records": imported_count,
        "message": f"Successfully processed and committed {imported_count} academic records to university database!"
    }

