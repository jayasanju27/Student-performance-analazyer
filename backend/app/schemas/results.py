from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class UniversityResultImportRecord(BaseModel):
    register_number: str = Field(min_length=1, max_length=50)
    subject_code: str = Field(min_length=1, max_length=20)
    semester: int = Field(ge=1, le=8)
    exam_session: str = Field(min_length=1, max_length=100)
    grade: Literal[
        "O", "A+", "A", "B+", "B", "C", "D", "E", "F", "U",
        "RA", "AB", "SA", "WH", "W", "P", "S", "PASS", "FAIL",
        "WITHHELD", "ABSENT"
    ]
    result_status: Literal["PASS", "FAIL", "WITHHELD"]
    total_marks: Optional[float] = Field(default=None, ge=0, le=100)


class UniversityResultImportRequest(BaseModel):
    records: List[UniversityResultImportRecord] = Field(min_length=1)


class SpreadsheetColumn(BaseModel):
    header: str = Field(min_length=1, max_length=100)
    key: str = Field(min_length=1, max_length=100)


class SpreadsheetExportRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    columns: List[SpreadsheetColumn] = Field(min_length=1, max_length=100)
    rows: List[Dict[str, Any]] = Field(max_length=10000)
