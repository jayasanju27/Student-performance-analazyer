from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any

class StudentBase(BaseModel):
    register_number: str
    full_name: str
    department_id: int
    year: int = 1
    semester: int = 1
    section: str = "A"
    email: str
    phone: Optional[str] = None
    admission_year: int = 2023
    avatar_url: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    department_id: Optional[int] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    section: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class StudentOut(StudentBase):
    id: int
    user_id: int
    department_name: Optional[str] = None
    department_code: Optional[str] = None
    cgpa: Optional[float] = 0.0
    latest_sgpa: Optional[float] = 0.0
    attendance_pct: Optional[float] = 0.0
    risk_level: Optional[str] = "Low"
    result_status: Optional[str] = "PASS"

    class Config:
        from_attributes = True

class StudentDetailOut(StudentOut):
    contributing_factors: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []
    risk_score: Optional[float] = 0.0
    marks: Optional[List[Any]] = []
    ia_assessments: Optional[List[Any]] = []
    attendance: Optional[List[Any]] = []
    semester_results: Optional[List[Any]] = []
