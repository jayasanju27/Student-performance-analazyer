from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.academic import Department, Subject, Faculty, FacultySubject, Student
from ..models.user import User
from ..models.performance import GradingRule
from ..schemas.academic import DepartmentCreate, DepartmentOut, SubjectCreate, SubjectOut, FacultyCreate, FacultyOut
from ..schemas.performance import GradingRuleOut, GradingRuleUpdate
from ..services.auth import get_current_user, require_role, get_password_hash
from ..services.audit_service import record_audit_log

router = APIRouter(prefix="/api/academic", tags=["Academic Master Data"])

# Semesters
@router.get("/semesters")
def get_semesters(db: Session = Depends(get_db)):
    semesters = []
    for s in range(1, 9):
        subj_count = db.query(Subject).filter(Subject.semester == s).count()
        stud_count = db.query(Student).filter(Student.semester == s).count()
        semesters.append({
            "semester": s,
            "name": f"Semester {s}",
            "academic_year": f"Year {(s + 1) // 2}",
            "subjects_count": subj_count,
            "students_count": stud_count,
            "is_active": True
        })
    return semesters

# Departments
@router.get("/departments", response_model=List[DepartmentOut])
def get_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).all()
    out = []
    for d in depts:
        tot_students = db.query(Student).filter(Student.department_id == d.id).count()
        tot_subjects = db.query(Subject).filter(Subject.department_id == d.id).count()
        out.append({
            "id": d.id,
            "code": d.code,
            "name": d.name,
            "description": d.description,
            "total_students": tot_students,
            "total_subjects": tot_subjects
        })
    return out

@router.post("/departments", response_model=DepartmentOut)
def create_department(payload: DepartmentCreate, db: Session = Depends(get_db), admin: User = Depends(require_role(["admin"]))):
    dept = Department(code=payload.code.upper(), name=payload.name, description=payload.description)
    db.add(dept)
    db.commit()
    db.refresh(dept)

    record_audit_log(
        db,
        action="CREATE_DEPARTMENT",
        entity_type="ACADEMIC",
        details=f"Created department {dept.code}: {dept.name}",
        user_id=admin.id,
        user_email=admin.email,
        role=admin.role
    )

    return {"id": dept.id, "code": dept.code, "name": dept.name, "description": dept.description, "total_students": 0, "total_subjects": 0}


# Subjects
@router.get("/subjects", response_model=List[SubjectOut])
def get_subjects(
    department_id: Optional[int] = Query(None),
    semester: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Subject)
    if department_id:
        query = query.filter(Subject.department_id == department_id)
    if semester:
        query = query.filter(Subject.semester == semester)
    subjects = query.all()
    return [
        {
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "department_id": s.department_id,
            "department_name": s.department.name if s.department else "",
            "semester": s.semester,
            "credits": s.credits,
            "max_internal": s.max_internal,
            "max_external": s.max_external
        }
        for s in subjects
    ]

@router.post("/subjects", response_model=SubjectOut)
def create_subject(payload: SubjectCreate, db: Session = Depends(get_db), admin: User = Depends(require_role(["admin"]))):
    sub = Subject(**payload.model_dump())
    db.add(sub)
    db.commit()
    db.refresh(sub)

    record_audit_log(
        db,
        action="CREATE_SUBJECT",
        entity_type="ACADEMIC",
        details=f"Created subject {sub.code}: {sub.name} (Credits: {sub.credits}, Sem: {sub.semester})",
        user_id=admin.id,
        user_email=admin.email,
        role=admin.role
    )

    return {
        "id": sub.id,
        "code": sub.code,
        "name": sub.name,
        "department_id": sub.department_id,
        "department_name": sub.department.name if sub.department else "",
        "semester": sub.semester,
        "credits": sub.credits,
        "max_internal": sub.max_internal,
        "max_external": sub.max_external
    }

# Faculty
@router.get("/faculty/assigned")
def get_faculty_assigned_subjects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "faculty":
        fac = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if not fac:
            return []
        assignments = db.query(FacultySubject).filter(FacultySubject.faculty_id == fac.id).all() if fac else []
        sub_ids = [a.subject_id for a in assignments]
        subjects = db.query(Subject).filter(Subject.id.in_(sub_ids)).all() if sub_ids else db.query(Subject).all()
        return [
            {
                "id": s.id,
                "code": s.code,
                "name": s.name,
                "department_id": s.department_id,
                "department_name": s.department.name if s.department else "",
                "department_code": s.department.code if s.department else "",
                "semester": s.semester,
                "credits": s.credits,
                "max_internal": s.max_internal,
                "max_external": s.max_external
            }
            for s in subjects
        ]
    else:
        subjects = db.query(Subject).all()
        return [
            {
                "id": s.id,
                "code": s.code,
                "name": s.name,
                "department_id": s.department_id,
                "department_name": s.department.name if s.department else "",
                "department_code": s.department.code if s.department else "",
                "semester": s.semester,
                "credits": s.credits,
                "max_internal": s.max_internal,
                "max_external": s.max_external
            }
            for s in subjects
        ]

@router.get("/faculty", response_model=List[FacultyOut])
def get_faculty_list(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    faculty_members = db.query(Faculty).all()
    out = []
    for f in faculty_members:
        u = db.query(User).filter(User.id == f.user_id).first()
        assignments = db.query(FacultySubject).filter(FacultySubject.faculty_id == f.id).all()
        assigned_subs = []
        for a in assignments:
            s = db.query(Subject).filter(Subject.id == a.subject_id).first()
            if s:
                assigned_subs.append({
                    "id": s.id,
                    "code": s.code,
                    "name": s.name,
                    "department_id": s.department_id,
                    "department_name": s.department.name if s.department else "",
                    "semester": s.semester,
                    "credits": s.credits,
                    "max_internal": s.max_internal,
                    "max_external": s.max_external
                })

        out.append({
            "id": f.id,
            "user_id": f.user_id,
            "full_name": u.full_name if u else "Faculty Member",
            "email": u.email if u else "",
            "department_id": f.department_id,
            "department_name": f.department.name if f.department else "",
            "designation": f.designation,
            "employee_code": f.employee_code,
            "phone": f.phone,
            "assigned_subjects": assigned_subs
        })
    return out

@router.post("/faculty", response_model=FacultyOut)
def create_faculty(payload: FacultyCreate, db: Session = Depends(get_db), admin: User = Depends(require_role(["admin"]))):
    user = User(
        email=payload.email.strip().lower(),
        password_hash=get_password_hash(payload.password),
        full_name=payload.full_name,
        role="faculty",
        is_active=True
    )
    db.add(user)
    db.flush()

    faculty = Faculty(
        user_id=user.id,
        department_id=payload.department_id,
        designation=payload.designation,
        employee_code=payload.employee_code.upper(),
        phone=payload.phone
    )
    db.add(faculty)
    db.flush()

    for sub_id in (payload.assigned_subject_ids or []):
        db.add(FacultySubject(faculty_id=faculty.id, subject_id=sub_id))

    db.commit()
    db.refresh(faculty)

    record_audit_log(
        db,
        action="CREATE_FACULTY",
        entity_type="FACULTY",
        details=f"Created faculty member {faculty.employee_code} ({user.full_name})",
        user_id=admin.id,
        user_email=admin.email,
        role=admin.role
    )

    return {
        "id": faculty.id,
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "department_id": faculty.department_id,
        "department_name": faculty.department.name if faculty.department else "",
        "designation": faculty.designation,
        "employee_code": faculty.employee_code,
        "phone": faculty.phone,
        "assigned_subjects": []
    }

# Grading Rules Configuration
@router.get("/grading-rules", response_model=List[GradingRuleOut])
def get_grading_rules(db: Session = Depends(get_db)):
    rules = db.query(GradingRule).order_by(GradingRule.min_percentage.desc()).all()
    return rules

@router.put("/grading-rules/{rule_id}", response_model=GradingRuleOut)
def update_grading_rule(
    rule_id: int,
    payload: GradingRuleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    rule = db.query(GradingRule).filter(GradingRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Grading rule not found")

    old_desc = f"{rule.grade} ({rule.min_percentage}-{rule.max_percentage}%, GP: {rule.grade_point})"
    rule.min_percentage = payload.min_percentage
    rule.max_percentage = payload.max_percentage
    rule.grade_point = payload.grade_point
    if payload.description is not None:
        rule.description = payload.description

    db.commit()
    db.refresh(rule)

    record_audit_log(
        db,
        action="UPDATE_GRADING_RULES",
        entity_type="ACADEMIC",
        details=f"Updated rule {rule.grade}: {old_desc} -> ({rule.min_percentage}-{rule.max_percentage}%, GP: {rule.grade_point})",
        user_id=admin.id,
        user_email=admin.email,
        role=admin.role
    )

    return rule

