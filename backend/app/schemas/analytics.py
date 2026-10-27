from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardSummaryOut(BaseModel):
    total_students: int
    average_percentage: float
    average_cgpa: float
    pass_percentage: float
    average_attendance: float
    students_at_risk: int
    risk_breakdown: Dict[str, int]
    top_performers: List[Dict[str, Any]]
    students_needing_attention: List[Dict[str, Any]]
    performance_trends: List[Dict[str, Any]]
    subject_averages: List[Dict[str, Any]]
    attendance_distribution: List[Dict[str, Any]]
    grade_distribution: List[Dict[str, Any]]
    semester_comparisons: List[Dict[str, Any]]
    department_analytics: List[Dict[str, Any]]
    ia1_average: Optional[float] = 0.0
    ia2_average: Optional[float] = 0.0

class ClassAnalyticsOut(BaseModel):
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    semester: Optional[int] = None
    total_students: int
    class_average_pct: float
    pass_count: int
    fail_count: int
    pass_pct: float
    average_attendance: float
    subject_performance: List[Dict[str, Any]]
    grade_counts: Dict[str, int]
