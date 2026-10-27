import argparse
import re
import sys
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path

import pdfplumber

BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.database import SessionLocal
from app.models.academic import Department, Student
from app.models.auth_session import AuthSession
from app.models.performance import (
    Attendance,
    InternalAssessment,
    Marks,
    RiskAnalysis,
    SemesterResult,
    UniversityExamResult,
)
from app.models.user import User
from app.services.auth import get_password_hash

ROLL_NUMBER_PATTERN = re.compile(r"^\d{12}$")
DATE_PATTERN = re.compile(
    r"(?<!\d)(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}-\d{2}-\d{2})(?!\d)"
)
EXPECTED_RECORD_COUNT = 58


@dataclass(frozen=True)
class RosterEntry:
    register_number: str
    full_name: str
    date_of_birth: date


def parse_date(value: str, row_number: int) -> date:
    for date_format in ("%d-%m-%Y", "%d/%m/%Y", "%d.%m.%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(value, date_format).date()
        except ValueError:
            continue
    raise ValueError(f"PDF row {row_number} contains an invalid date of birth.")


def parse_roster(pdf_path: Path) -> list[RosterEntry]:
    entries = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables() or []:
                for row in table[1:]:
                    if len(row) < 3 or not row[1] or not row[2]:
                        continue

                    row_number = len(entries) + 1
                    register_numbers = re.findall(r"\b\d{12}\b", row[1])
                    if len(register_numbers) != 1 or not ROLL_NUMBER_PATTERN.fullmatch(register_numbers[0]):
                        raise ValueError(f"PDF row {row_number} must contain one 12-digit register number.")
                    register_number = register_numbers[0]
                    suffix = int(register_number[-3:])
                    if not (
                        register_number.startswith("711024243")
                        and (1 <= suffix <= 58 or 301 <= suffix <= 305 or suffix == 501)
                    ):
                        raise ValueError(f"PDF row {row_number} has a register number outside the agreed ranges.")

                    name_lines = []
                    birth_date = None
                    for line in (part.strip() for part in row[2].splitlines()):
                        if not line:
                            continue
                        date_match = DATE_PATTERN.search(line)
                        if date_match:
                            if birth_date is not None:
                                raise ValueError(f"PDF row {row_number} contains multiple date values.")
                            birth_date = parse_date(date_match.group(1), row_number)
                        elif re.match(r"^\s*gender\s*:", line, re.IGNORECASE):
                            continue
                        else:
                            name_lines.append(re.sub(r"^\s*name\s*:\s*", "", line, flags=re.IGNORECASE).strip())

                    if birth_date is None:
                        raise ValueError(f"PDF row {row_number} is missing a date of birth.")
                    if len(name_lines) != 1 or not name_lines[0]:
                        raise ValueError(f"PDF row {row_number} must contain one student name.")

                    entries.append(RosterEntry(register_number, name_lines[0], birth_date))

    if len(entries) != EXPECTED_RECORD_COUNT:
        raise ValueError(f"Expected {EXPECTED_RECORD_COUNT} student records; found {len(entries)}.")
    register_numbers = [entry.register_number for entry in entries]
    if len(register_numbers) != len(set(register_numbers)):
        raise ValueError("The PDF contains duplicate register numbers.")
    return sorted(entries, key=lambda entry: entry.register_number)


def replace_student_roster(entries: list[RosterEntry]) -> None:
    db = SessionLocal()
    try:
        students = db.query(Student).all()
        student_ids = [student.id for student in students]
        user_ids = {
            user.id for user in db.query(User).filter(User.role == "student").all()
        }
        user_ids.update(student.user_id for student in students)
        user_ids.discard(None)

        department = db.query(Department).filter(Department.code == "AIDS").first()
        if not department:
            department = Department(
                code="AIDS",
                name="Artificial Intelligence & Data Science",
                description="Artificial intelligence, machine learning, and data science.",
            )
            db.add(department)
            db.flush()
        department_id = department.id

        if student_ids:
            db.query(RiskAnalysis).filter(RiskAnalysis.student_id.in_(student_ids)).delete(synchronize_session=False)
            db.query(UniversityExamResult).filter(UniversityExamResult.student_id.in_(student_ids)).delete(synchronize_session=False)
            db.query(InternalAssessment).filter(InternalAssessment.student_id.in_(student_ids)).delete(synchronize_session=False)
            db.query(SemesterResult).filter(SemesterResult.student_id.in_(student_ids)).delete(synchronize_session=False)
            db.query(Attendance).filter(Attendance.student_id.in_(student_ids)).delete(synchronize_session=False)
            db.query(Marks).filter(Marks.student_id.in_(student_ids)).delete(synchronize_session=False)
            db.query(Student).filter(Student.id.in_(student_ids)).delete(synchronize_session=False)
        if user_ids:
            db.query(AuthSession).filter(AuthSession.user_id.in_(user_ids)).delete(synchronize_session=False)
            db.query(User).filter(User.id.in_(user_ids)).delete(synchronize_session=False)
        db.expunge_all()

        for entry in entries:
            email = f"{entry.register_number}@students.academiq.demo"
            user = User(
                email=email,
                password_hash=get_password_hash(entry.date_of_birth.isoformat()),
                full_name=entry.full_name,
                role="student",
                is_active=True,
                must_change_password=False,
            )
            db.add(user)
            db.flush()
            db.add(Student(
                user_id=user.id,
                register_number=entry.register_number,
                full_name=entry.full_name,
                department_id=department_id,
                year=3,
                semester=5,
                section="A",
                email=email,
                admission_year=2024,
            ))

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import student names, roll numbers, and DOB-based login hashes from a roster PDF."
    )
    parser.add_argument("pdf_path", type=Path, help="Path to the student roster PDF")
    parser.add_argument(
        "--replace-existing-students",
        action="store_true",
        help="Replace the seeded student roster and its sample marks/attendance/results",
    )
    args = parser.parse_args()

    if not args.pdf_path.is_file():
        parser.error("PDF file does not exist.")

    entries = parse_roster(args.pdf_path)
    if not args.replace_existing_students:
        print(f"Validated {len(entries)} student records. No database changes made.")
        print("Pass --replace-existing-students to replace the existing sample student data.")
        return

    replace_student_roster(entries)
    print(f"Imported {len(entries)} students into the backend database.")
    print("DOBs are used to create login hashes and are not stored in plaintext.")


if __name__ == "__main__":
    main()
