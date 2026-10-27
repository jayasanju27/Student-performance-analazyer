from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class MarksBase(BaseModel):
    student_id: int
    subject_id: int
    semester: int
    internal_marks: float
    external_marks: float

class MarksCreate(MarksBase):
    pass


class InternalAssessmentCreate(BaseModel):
    student_id: int
    subject_id: int
    semester: int = Field(ge=1, le=8)
    ia1_mark: float = Field(ge=0, le=100)
    ia2_mark: float = Field(ge=0, le=100)
    ia1_max: float = Field(default=50, gt=0, le=100)
    ia2_max: float = Field(default=50, gt=0, le=100)


class MarksUpdate(BaseModel):
    internal_marks: Optional[float] = None
    external_marks: Optional[float] = None

class MarksOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    semester: int
    internal_marks: float
    external_marks: float
    total_marks: float
    grade: str
    grade_point: float
    is_passed: bool
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    credits: Optional[int] = 4
    student_name: Optional[str] = None
    register_number: Optional[str] = None

    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    student_id: int
    subject_id: int
    semester: int
    classes_held: int
    classes_attended: int

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    classes_held: Optional[int] = None
    classes_attended: Optional[int] = None

class AttendanceOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    semester: int
    classes_held: int
    classes_attended: int
    attendance_percentage: float
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    student_name: Optional[str] = None
    register_number: Optional[str] = None

    class Config:
        from_attributes = True

class MarksheetSubjectItem(BaseModel):
    subject_code: str
    subject_name: str
    credits: int
    max_internal: int
    max_external: int
    internal_marks: float
    external_marks: float
    total_marks: float
    grade: str
    grade_point: float
    credit_points: float
    is_passed: bool
    result: str

class MarksheetOut(BaseModel):
    student_id: int
    register_number: str
    student_name: str
    department_name: str
    department_code: str
    year: int
    semester: int
    section: str
    email: str
    subjects: List[MarksheetSubjectItem]
    total_credits: int
    earned_credits: int
    sgpa: float
    cgpa: float
    result_status: str  # PASS / FAIL / ATKT
    classification: str  # "First Class with Distinction", "First Class", etc.
    attendance_percentage: float
    issue_date: str

class GradingRuleOut(BaseModel):
    id: int
    grade: str
    min_percentage: float
    max_percentage: float
    grade_point: float
    description: Optional[str] = None

    class Config:
        from_attributes = True

class GradingRuleUpdate(BaseModel):
    min_percentage: float
    max_percentage: float
    grade_point: float
    description: Optional[str] = None

class RiskAnalysisOut(BaseModel):
    student_id: int
    register_number: str
    student_name: str
    department_name: str
    semester: int
    risk_level: str  # "Low", "Medium", "High"
    risk_score: float
    contributing_factors: List[str]
    recommendations: List[str]
    attendance_percentage: float
    current_average: float
    previous_cgpa: float
    failed_subjects_count: int
    trend: str
    calculated_at: Optional[datetime] = None
    disclaimer: str = "Academic-support indicator only. Predictions are estimates and should not be treated as official university results."
