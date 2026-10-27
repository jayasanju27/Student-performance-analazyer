// Self-Contained Enterprise Academic ERP In-Memory & Persistent Database Engine
// Enhanced with IA-1, IA-2, Arrear Tracking, Rankings, and University PDF Processing

const DB_STORAGE_KEY = 'apex_academic_db_v2';

export const DEFAULT_GRADING_RULES = [
  { id: 1, grade: 'O', min_percentage: 90.0, max_percentage: 100.0, grade_point: 10.0, description: 'Outstanding' },
  { id: 2, grade: 'A+', min_percentage: 80.0, max_percentage: 89.9, grade_point: 9.0, description: 'Excellent' },
  { id: 3, grade: 'A', min_percentage: 70.0, max_percentage: 79.9, grade_point: 8.0, description: 'Very Good' },
  { id: 4, grade: 'B+', min_percentage: 60.0, max_percentage: 69.9, grade_point: 7.0, description: 'Good' },
  { id: 5, grade: 'B', min_percentage: 50.0, max_percentage: 59.9, grade_point: 6.0, description: 'Above Average' },
  { id: 6, grade: 'C', min_percentage: 40.0, max_percentage: 49.9, grade_point: 5.0, description: 'Pass' },
  { id: 7, grade: 'F', min_percentage: 0.0, max_percentage: 39.9, grade_point: 0.0, description: 'Fail / Backlog' },
];

export const DEPARTMENTS = [
  { id: 1, code: 'CSE', name: 'Computer Science & Engineering', description: 'School of Computing & Information Technology' },
  { id: 2, code: 'ECE', name: 'Electronics & Communication Engineering', description: 'School of Electrical & Electronics Engineering' },
  { id: 3, code: 'MECH', name: 'Mechanical Engineering', description: 'School of Mechanical & Material Science' },
];

export const SUBJECTS = [
  // CSE
  { id: 1, code: 'CS101', name: 'Python Programming & Problem Solving', department_id: 1, semester: 1, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 2, code: 'CS102', name: 'Discrete Mathematics', department_id: 1, semester: 1, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 3, code: 'CS103', name: 'Digital Logic & Computer Organization', department_id: 1, semester: 1, credits: 3, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 4, code: 'CS201', name: 'Data Structures & Algorithms', department_id: 1, semester: 2, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 5, code: 'CS202', name: 'Object-Oriented Programming with Java', department_id: 1, semester: 2, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 6, code: 'CS203', name: 'Probability & Statistics', department_id: 1, semester: 2, credits: 3, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 7, code: 'CS301', name: 'Database Management Systems', department_id: 1, semester: 3, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 8, code: 'CS302', name: 'Operating Systems & System Programming', department_id: 1, semester: 3, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 9, code: 'CS303', name: 'Design & Analysis of Algorithms', department_id: 1, semester: 3, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 10, code: 'CS304', name: 'Software Engineering & Agile Practices', department_id: 1, semester: 3, credits: 3, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },

  // ECE
  { id: 11, code: 'EC101', name: 'Electronic Devices & Circuit Analysis', department_id: 2, semester: 1, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 12, code: 'EC102', name: 'Network Theory & Signals', department_id: 2, semester: 1, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 13, code: 'EC201', name: 'Analog Electronics & Operational Amplifiers', department_id: 2, semester: 2, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 14, code: 'EC301', name: 'Microprocessors & Microcontrollers', department_id: 2, semester: 3, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 15, code: 'EC302', name: 'Electromagnetic Fields & Wave Propagation', department_id: 2, semester: 3, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 16, code: 'EC303', name: 'Digital Communication Systems', department_id: 2, semester: 3, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },

  // MECH
  { id: 17, code: 'ME101', name: 'Engineering Mechanics & Statics', department_id: 3, semester: 1, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 18, code: 'ME201', name: 'Fluid Mechanics & Machinery', department_id: 3, semester: 2, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 19, code: 'ME301', name: 'Applied Thermodynamics & Heat Transfer', department_id: 3, semester: 3, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 20, code: 'ME302', name: 'Kinematics & Dynamics of Machines', department_id: 3, semester: 3, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
  { id: 21, code: 'ME303', name: 'Manufacturing Technology & Metrology', department_id: 3, semester: 3, credits: 4, max_ia1: 50, max_ia2: 50, max_internal: 30, max_external: 70 },
];

export const FACULTY_MEMBERS = [
  {
    id: 1,
    full_name: 'Faculty',
    email: 'faculty@123.in',
    employee_code: 'EMP-CSE-001',
    designation: 'Professor',
    department_id: 1,
    phone: '+91-9876543210',
    assigned_subject_ids: [7, 8, 9],
  },
  {
    id: 2,
    full_name: 'Dr. Sunita Deshmukh',
    email: 'faculty.ece@college.com',
    employee_code: 'EMP-ECE-002',
    designation: 'Associate Professor',
    department_id: 2,
    phone: '+91-9876543211',
    assigned_subject_ids: [14, 15],
  },
  {
    id: 3,
    full_name: 'Dr. Vikram Rao',
    email: 'faculty.mech@college.com',
    employee_code: 'EMP-MECH-003',
    designation: 'Professor',
    department_id: 3,
    phone: '+91-9876543212',
    assigned_subject_ids: [19, 20],
  },
];

export const STUDENTS_SEED = [
  { id: 1, register_number: 'REG2026CSE001', full_name: 'Aditya Verma', email: 'student@college.com', department_id: 1, year: 2, semester: 3, section: 'A', profile: 'high', att: 92.5 },
  { id: 2, register_number: 'REG2026CSE002', full_name: 'Ananya Krishnan', email: 'ananya.k@college.com', department_id: 1, year: 2, semester: 3, section: 'A', profile: 'outstanding', att: 96.0 },
  { id: 3, register_number: 'REG2026CSE003', full_name: 'Rohan Deshpande', email: 'rohan.d@college.com', department_id: 1, year: 2, semester: 3, section: 'A', profile: 'good', att: 84.0 },
  { id: 4, register_number: 'REG2026CSE004', full_name: 'Pooja Hegde', email: 'pooja.h@college.com', department_id: 1, year: 2, semester: 3, section: 'A', profile: 'medium_risk', att: 69.0 },
  { id: 5, register_number: 'REG2026CSE005', full_name: 'Kabir Mehta', email: 'kabir.m@college.com', department_id: 1, year: 2, semester: 3, section: 'B', profile: 'high_risk', att: 58.0 },
  { id: 6, register_number: 'REG2026CSE006', full_name: 'Sneha Iyer', email: 'sneha.i@college.com', department_id: 1, year: 2, semester: 3, section: 'B', profile: 'outstanding', att: 94.0 },
  { id: 7, register_number: 'REG2026CSE007', full_name: 'Devansh Nair', email: 'devansh.n@college.com', department_id: 1, year: 2, semester: 3, section: 'B', profile: 'good', att: 81.0 },
  { id: 8, register_number: 'REG2026CSE008', full_name: 'Kavya Patel', email: 'kavya.p@college.com', department_id: 1, year: 2, semester: 3, section: 'A', profile: 'medium_risk', att: 71.0 },
  { id: 9, register_number: 'REG2026CSE009', full_name: 'Arjun Reddy', email: 'arjun.r@college.com', department_id: 1, year: 2, semester: 3, section: 'B', profile: 'high_risk', att: 51.0 },
  { id: 10, register_number: 'REG2026CSE010', full_name: 'Divya Nambiar', email: 'divya.n@college.com', department_id: 1, year: 1, semester: 1, section: 'A', profile: 'high', att: 89.0 },

  { id: 11, register_number: 'REG2026ECE001', full_name: 'Siddharth Sen', email: 'siddharth.s@college.com', department_id: 2, year: 2, semester: 3, section: 'A', profile: 'outstanding', att: 95.0 },
  { id: 12, register_number: 'REG2026ECE002', full_name: 'Meera Joshi', email: 'meera.j@college.com', department_id: 2, year: 2, semester: 3, section: 'A', profile: 'good', att: 85.0 },
  { id: 13, register_number: 'REG2026ECE003', full_name: 'Gaurav Bansal', email: 'gaurav.b@college.com', department_id: 2, year: 2, semester: 3, section: 'A', profile: 'medium_risk', att: 68.0 },
  { id: 14, register_number: 'REG2026ECE004', full_name: 'Ishita Roy', email: 'ishita.r@college.com', department_id: 2, year: 2, semester: 3, section: 'B', profile: 'high', att: 90.0 },
  { id: 15, register_number: 'REG2026ECE005', full_name: 'Nikhil Kapoor', email: 'nikhil.k@college.com', department_id: 2, year: 2, semester: 3, section: 'B', profile: 'high_risk', att: 56.0 },
  { id: 16, register_number: 'REG2026ECE006', full_name: 'Tanvi Bhat', email: 'tanvi.b@college.com', department_id: 2, year: 2, semester: 3, section: 'B', profile: 'good', att: 83.0 },
  { id: 17, register_number: 'REG2026ECE007', full_name: 'Pranav Kulkarni', email: 'pranav.k@college.com', department_id: 2, year: 1, semester: 1, section: 'A', profile: 'high', att: 88.0 },

  { id: 18, register_number: 'REG2026ME001', full_name: 'Varun Choudhary', email: 'varun.c@college.com', department_id: 3, year: 2, semester: 3, section: 'A', profile: 'outstanding', att: 93.0 },
  { id: 19, register_number: 'REG2026ME002', full_name: 'Riya Saxena', email: 'riya.s@college.com', department_id: 3, year: 2, semester: 3, section: 'A', profile: 'good', att: 86.0 },
  { id: 20, register_number: 'REG2026ME003', full_name: 'Manish Tiwari', email: 'manish.t@college.com', department_id: 3, year: 2, semester: 3, section: 'A', profile: 'high_risk', att: 54.0 },
  { id: 21, register_number: 'REG2026ME004', full_name: 'Harsh Vardhan', email: 'harsh.v@college.com', department_id: 3, year: 2, semester: 3, section: 'B', profile: 'medium_risk', att: 72.0 },
  { id: 22, register_number: 'REG2026ME005', full_name: 'Ananya Sethi', email: 'ananya.s@college.com', department_id: 3, year: 2, semester: 3, section: 'B', profile: 'high', att: 91.0 },
  { id: 23, register_number: 'REG2026ME006', full_name: 'Karthik Subramanian', email: 'karthik.s@college.com', department_id: 3, year: 2, semester: 3, section: 'B', profile: 'good', att: 82.0 },
  { id: 24, register_number: 'REG2026ME007', full_name: 'Rahul Menon', email: 'rahul.m@college.com', department_id: 3, year: 1, semester: 1, section: 'A', profile: 'good', att: 84.0 },
];

export function getGradeInfo(percentage, rules = DEFAULT_GRADING_RULES) {
  const sorted = [...rules].sort((a, b) => b.min_percentage - a.min_percentage);
  for (const r of sorted) {
    if (percentage >= r.min_percentage) {
      return { grade: r.grade, grade_point: r.grade_point, is_passed: r.grade !== 'F' && percentage >= 40.0 };
    }
  }
  return { grade: 'F', grade_point: 0.0, is_passed: false };
}

export function buildInitialDb() {
  const marks = [];
  const iaMarks = [];
  const attendance = [];
  const semesterResults = [];
  const riskAnalysis = [];
  const arrears = [];

  let markId = 1;
  let iaId = 1;
  let attId = 1;
  let resId = 1;
  let arrId = 1;

  STUDENTS_SEED.forEach((st) => {
    const deptSubjects = SUBJECTS.filter((sub) => sub.department_id === st.department_id);
    const completedSems = st.semester;

    let cumulativePoints = 0;
    let cumulativeCredits = 0;

    let totalIa1Current = 0;
    let totalIa2Current = 0;
    let currentSubjectCount = 0;

    for (let sem = 1; sem <= completedSems; sem++) {
      const semSubs = deptSubjects.filter((s) => s.semester === sem);
      let semPoints = 0;
      let semCredits = 0;
      let semEarned = 0;
      let hasFailed = false;

      semSubs.forEach((sub, idx) => {
        let ia1Score = 42;
        let ia2Score = 44;
        let extScore = 58;
        let attScore = st.att;

        if (st.profile === 'outstanding') {
          ia1Score = 46 + (idx % 3);
          ia2Score = 48 + (idx % 2);
          extScore = 64 + (idx % 5);
          attScore = Math.min(100, st.att + (idx % 4) - 2);
        } else if (st.profile === 'high') {
          ia1Score = 40 + (idx % 4);
          ia2Score = 43 + (idx % 4);
          extScore = 56 + (idx % 7);
          attScore = st.att + (idx % 3) - 1;
        } else if (st.profile === 'good') {
          ia1Score = 36 + (idx % 4);
          ia2Score = 38 + (idx % 4);
          extScore = 48 + (idx % 6);
          attScore = st.att + (idx % 4) - 2;
        } else if (st.profile === 'medium_risk') {
          if (sem === completedSems && idx === 0) {
            ia1Score = 26;
            ia2Score = 22; // Drop!
            extScore = 24; // Fail: ext < 28
          } else {
            ia1Score = 32 + (idx % 3);
            ia2Score = 30 + (idx % 4);
            extScore = 36 + (idx % 5);
          }
          attScore = Math.max(55, st.att + (idx % 5) - 3);
        } else {
          // high_risk
          if (idx <= 1) {
            ia1Score = 20 + (idx % 3);
            ia2Score = 17 + (idx % 2); // Heavy Drop!
            extScore = 20 + (idx % 3); // Fail
          } else {
            ia1Score = 28;
            ia2Score = 26;
            extScore = 32;
          }
          attScore = Math.max(42, st.att + (idx % 6) - 4);
        }

        // Internal is converted to 30: ((IA1/50 + IA2/50)/2) * 30
        const intScore = Math.round((((ia1Score / 50 + ia2Score / 50) / 2) * 30) * 10) / 10;
        const tot = Math.round(intScore + extScore);
        const { grade, grade_point } = getGradeInfo(tot, DEFAULT_GRADING_RULES);
        const isPass = tot >= 40 && extScore >= sub.max_external * 0.4;
        const finalGrade = isPass ? grade : 'F';
        const finalGp = isPass ? grade_point : 0;

        iaMarks.push({
          id: iaId++,
          student_id: st.id,
          subject_id: sub.id,
          semester: sem,
          ia1_mark: ia1Score,
          ia1_max: 50,
          ia2_mark: ia2Score,
          ia2_max: 50,
          converted_internal: intScore,
          ia_diff: ia2Score - ia1Score,
          trend: ia2Score > ia1Score ? 'Improved' : ia2Score < ia1Score ? 'Declined' : 'Steady',
        });

        if (sem === completedSems) {
          totalIa1Current += ia1Score;
          totalIa2Current += ia2Score;
          currentSubjectCount++;
        }

        marks.push({
          id: markId++,
          student_id: st.id,
          subject_id: sub.id,
          semester: sem,
          internal_marks: intScore,
          external_marks: extScore,
          total_marks: tot,
          grade: finalGrade,
          grade_point: finalGp,
          is_passed: isPass,
        });

        const held = 45;
        const attended = Math.round((attScore / 100) * held);
        attendance.push({
          id: attId++,
          student_id: st.id,
          subject_id: sub.id,
          semester: sem,
          classes_held: held,
          classes_attended: attended,
          attendance_percentage: Math.round((attended / held) * 1000) / 10,
        });

        semCredits += sub.credits;
        if (isPass) {
          semEarned += sub.credits;
          semPoints += sub.credits * finalGp;
        } else {
          hasFailed = true;
          // Record Arrear
          arrears.push({
            id: arrId++,
            student_id: st.id,
            student_name: st.full_name,
            register_number: st.register_number,
            department_id: st.department_id,
            subject_id: sub.id,
            subject_code: sub.code,
            subject_name: sub.name,
            semester_failed: sem,
            semester_cleared: null,
            status: 'Active',
            type: sem === completedSems ? 'Current' : 'Previous',
            attempts: 1,
            exam_session: sem === 1 ? 'Nov/Dec 2023' : sem === 2 ? 'Apr/May 2026' : 'Nov/Dec 2026',
          });
        }
      });

      // Cleared Arrear sample: If student had a backlog in Sem 1 but cleared it in Sem 2
      if (st.profile === 'good' && sem === 2 && st.id === 3) {
        arrears.push({
          id: arrId++,
          student_id: st.id,
          student_name: st.full_name,
          register_number: st.register_number,
          department_id: st.department_id,
          subject_id: 1, // CS101
          subject_code: 'CS101',
          subject_name: 'Python Programming & Problem Solving',
          semester_failed: 1,
          semester_cleared: 2,
          status: 'Cleared',
          type: 'Previous',
          attempts: 2,
          exam_session: 'Apr/May 2026',
        });
      }

      const sgpa = semCredits > 0 ? Math.round((semPoints / semCredits) * 100) / 100 : 0;
      cumulativePoints += semPoints;
      cumulativeCredits += semCredits;
      const cgpa = cumulativeCredits > 0 ? Math.round((cumulativePoints / cumulativeCredits) * 100) / 100 : 0;

      semesterResults.push({
        id: resId++,
        student_id: st.id,
        semester: sem,
        total_credits: semCredits,
        earned_credits: semEarned,
        sgpa,
        cgpa,
        result_status: hasFailed ? 'FAIL' : 'PASS',
      });
    }

    // Risk calculation
    const currMarks = marks.filter((m) => m.student_id === st.id && m.semester === completedSems);
    const currAtts = attendance.filter((a) => a.student_id === st.id && a.semester === completedSems);
    const failedCnt = currMarks.filter((m) => !m.is_passed).length;
    const avgScore = currMarks.length > 0 ? Math.round(currMarks.reduce((acc, m) => acc + m.total_marks, 0) / currMarks.length) : 70;
    const attAvg = currAtts.length > 0 ? Math.round((currAtts.reduce((acc, a) => acc + a.attendance_percentage, 0) / currAtts.length) * 10) / 10 : st.att;

    const avgIa1 = currentSubjectCount > 0 ? Math.round((totalIa1Current / currentSubjectCount) * 10) / 10 : 40;
    const avgIa2 = currentSubjectCount > 0 ? Math.round((totalIa2Current / currentSubjectCount) * 10) / 10 : 42;
    const iaDiff = Math.round((avgIa2 - avgIa1) * 10) / 10;

    let riskLevel = 'Low';
    let riskScore = 15;
    const contributingFactors = [];
    const recommendations = [];

    if (failedCnt >= 2 || attAvg < 65 || avgScore < 40 || iaDiff <= -5) {
      riskLevel = 'High';
      riskScore = 75 + Math.min(20, failedCnt * 5);
    } else if (failedCnt === 1 || attAvg < 75 || avgScore < 55 || iaDiff < 0) {
      riskLevel = 'Medium';
      riskScore = 48;
    } else {
      riskLevel = 'Low';
      riskScore = 12;
    }

    if (iaDiff < -3) {
      contributingFactors.push(`Internal assessment score dropped by ${Math.abs(iaDiff)} marks between IA-1 (${avgIa1}) and IA-2 (${avgIa2}).`);
      recommendations.push('Review topics from IA-2 test and attend faculty doubt-clearing sessions before university finals.');
    } else if (iaDiff > 3) {
      recommendations.push(`Great improvement (+${iaDiff} marks) from IA-1 to IA-2! Maintain this study routine.`);
    }

    if (attAvg < 75) {
      contributingFactors.push(`Overall attendance is ${attAvg}%, which is below the mandatory 75% cutoff.`);
      recommendations.push('Attend all upcoming lectures to meet the university eligibility criteria.');
    } else {
      contributingFactors.push(`Consistent lecture attendance of ${attAvg}%.`);
    }

    if (failedCnt > 0) {
      contributingFactors.push(`Failed in ${failedCnt} course(s) during current academic session.`);
      recommendations.push('Schedule remedial practice and review previous university question papers to clear arrears.');
    }

    if (avgScore < 50) {
      contributingFactors.push(`Current semester average is ${avgScore}%, placing academic standing at risk.`);
      recommendations.push('Dedicate 2-3 hours of daily structured revision on core foundational concepts.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain your current high standard of academic performance across all courses.');
      recommendations.push('Consider participating in research seminars, technical symposiums, and certifications.');
    }

    riskAnalysis.push({
      student_id: st.id,
      risk_level: riskLevel,
      risk_score: riskScore,
      contributing_factors: contributingFactors,
      recommendations,
      attendance_percentage: attAvg,
      current_average: avgScore,
      failed_subjects_count: failedCnt,
      ia1_average: avgIa1,
      ia2_average: avgIa2,
      ia_diff: iaDiff,
    });
  });

  // Calculate Student Rankings
  const studentRankList = STUDENTS_SEED.map((st) => {
    const res = semesterResults.filter((r) => r.student_id === st.id).sort((a, b) => b.semester - a.semester)[0];
    const cgpa = res?.cgpa || 0;
    const sgpa = res?.sgpa || 0;
    return { id: st.id, cgpa, sgpa, dept_id: st.department_id };
  }).sort((a, b) => b.cgpa - a.cgpa || b.sgpa - a.sgpa);

  const studentRankMap = {};
  studentRankList.forEach((item, idx) => {
    studentRankMap[item.id] = { class_rank: idx + 1 };
  });

  // Department rankings
  DEPARTMENTS.forEach((dept) => {
    const deptList = studentRankList.filter((s) => s.dept_id === dept.id);
    deptList.forEach((item, idx) => {
      if (studentRankMap[item.id]) {
        studentRankMap[item.id].dept_rank = idx + 1;
      }
    });
  });

  const studentsWithRanks = STUDENTS_SEED.map((s) => {
    const rData = studentRankMap[s.id] || { class_rank: 1, dept_rank: 1 };
    const stArrears = arrears.filter((a) => a.student_id === s.id);
    const activeArrears = stArrears.filter((a) => a.status === 'Active');
    const currArrears = activeArrears.filter((a) => a.type === 'Current').length;
    const prevArrears = activeArrears.filter((a) => a.type === 'Previous').length;
    const clearedArrears = stArrears.filter((a) => a.status === 'Cleared').length;

    const risk = riskAnalysis.find((r) => r.student_id === s.id);

    return {
      id: s.id,
      register_number: s.register_number,
      full_name: s.full_name,
      email: s.email,
      department_id: s.department_id,
      year: s.year,
      semester: s.semester,
      section: s.section,
      phone: `+91-98${s.register_number.slice(-8)}`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.full_name.replace(' ', '')}`,
      admission_year: 2023,
      class_rank: rData.class_rank,
      dept_rank: rData.dept_rank,
      current_arrears: currArrears,
      previous_arrears: prevArrears,
      cleared_arrears: clearedArrears,
      total_active_arrears: activeArrears.length,
      ia1_avg: risk?.ia1_average || 40,
      ia2_avg: risk?.ia2_average || 42,
      ia_diff: risk?.ia_diff || 2,
    };
  });

  return {
    gradingRules: DEFAULT_GRADING_RULES,
    departments: DEPARTMENTS,
    subjects: SUBJECTS,
    faculty: FACULTY_MEMBERS,
    students: studentsWithRanks,
    marks,
    iaMarks,
    attendance,
    semesterResults,
    riskAnalysis,
    arrears,
  };
}

export function getDatabase() {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading DB from localStorage', e);
  }
  const freshDb = buildInitialDb();
  saveDatabase(freshDb);
  return freshDb;
}

export function saveDatabase(db) {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Error saving DB to localStorage', e);
  }
}

export function resetDatabase() {
  const fresh = buildInitialDb();
  saveDatabase(fresh);
  return fresh;
}
