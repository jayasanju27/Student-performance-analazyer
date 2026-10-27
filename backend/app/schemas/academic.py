from pydantic import BaseModel
from typing import Optional, List

class DepartmentBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    id: int
    total_students: Optional[int] = 0
    total_subjects: Optional[int] = 0

    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    code: str
    name: str
    department_id: int
    semester: int
    credits: int = 4
    max_internal: int = 30
    max_external: int = 70

class SubjectCreate(SubjectBase):
    pass

class SubjectOut(SubjectBase):
    id: int
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

class FacultyBase(BaseModel):
    department_id: int
    designation: str = "Assistant Professor"
    employee_code: str
    phone: Optional[str] = None

class FacultyCreate(FacultyBase):
    full_name: str
    email: str
    password: str
    assigned_subject_ids: Optional[List[int]] = []

class FacultyOut(FacultyBase):
    id: int
    user_id: int
    full_name: str
    email: str
    department_name: Optional[str] = None
    assigned_subjects: Optional[List[SubjectOut]] = []

    class Config:
        from_attributes = True
