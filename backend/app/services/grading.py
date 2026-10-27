from typing import List, Tuple, Dict
from sqlalchemy.orm import Session
from ..models.performance import GradingRule, Marks, SemesterResult
from ..models.academic import Subject

DEFAULT_GRADING_RULES = [
    {"grade": "O", "min_percentage": 90.0, "max_percentage": 100.0, "grade_point": 10.0, "description": "Outstanding"},
    {"grade": "A+", "min_percentage": 80.0, "max_percentage": 89.99, "grade_point": 9.0, "description": "Excellent"},
    {"grade": "A", "min_percentage": 70.0, "max_percentage": 79.99, "grade_point": 8.0, "description": "Very Good"},
    {"grade": "B+", "min_percentage": 60.0, "max_percentage": 69.99, "grade_point": 7.0, "description": "Good"},
    {"grade": "B", "min_percentage": 50.0, "max_percentage": 59.99, "grade_point": 6.0, "description": "Above Average"},
    {"grade": "C", "min_percentage": 40.0, "max_percentage": 49.99, "grade_point": 5.0, "description": "Pass"},
    {"grade": "F", "min_percentage": 0.0, "max_percentage": 39.99, "grade_point": 0.0, "description": "Fail"},
]

def get_grade_for_percentage(percentage: float, db: Session = None) -> Tuple[str, float, bool]:
    rules = []
    if db:
        rules = db.query(GradingRule).order_by(GradingRule.min_percentage.desc()).all()
    
    if not rules:
        rules_list = sorted(DEFAULT_GRADING_RULES, key=lambda x: x["min_percentage"], reverse=True)
        for r in rules_list:
            if percentage >= r["min_percentage"]:
                is_passed = r["grade"] != "F" and percentage >= 40.0
                return r["grade"], r["grade_point"], is_passed
        return "F", 0.0, False

    for r in rules:
        if percentage >= r.min_percentage:
            is_passed = r.grade != "F" and percentage >= 40.0
            return r.grade, r.grade_point, is_passed
    
    return "F", 0.0, False

def recalculate_student_results(student_id: int, db: Session):
    """
    Recalculates SGPA and CGPA for all semesters of a student based on marks and subject credits.
    """
    marks_list = db.query(Marks).filter(Marks.student_id == student_id).all()
    if not marks_list:
        return

    # Group marks by semester
    semesters = sorted(list(set(m.semester for m in marks_list)))
    
    cumulative_points = 0.0
    cumulative_credits = 0

    for sem in semesters:
        sem_marks = [m for m in marks_list if m.semester == sem]
        sem_points = 0.0
        sem_credits = 0
        sem_earned_credits = 0
        has_failure = False

        for m in sem_marks:
            subj = db.query(Subject).filter(Subject.id == m.subject_id).first()
            credits = subj.credits if subj else 4
            sem_credits += credits

            if m.is_passed:
                sem_earned_credits += credits
                sem_points += (credits * m.grade_point)
            else:
                has_failure = True
        
        sgpa = round(sem_points / sem_credits, 2) if sem_credits > 0 else 0.0
        
        cumulative_points += sem_points
        cumulative_credits += sem_credits
        cgpa = round(cumulative_points / cumulative_credits, 2) if cumulative_credits > 0 else 0.0

        status = "FAIL" if has_failure else "PASS"

        result_record = db.query(SemesterResult).filter(
            SemesterResult.student_id == student_id,
            SemesterResult.semester == sem
        ).first()

        if not result_record:
            result_record = SemesterResult(
                student_id=student_id,
                semester=sem,
                total_credits=sem_credits,
                earned_credits=sem_earned_credits,
                sgpa=sgpa,
                cgpa=cgpa,
                result_status=status
            )
            db.add(result_record)
        else:
            result_record.total_credits = sem_credits
            result_record.earned_credits = sem_earned_credits
            result_record.sgpa = sgpa
            result_record.cgpa = cgpa
            result_record.result_status = status

    db.commit()
