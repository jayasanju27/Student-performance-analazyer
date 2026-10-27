from pydantic import BaseModel
from typing import List, Optional, Any

class UploadRowRecord(BaseModel):
    row_number: int
    register_number: str
    student_name: Optional[str] = None
    department_code: Optional[str] = None
    semester: int
    subject_code: str
    subject_name: Optional[str] = None
    internal_marks: float
    external_marks: float
    attendance: Optional[float] = 85.0
    is_valid: bool = True
    error_message: Optional[str] = None

class UploadPreviewResponse(BaseModel):
    total_records: int
    valid_records_count: int
    invalid_records_count: int
    records: List[UploadRowRecord]

class BatchCommitRequest(BaseModel):
    records: List[UploadRowRecord]
