from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.academic import Student
from ..models.performance import RiskAnalysis
from ..models.user import User
from ..schemas.performance import RiskAnalysisOut
from ..services.auth import get_current_user, require_role
from ..services.risk_engine import evaluate_student_risk

router = APIRouter(prefix="/api/risk-analysis", tags=["Academic Risk & Recommendations"])

@router.get("/{student_id}", response_model=RiskAnalysisOut)
def get_student_risk_analysis(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if current_user.role == "student":
        stud = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not stud or stud.id != student_id:
            raise HTTPException(status_code=403, detail="Unauthorized")

    eval_data = evaluate_student_risk(student_id, db)
    return eval_data

@router.get("/students/flagged")
def get_flagged_students(
    risk_filter: Optional[str] = Query("All", description="High, Medium, or All"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "faculty"]))
):
    students = db.query(Student).all()
    flagged = []
    for s in students:
        eval_data = evaluate_student_risk(s.id, db)
        level = eval_data.get("risk_level", "Low")
        if risk_filter == "All" and level in ["High", "Medium"]:
            flagged.append(eval_data)
        elif risk_filter != "All" and level.lower() == risk_filter.lower():
            flagged.append(eval_data)
            
    # Sort with High risk first
    flagged.sort(key=lambda x: (0 if x["risk_level"] == "High" else (1 if x["risk_level"] == "Medium" else 2), -x["risk_score"]))
    return flagged
