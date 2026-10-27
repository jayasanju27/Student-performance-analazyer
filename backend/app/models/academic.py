from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    subjects = relationship("Subject", back_populates="department", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="department")
    faculty = relationship("Faculty", back_populates="department")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    credits = Column(Integer, nullable=False, default=4)
    max_internal = Column(Integer, nullable=False, default=30)
    max_external = Column(Integer, nullable=False, default=70)

    department = relationship("Department", back_populates="subjects")
    marks = relationship("Marks", back_populates="subject", cascade="all, delete-orphan")
    attendance = relationship("Attendance", back_populates="subject", cascade="all, delete-orphan")
    faculty_assignments = relationship("FacultySubject", back_populates="subject", cascade="all, delete-orphan")

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    designation = Column(String(100), default="Assistant Professor")
    employee_code = Column(String(50), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)

    user = relationship("User")
    department = relationship("Department", back_populates="faculty")
    assigned_subjects = relationship("FacultySubject", back_populates="faculty", cascade="all, delete-orphan")

class FacultySubject(Base):
    __tablename__ = "faculty_subjects"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)

    faculty = relationship("Faculty", back_populates="assigned_subjects")
    subject = relationship("Subject", back_populates="faculty_assignments")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    register_number = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    year = Column(Integer, nullable=False, default=1)
    semester = Column(Integer, nullable=False, default=1)
    section = Column(String(10), nullable=False, default="A")
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    admission_year = Column(Integer, nullable=False, default=2023)
    date_of_birth = Column(String(20), nullable=True)

    user = relationship("User")
    department = relationship("Department", back_populates="students")
    marks = relationship("Marks", back_populates="student", cascade="all, delete-orphan")
    attendance = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    semester_results = relationship("SemesterResult", back_populates="student", cascade="all, delete-orphan")
    risk_analysis = relationship("RiskAnalysis", back_populates="student", uselist=False, cascade="all, delete-orphan")
