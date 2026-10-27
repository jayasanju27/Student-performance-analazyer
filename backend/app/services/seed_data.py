import os
import csv
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.auth_session import AuthSession
from ..models.academic import Department, Subject, Faculty, FacultySubject, Student
from ..models.performance import Marks, Attendance, SemesterResult, RiskAnalysis, GradingRule, InternalAssessment, UniversityExamResult
from .auth import get_password_hash
from .grading import DEFAULT_GRADING_RULES, recalculate_student_results
from .risk_engine import evaluate_student_risk

def seed_database(db: Session, force_reset: bool = False):
    """
    Seeds comprehensive realistic demo data if database is empty or if force_reset is requested.
    """
    if force_reset:
        db.query(AuthSession).delete()
        db.query(RiskAnalysis).delete()
        db.query(UniversityExamResult).delete()
        db.query(InternalAssessment).delete()
        db.query(SemesterResult).delete()
        db.query(Attendance).delete()
        db.query(Marks).delete()
        db.query(FacultySubject).delete()
        db.query(Student).delete()
        db.query(Faculty).delete()
        db.query(Subject).delete()
        db.query(Department).delete()
        db.query(GradingRule).delete()
        db.query(User).delete()
        db.commit()
    else:
        existing_users = db.query(User).count()
        if existing_users > 0:
            return  # already seeded

    # 1. Default Grading Rules
    for gr in DEFAULT_GRADING_RULES:
        rule = GradingRule(
            grade=gr["grade"],
            min_percentage=gr["min_percentage"],
            max_percentage=gr["max_percentage"],
            grade_point=gr["grade_point"],
            description=gr["description"]
        )
        db.add(rule)
    db.commit()

    # 2. Departments
    dept_cse = Department(code="CSE", name="Computer Science & Engineering", description="School of Computing & Information Technology")
    dept_ece = Department(code="ECE", name="Electronics & Communication Engineering", description="School of Electrical & Electronics Engineering")
    dept_mech = Department(code="MECH", name="Mechanical Engineering", description="School of Mechanical & Material Science")
    
    db.add_all([dept_cse, dept_ece, dept_mech])
    db.commit()

    # 3. Subjects (Semesters 1, 2, 3, 4)
    subjects_data = [
        # CSE Subjects
        {"code": "CS101", "name": "Python Programming & Problem Solving", "dept": dept_cse.id, "sem": 1, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "CS102", "name": "Discrete Mathematics", "dept": dept_cse.id, "sem": 1, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "CS103", "name": "Digital Logic & Computer Organization", "dept": dept_cse.id, "sem": 1, "credits": 3, "max_int": 30, "max_ext": 70},
        
        {"code": "CS201", "name": "Data Structures & Algorithms", "dept": dept_cse.id, "sem": 2, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "CS202", "name": "Object-Oriented Programming with Java", "dept": dept_cse.id, "sem": 2, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "CS203", "name": "Probability & Statistics", "dept": dept_cse.id, "sem": 2, "credits": 3, "max_int": 30, "max_ext": 70},
        
        {"code": "CS301", "name": "Database Management Systems", "dept": dept_cse.id, "sem": 3, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "CS302", "name": "Operating Systems & System Programming", "dept": dept_cse.id, "sem": 3, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "CS303", "name": "Design & Analysis of Algorithms", "dept": dept_cse.id, "sem": 3, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "CS304", "name": "Software Engineering & Agile Practices", "dept": dept_cse.id, "sem": 3, "credits": 3, "max_int": 30, "max_ext": 70},
        {"code": "CS305", "name": "Cybersecurity Fundamentals", "dept": dept_cse.id, "sem": 3, "credits": 3, "max_int": 30, "max_ext": 70},

        # ECE Subjects
        {"code": "EC101", "name": "Electronic Devices & Circuit Analysis", "dept": dept_ece.id, "sem": 1, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "EC102", "name": "Network Theory & Signals", "dept": dept_ece.id, "sem": 1, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "EC201", "name": "Analog Electronics & Operational Amplifiers", "dept": dept_ece.id, "sem": 2, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "EC301", "name": "Microprocessors & Microcontrollers", "dept": dept_ece.id, "sem": 3, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "EC302", "name": "Electromagnetic Fields & Wave Propagation", "dept": dept_ece.id, "sem": 3, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "EC303", "name": "Digital Communication Systems", "dept": dept_ece.id, "sem": 3, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "EC304", "name": "Control Systems", "dept": dept_ece.id, "sem": 3, "credits": 3, "max_int": 30, "max_ext": 70},
        {"code": "EC305", "name": "Embedded Systems", "dept": dept_ece.id, "sem": 3, "credits": 3, "max_int": 30, "max_ext": 70},

        # MECH Subjects
        {"code": "ME101", "name": "Engineering Mechanics & Statics", "dept": dept_mech.id, "sem": 1, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "ME201", "name": "Fluid Mechanics & Machinery", "dept": dept_mech.id, "sem": 2, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "ME301", "name": "Applied Thermodynamics & Heat Transfer", "dept": dept_mech.id, "sem": 3, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "ME302", "name": "Kinematics & Dynamics of Machines", "dept": dept_mech.id, "sem": 3, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "ME303", "name": "Manufacturing Technology & Metrology", "dept": dept_mech.id, "sem": 3, "credits": 4, "max_int": 30, "max_ext": 70},
        {"code": "ME304", "name": "Computer-Aided Design and Manufacturing", "dept": dept_mech.id, "sem": 3, "credits": 3, "max_int": 30, "max_ext": 70},
        {"code": "ME305", "name": "Engineering Materials Science", "dept": dept_mech.id, "sem": 3, "credits": 3, "max_int": 30, "max_ext": 70},
    ]

    created_subjects = {}
    for s in subjects_data:
        sub = Subject(
            code=s["code"],
            name=s["name"],
            department_id=s["dept"],
            semester=s["sem"],
            credits=s["credits"],
            max_internal=s["max_int"],
            max_external=s["max_ext"]
        )
        db.add(sub)
        db.flush()
        created_subjects[s["code"]] = sub
    db.commit()

    # 4. Standard Demo Users & Faculty
    # Admin User
    admin_user = User(
        email="admin@college.com",
        password_hash=get_password_hash("admin123"),
        full_name="Prof. David Vance (Dean / Admin)",
        role="admin",
        is_active=True
    )
    db.add(admin_user)

    # Faculty 1 (CSE)
    faculty_user_cse = User(
        email="faculty@123.in",
        password_hash=get_password_hash("Faculty@123"),
        full_name="Faculty",
        role="faculty",
        is_active=True
    )
    db.add(faculty_user_cse)
    db.flush()

    faculty_cse = Faculty(
        user_id=faculty_user_cse.id,
        department_id=dept_cse.id,
        designation="Professor & HOD",
        employee_code="EMP-CSE-001",
        phone="+91-9876543210"
    )
    db.add(faculty_cse)
    db.flush()

    # Assign subjects to CSE faculty
    for code in ["CS301", "CS302", "CS303", "CS304", "CS305"]:
        db.add(FacultySubject(faculty_id=faculty_cse.id, subject_id=created_subjects[code].id))

    # Faculty 2 (ECE)
    faculty_user_ece = User(
        email="faculty.ece@college.com",
        password_hash=get_password_hash("faculty123"),
        full_name="Dr. Sunita Deshmukh",
        role="faculty",
        is_active=True
    )
    db.add(faculty_user_ece)
    db.flush()

    faculty_ece = Faculty(
        user_id=faculty_user_ece.id,
        department_id=dept_ece.id,
        designation="Associate Professor",
        employee_code="EMP-ECE-002",
        phone="+91-9876543211"
    )
    db.add(faculty_ece)
    db.flush()
    for code in ["EC301", "EC302", "EC303", "EC304", "EC305"]:
        db.add(FacultySubject(faculty_id=faculty_ece.id, subject_id=created_subjects[code].id))

    # Faculty 3 (MECH)
    faculty_user_mech = User(
        email="faculty.mech@college.com",
        password_hash=get_password_hash("faculty123"),
        full_name="Dr. Vikram Rao",
        role="faculty",
        is_active=True
    )
    db.add(faculty_user_mech)
    db.flush()

    faculty_mech = Faculty(
        user_id=faculty_user_mech.id,
        department_id=dept_mech.id,
        designation="Professor",
        employee_code="EMP-MECH-003",
        phone="+91-9876543212"
    )
    db.add(faculty_mech)
    db.flush()
    for code in ["ME301", "ME302", "ME303", "ME304", "ME305"]:
        db.add(FacultySubject(faculty_id=faculty_mech.id, subject_id=created_subjects[code].id))

    db.commit()

    # 5. Realistic Student Dataset (24 Students across 3 Departments)
    students_seed_data = [
        # Student A: improving and clear of arrears
        {
            "reg": "22AD001", "name": "Aditya Verma", "email": "student.a@academiq.demo", "dept": dept_cse.id,
            "year": 2, "sem": 3, "sec": "A", "marks_profile": "high", "att_rate": 92.5
        },
        # Student B: declining with current arrears
        {"reg": "22AD002", "name": "Ananya Krishnan", "email": "student.b@academiq.demo", "dept": dept_cse.id, "year": 2, "sem": 3, "sec": "A", "marks_profile": "high_risk", "att_rate": 56.0},
        # Student C: recovered from an earlier arrear
        {"reg": "22AD003", "name": "Rohan Deshpande", "email": "student.c@academiq.demo", "dept": dept_cse.id, "year": 2, "sem": 3, "sec": "A", "marks_profile": "outstanding", "att_rate": 94.0},
        {"reg": "REG2026CSE004", "name": "Pooja Hegde", "email": "pooja.h@college.com", "dept": dept_cse.id, "year": 2, "sem": 3, "sec": "A", "marks_profile": "medium_risk", "att_rate": 69.0},
        {"reg": "REG2026CSE005", "name": "Kabir Mehta", "email": "kabir.m@college.com", "dept": dept_cse.id, "year": 2, "sem": 3, "sec": "B", "marks_profile": "high_risk", "att_rate": 58.0},
        {"reg": "REG2026CSE006", "name": "Sneha Iyer", "email": "sneha.i@college.com", "dept": dept_cse.id, "year": 2, "sem": 3, "sec": "B", "marks_profile": "outstanding", "att_rate": 94.0},
        {"reg": "REG2026CSE007", "name": "Devansh Nair", "email": "devansh.n@college.com", "dept": dept_cse.id, "year": 2, "sem": 3, "sec": "B", "marks_profile": "good", "att_rate": 81.0},
        {"reg": "REG2026CSE008", "name": "Kavya Patel", "email": "kavya.p@college.com", "dept": dept_cse.id, "year": 2, "sem": 3, "sec": "A", "marks_profile": "medium_risk", "att_rate": 71.0},
        {"reg": "REG2026CSE009", "name": "Arjun Reddy", "email": "arjun.r@college.com", "dept": dept_cse.id, "year": 2, "sem": 3, "sec": "B", "marks_profile": "high_risk", "att_rate": 51.0},
        {"reg": "REG2026CSE010", "name": "Divya Nambiar", "email": "divya.n@college.com", "dept": dept_cse.id, "year": 1, "sem": 1, "sec": "A", "marks_profile": "high", "att_rate": 89.0},

        # ECE Students
        {"reg": "REG2026ECE001", "name": "Siddharth Sen", "email": "siddharth.s@college.com", "dept": dept_ece.id, "year": 2, "sem": 3, "sec": "A", "marks_profile": "outstanding", "att_rate": 95.0},
        {"reg": "REG2026ECE002", "name": "Meera Joshi", "email": "meera.j@college.com", "dept": dept_ece.id, "year": 2, "sem": 3, "sec": "A", "marks_profile": "good", "att_rate": 85.0},
        {"reg": "REG2026ECE003", "name": "Gaurav Bansal", "email": "gaurav.b@college.com", "dept": dept_ece.id, "year": 2, "sem": 3, "sec": "A", "marks_profile": "medium_risk", "att_rate": 68.0},
        {"reg": "REG2026ECE004", "name": "Ishita Roy", "email": "ishita.r@college.com", "dept": dept_ece.id, "year": 2, "sem": 3, "sec": "B", "marks_profile": "high", "att_rate": 90.0},
        {"reg": "REG2026ECE005", "name": "Nikhil Kapoor", "email": "nikhil.k@college.com", "dept": dept_ece.id, "year": 2, "sem": 3, "sec": "B", "marks_profile": "high_risk", "att_rate": 56.0},
        {"reg": "REG2026ECE006", "name": "Tanvi Bhat", "email": "tanvi.b@college.com", "dept": dept_ece.id, "year": 2, "sem": 3, "sec": "B", "marks_profile": "good", "att_rate": 83.0},
        {"reg": "REG2026ECE007", "name": "Pranav Kulkarni", "email": "pranav.k@college.com", "dept": dept_ece.id, "year": 1, "sem": 1, "sec": "A", "marks_profile": "high", "att_rate": 88.0},

        # MECH Students
        {"reg": "REG2026ME001", "name": "Varun Choudhary", "email": "varun.c@college.com", "dept": dept_mech.id, "year": 2, "sem": 3, "sec": "A", "marks_profile": "outstanding", "att_rate": 93.0},
        {"reg": "REG2026ME002", "name": "Riya Saxena", "email": "riya.s@college.com", "dept": dept_mech.id, "year": 2, "sem": 3, "sec": "A", "marks_profile": "good", "att_rate": 86.0},
        {"reg": "REG2026ME003", "name": "Manish Tiwari", "email": "manish.t@college.com", "dept": dept_mech.id, "year": 2, "sem": 3, "sec": "A", "marks_profile": "high_risk", "att_rate": 54.0},
        {"reg": "REG2026ME004", "name": "Harsh Vardhan", "email": "harsh.v@college.com", "dept": dept_mech.id, "year": 2, "sem": 3, "sec": "B", "marks_profile": "medium_risk", "att_rate": 72.0},
        {"reg": "REG2026ME005", "name": "Ananya Sethi", "email": "ananya.s@college.com", "dept": dept_mech.id, "year": 2, "sem": 3, "sec": "B", "marks_profile": "high", "att_rate": 91.0},
        {"reg": "REG2026ME006", "name": "Karthik Subramanian", "email": "karthik.s@college.com", "dept": dept_mech.id, "year": 2, "sem": 3, "sec": "B", "marks_profile": "good", "att_rate": 82.0},
        {"reg": "REG2026ME007", "name": "Rahul Menon", "email": "rahul.m@college.com", "dept": dept_mech.id, "year": 1, "sem": 1, "sec": "A", "marks_profile": "good", "att_rate": 84.0},
    ]

    sample_departments = [dept_cse, dept_ece, dept_mech]
    sample_first_names = [
        "Aarav", "Ishaan", "Mira", "Tara", "Kiran", "Nandini",
        "Reyansh", "Sanjana", "Yuvan", "Anika", "Prisha", "Ritvik",
    ]
    sample_last_names = ["Rao", "Menon", "Kapoor"]
    profile_data = [
        ("outstanding", 94.0),
        ("high", 88.0),
        ("good", 82.0),
        ("medium_risk", 70.0),
        ("high_risk", 58.0),
    ]
    for roster_number in range(25, 61):
        first_index = (roster_number - 25) % len(sample_first_names)
        last_index = (roster_number - 25) // len(sample_first_names)
        profile, attendance_rate = profile_data[(roster_number - 25) % len(profile_data)]
        department = sample_departments[(roster_number - 25) % len(sample_departments)]
        register_number = f"REG2026{department.code}{roster_number:03d}"
        full_name = f"{sample_first_names[first_index]} {sample_last_names[last_index]}"
        students_seed_data.append({
            "reg": register_number,
            "name": full_name,
            "email": f"sample.student{roster_number}@college.com",
            "dept": department.id,
            "year": 2,
            "sem": 3,
            "sec": "A" if roster_number % 2 else "B",
            "marks_profile": profile,
            "att_rate": attendance_rate,
        })

    for s_info in students_seed_data:
        # Create user account
        u = User(
            email=s_info["email"],
            password_hash=get_password_hash(s_info["reg"]),
            full_name=s_info["name"],
            role="student",
            is_active=True,
            must_change_password=False,
        )
        db.add(u)
        db.flush()

        avatar_idx = (s_info["reg"][-3:])
        student = Student(
            user_id=u.id,
            register_number=s_info["reg"],
            full_name=s_info["name"],
            department_id=s_info["dept"],
            year=s_info["year"],
            semester=s_info["sem"],
            section=s_info["sec"],
            email=s_info["email"],
            phone="+91-98" + s_info["reg"][-8:],
            avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={s_info['name'].replace(' ', '')}",
            admission_year=2023
        )
        db.add(student)
        db.flush()

        # Add marks and attendance across completed and current semesters
        dept_subjects = db.query(Subject).filter(Subject.department_id == s_info["dept"]).all()
        student_sem = s_info["sem"]
        
        # Populate all semesters up to current semester
        for sem in range(1, student_sem + 1):
            sem_subjects = [sub for sub in dept_subjects if sub.semester == sem]
            if not sem_subjects:
                continue

            for idx, sub in enumerate(sem_subjects):
                # Generate realistic scores based on marks_profile
                profile = s_info["marks_profile"]
                if profile == "outstanding":
                    int_score = 28.0 + (idx % 3)
                    ext_score = 63.0 + (idx % 7)
                    att_score = min(100.0, s_info["att_rate"] + (idx % 4) - 2)
                elif profile == "high":
                    int_score = 25.0 + (idx % 4)
                    ext_score = 56.0 + (idx % 8)
                    att_score = s_info["att_rate"] + (idx % 3) - 1
                elif profile == "good":
                    int_score = 22.0 + (idx % 3)
                    ext_score = 48.0 + (idx % 7)
                    att_score = s_info["att_rate"] + (idx % 4) - 2
                elif profile == "medium_risk":
                    # One weak or failed subject in current sem
                    if sem == student_sem and idx == 0:
                        int_score = 14.0
                        ext_score = 24.0  # Fail: total 38
                    else:
                        int_score = 18.0 + (idx % 3)
                        ext_score = 36.0 + (idx % 5)
                    att_score = max(55.0, s_info["att_rate"] + (idx % 5) - 3)
                else:  # high_risk
                    # Multiple failed subjects, very low attendance
                    if idx in [0, 1, 2]:
                        int_score = 11.0 + (idx % 2)
                        ext_score = 21.0 + (idx % 3)  # Fail
                    else:
                        int_score = 16.0
                        ext_score = 32.0  # Borderline 48
                    att_score = max(42.0, s_info["att_rate"] + (idx % 6) - 4)

                tot_score = round(int_score + ext_score, 1)

                # Assign Grade based on default scale
                if tot_score >= 90:
                    grd, gp = "O", 10.0
                elif tot_score >= 80:
                    grd, gp = "A+", 9.0
                elif tot_score >= 70:
                    grd, gp = "A", 8.0
                elif tot_score >= 60:
                    grd, gp = "B+", 7.0
                elif tot_score >= 50:
                    grd, gp = "B", 6.0
                elif tot_score >= 40:
                    grd, gp = "C", 5.0
                else:
                    grd, gp = "F", 0.0

                is_pass = (tot_score >= 40.0 and ext_score >= (sub.max_external * 0.40))
                if not is_pass:
                    grd = "F"
                    gp = 0.0

                db.add(Marks(
                    student_id=student.id,
                    subject_id=sub.id,
                    semester=sem,
                    internal_marks=int_score,
                    external_marks=ext_score,
                    total_marks=tot_score,
                    grade=grd,
                    grade_point=gp,
                    is_passed=is_pass
                ))

                if sem == student_sem:
                    ia1 = round((int_score / sub.max_internal) * 50, 1)
                    ia_change = (
                        -8 if s_info["reg"] == "22AD002"
                        else -8 if profile in ("medium_risk", "high_risk") and idx < 2
                        else 6 if profile in ("high", "outstanding")
                        else 2
                    )
                    ia2 = round(max(0, min(50, ia1 + ia_change)), 1)
                    db.add(InternalAssessment(
                        student_id=student.id,
                        subject_id=sub.id,
                        semester=sem,
                        ia1_mark=ia1,
                        ia2_mark=ia2,
                        max_ia1=50,
                        max_ia2=50
                    ))

                    first_session_passed = is_pass and (student.id + idx) % 4 != 0
                    if s_info["reg"] == "22AD001":
                        first_session_passed = True
                    if s_info["reg"] == "22AD003" and idx == 0:
                        first_session_passed = False
                    latest_session_passed = is_pass or (student.id + idx) % 3 == 0
                    if s_info["reg"] == "22AD002" and not is_pass:
                        latest_session_passed = False
                    session_attempts = [
                        ("Apr/May 2025", first_session_passed),
                        ("Nov/Dec 2025", is_pass),
                        ("Apr/May 2026", latest_session_passed),
                    ]
                    for exam_session, attempt_passed in session_attempts:
                        db.add(UniversityExamResult(
                            student_id=student.id,
                            subject_id=sub.id,
                            semester=sem,
                            exam_session=exam_session,
                            grade=grd if attempt_passed else "F",
                            result_status="PASS" if attempt_passed else "FAIL",
                            total_marks=tot_score if attempt_passed else min(tot_score, 38),
                            source="AcademIQ demo data"
                        ))

                held = 45
                attended = int(round((att_score / 100.0) * held))
                db.add(Attendance(
                    student_id=student.id,
                    subject_id=sub.id,
                    semester=sem,
                    classes_held=held,
                    classes_attended=attended,
                    attendance_percentage=round((attended / held) * 100.0, 1)
                ))

        db.flush()
        # Recalculate SGPA/CGPA
        recalculate_student_results(student.id, db)
        # Calculate Risk and Recommendations
        evaluate_student_risk(student.id, db)

    db.commit()
    print("Database seeding completed successfully with demo students, faculty, marks, assessment trends and university attempts!")


def seed_demo_assessment_history_if_empty(db: Session):
    demo_faculty = db.query(User).filter(User.email == "faculty@academiq.demo").first()
    if not demo_faculty:
        return
    if db.query(InternalAssessment).count() or db.query(UniversityExamResult).count():
        return

    students = db.query(Student).all()
    for student in students:
        current_marks = db.query(Marks).filter(
            Marks.student_id == student.id,
            Marks.semester == student.semester
        ).order_by(Marks.subject_id.asc()).all()
        for index, mark in enumerate(current_marks):
            subject = mark.subject
            if not subject:
                continue
            ia1 = round((mark.internal_marks / subject.max_internal) * 50, 1)
            passed = bool(mark.is_passed)
            ia2 = round(max(0, min(50, ia1 + (5 if passed else -8))), 1)
            db.add(InternalAssessment(
                student_id=student.id,
                subject_id=subject.id,
                semester=student.semester,
                ia1_mark=ia1,
                ia2_mark=ia2,
                max_ia1=50,
                max_ia2=50
            ))
            first_session_passed = passed and (student.id + index) % 4 != 0
            if student.register_number == "22AD003" and index == 0:
                first_session_passed = False
            latest_session_passed = passed or (student.id + index) % 3 == 0
            session_attempts = [
                ("Apr/May 2025", first_session_passed),
                ("Nov/Dec 2025", passed),
                ("Apr/May 2026", latest_session_passed),
            ]
            for exam_session, attempt_passed in session_attempts:
                db.add(UniversityExamResult(
                    student_id=student.id,
                    subject_id=subject.id,
                    semester=student.semester,
                    exam_session=exam_session,
                    grade=mark.grade if attempt_passed else "F",
                    result_status="PASS" if attempt_passed else "FAIL",
                    total_marks=mark.total_marks if attempt_passed else min(mark.total_marks, 38),
                    source="AcademIQ demo data"
                ))
    db.commit()


def ensure_student_accounts(db: Session):
    for student in db.query(Student).all():
        user = db.query(User).filter(User.id == student.user_id).first()
        if user:
            continue
        email = student.email.strip().lower()
        if db.query(User).filter(User.email == email).first():
            email = f"{student.register_number.lower()}@students.academiq.demo"
        user = User(
            email=email,
            password_hash=get_password_hash(student.register_number),
            full_name=student.full_name,
            role="student",
            is_active=True,
            must_change_password=False,
        )
        db.add(user)
        db.flush()
        student.user_id = user.id
        student.email = email
    db.commit()


def seed_from_csv_files_if_missing(db: Session):
    """
    Seeds missing subjects and students from sample_data/subjects_seed.csv and sample_data/students_seed.csv.
    Insert only, no duplicates, safe to run repeatedly on every backend startup.
    Preserves existing faculty accounts and demo data.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    candidates = [
        os.path.join(base_dir, "sample_data"),
        os.path.abspath("sample_data"),
        os.path.join(os.getcwd(), "sample_data"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "sample_data"),
    ]
    sample_dir = None
    for c in candidates:
        if os.path.exists(os.path.join(c, "subjects_seed.csv")):
            sample_dir = c
            break

    if not sample_dir:
        return

    subjects_file = os.path.join(sample_dir, "subjects_seed.csv")
    students_file = os.path.join(sample_dir, "students_seed.csv")

    # 1. Ensure department for Artificial Intelligence and Data Science exists
    dept_aids = db.query(Department).filter(
        (Department.code == "AIDS") | (Department.name.ilike("%Artificial Intelligence%"))
    ).first()
    if not dept_aids:
        dept_aids = Department(
            code="AIDS",
            name="Artificial Intelligence and Data Science",
            description="School of Computing & Artificial Intelligence"
        )
        db.add(dept_aids)
        db.flush()

    # 2. Seed subjects (insert-only, no duplicates)
    # subjects: SubjectCode, SubjectName, Semester, Type
    if os.path.exists(subjects_file):
        with open(subjects_file, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                code = (row.get("SubjectCode") or "").strip().upper()
                name = (row.get("SubjectName") or "").strip()
                if not code or not name:
                    continue
                sem_str = (row.get("Semester") or "1").strip()
                try:
                    sem = int(sem_str)
                except ValueError:
                    sem = 1
                subj_type = (row.get("Type") or "Theory").strip()
                credits = 2 if "lab" in subj_type.lower() or "project" in subj_type.lower() else 4

                existing_subject = db.query(Subject).filter(Subject.code == code).first()
                if not existing_subject:
                    new_subj = Subject(
                        code=code,
                        name=name,
                        department_id=dept_aids.id,
                        semester=sem,
                        credits=credits,
                        max_internal=30,
                        max_external=70
                    )
                    db.add(new_subj)
                    db.flush()

        db.commit()

    # 3. Assign all subjects to faculty members so they appear in faculty course dropdowns
    faculty_members = db.query(Faculty).all()
    all_subjects = db.query(Subject).all()
    for fac in faculty_members:
        for sub in all_subjects:
            exists = db.query(FacultySubject).filter(
                FacultySubject.faculty_id == fac.id,
                FacultySubject.subject_id == sub.id
            ).first()
            if not exists:
                db.add(FacultySubject(faculty_id=fac.id, subject_id=sub.id))
    db.commit()

    # 4. Seed students (insert-only, no duplicates)
    # students: RegNo, Name, Department, Batch, CurrentSemester.
    # Create a student login for each (username = RegNo, password = RegNo).
    if os.path.exists(students_file):
        with open(students_file, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                reg_no = (row.get("RegNo") or "").strip().upper()
                name = (row.get("Name") or "").strip()
                if not reg_no:
                    continue
                dept_name = (row.get("Department") or "Artificial Intelligence and Data Science").strip()
                batch_str = (row.get("Batch") or "2024").strip()
                sem_str = (row.get("CurrentSemester") or "5").strip()
                try:
                    batch = int(batch_str)
                except ValueError:
                    batch = 2024
                try:
                    sem = int(sem_str)
                except ValueError:
                    sem = 5

                student_dept = db.query(Department).filter(
                    (Department.name.ilike(f"%{dept_name}%")) | (Department.code == "AIDS")
                ).first() or dept_aids

                student = db.query(Student).filter(Student.register_number == reg_no).first()
                student_email = f"{reg_no.lower()}@college.com"

                user = None
                if student and student.user_id:
                    user = db.query(User).filter(User.id == student.user_id).first()
                if not user:
                    user = db.query(User).filter(
                        (User.email == student_email) | (User.email == f"{reg_no.lower()}@students.academiq.demo")
                    ).first()

                if not user:
                    user = User(
                        email=student_email,
                        password_hash=get_password_hash(reg_no),
                        full_name=name,
                        role="student",
                        is_active=True,
                        must_change_password=False
                    )
                    db.add(user)
                    db.flush()
                else:
                    user.password_hash = get_password_hash(reg_no)
                    user.must_change_password = False

                if not student:
                    student = Student(
                        user_id=user.id,
                        register_number=reg_no,
                        full_name=name,
                        department_id=student_dept.id,
                        year=(sem + 1) // 2,
                        semester=sem,
                        section="A",
                        email=user.email,
                        phone="+91-98" + reg_no[-8:] if len(reg_no) >= 8 else "+91-9800000000",
                        avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={name.replace(' ', '')}",
                        admission_year=batch
                    )
                    db.add(student)
                    db.flush()
                else:
                    student.user_id = user.id
                    student.department_id = student_dept.id
                    student.semester = sem
                    student.full_name = name

        db.commit()

