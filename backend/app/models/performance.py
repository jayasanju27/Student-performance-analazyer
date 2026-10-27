from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON, UniqueConstraint
from datetime import datetime
from ..database import Base
from sqlalchemy.orm import relationship

class Marks(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    internal_marks = Column(Float, nullable=False, default=0.0)
    external_marks = Column(Float, nullable=False, default=0.0)
    total_marks = Column(Float, nullable=False, default=0.0)
    grade = Column(String(5), nullable=False, default="F")
    grade_point = Column(Float, nullable=False, default=0.0)
    is_passed = Column(Boolean, default=True)

    student = relationship("Student", back_populates="marks")
    subject = relationship("Subject", back_populates="marks")


class InternalAssessment(Base):
    __tablename__ = "internal_assessments"
    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "subject_id",
            "semester",
            name="uq_internal_assessment_student_subject_semester",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    semester = Column(Integer, nullable=False)
    ia1_mark = Column(Float, nullable=False)
    ia2_mark = Column(Float, nullable=False)
    max_ia1 = Column(Float, nullable=False, default=50.0)
    max_ia2 = Column(Float, nullable=False, default=50.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    student = relationship("Student")
    subject = relationship("Subject")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    classes_held = Column(Integer, nullable=False, default=45)
    classes_attended = Column(Integer, nullable=False, default=40)
    attendance_percentage = Column(Float, nullable=False, default=88.8)

    student = relationship("Student", back_populates="attendance")
    subject = relationship("Subject", back_populates="attendance")

class SemesterResult(Base):
    __tablename__ = "semester_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    total_credits = Column(Integer, nullable=False, default=20)
    earned_credits = Column(Integer, nullable=False, default=20)
    sgpa = Column(Float, nullable=False, default=0.0)
    cgpa = Column(Float, nullable=False, default=0.0)
    result_status = Column(String(50), nullable=False, default="PASS")  # PASS, FAIL, WITHHELD

    student = relationship("Student", back_populates="semester_results")


class UniversityExamResult(Base):
    __tablename__ = "university_exam_results"
    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "subject_id",
            "semester",
            "exam_session",
            name="uq_university_result_attempt",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    semester = Column(Integer, nullable=False)
    exam_session = Column(String(100), nullable=False)
    grade = Column(String(20), nullable=False)
    result_status = Column(String(20), nullable=False)
    total_marks = Column(Float, nullable=True)
    source = Column(String(255), nullable=True)
    imported_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    student = relationship("Student")
    subject = relationship("Subject")


class RiskAnalysis(Base):
    __tablename__ = "risk_analysis"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    risk_level = Column(String(20), nullable=False, default="Low")  # "Low", "Medium", "High"
    risk_score = Column(Float, nullable=False, default=15.0)  # 0 to 100
    contributing_factors = Column(JSON, nullable=False, default=list)  # list of strings
    recommendations = Column(JSON, nullable=False, default=list)  # list of strings
    calculated_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="risk_analysis")

class GradingRule(Base):
    __tablename__ = "grading_rules"

    id = Column(Integer, primary_key=True, index=True)
    grade = Column(String(5), unique=True, nullable=False)
    min_percentage = Column(Float, nullable=False)
    max_percentage = Column(Float, nullable=False)
    grade_point = Column(Float, nullable=False)
    description = Column(String(100), nullable=True)
