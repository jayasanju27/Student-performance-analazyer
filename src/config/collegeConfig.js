// Configurable institutional details for the academic portal.
// Keep all accreditation, affiliations, and contact details configurable until officially supplied.

const STORAGE_KEY = 'college_institutional_config_v2';

export const DEFAULT_COLLEGE_CONFIG = {
  // Institutional Identity
  collegeName: 'Info Institute of Engineering',
  collegeNameRegional: '',
  shortName: 'IIE',
  establishedYear: '2007',
  collegeCode: 'TNEA CODE: 2732',
  aisheCode: 'AISHE: C-16624',
  
  // Affiliation & Accreditation
  affiliation: 'Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai',
  approvals: 'Approved by AICTE • Affiliated to Anna University • Accredited by NAAC & ISO 9001:2015 • Autonomous',
  motto: 'Empowering Engineering Innovations',
  
  // Administrative Contacts
  campusAddress: 'NH - 209, Sathy Road, Kovilpalayam',
  city: 'Coimbatore',
  state: 'Tamil Nadu',
  pincode: '641107',
  country: 'India',
  
  phoneGeneral: '0422 236 3700',
  phoneExamCell: '0422 236 3700 (Office of Controller of Examinations)',
  phoneAdmission: '0422 236 3700',
  emailGeneral: 'info@infoengg.com',
  emailExamCell: 'coe@infoengg.com',
  emailAdmissions: 'admission@infoengg.com',
  website: 'http://infoengg.com/',
  
  officeHours: 'Monday to Saturday: 8:45 AM to 4:45 PM (Second Saturdays & Public Holidays Closed)',
  academicYear: 'Academic Session 2025–2026',
  currentSemester: 'Odd Semester (Nov / Dec 2025 Examinations)',
  improvementThresholdPct: 10,
  declineThresholdPct: 10,
  passMarkPct: 40,
  highRiskArrearCount: 3,

  // Leadership Messages
  welcomeHeading: 'Office of the Principal & Academic Council',
  welcomeMessage: 'Welcome to Info Institute of Engineering (Autonomous), Coimbatore. Affiliated with Anna University and approved by AICTE, our institution provides world-class engineering education and research programs with a focus on student excellence and ethical innovation.',
  principalTitle: 'Principal & Chairman, Academic Council',
  coeName: 'Controller of Examinations',
  coeTitle: 'Office of Controller of Examinations (COE)',

  // Academic Programs
  departments: [
    {
      id: 1,
      code: 'AIDS',
      name: 'Artificial Intelligence & Data Science',
      degree: 'B.Tech & M.Tech',
      intake: 180,
      duration: '4 Years (8 Semesters)',
      description: 'Machine learning, analytics, intelligent systems, and data-driven decision engineering.',
    },
    {
      id: 2,
      code: 'CSE',
      name: 'Computer Science & Engineering',
      degree: 'B.Tech & M.Tech',
      intake: 180,
      duration: '4 Years (8 Semesters)',
      description: 'Computing systems, algorithms, distributed architecture, and artificial intelligence.',
    },
    {
      id: 3,
      code: 'ECE',
      name: 'Electronics & Communication Engineering',
      degree: 'B.Tech & M.Tech',
      intake: 120,
      duration: '4 Years (8 Semesters)',
      description: 'Semiconductor devices, signal processing, VLSI design, and communication networks.',
    },
    {
      id: 4,
      code: 'MECH',
      name: 'Mechanical Engineering',
      degree: 'B.Tech & M.Tech',
      intake: 120,
      duration: '4 Years (8 Semesters)',
      description: 'Thermal engineering, mechanics of solids, robotics, and advanced manufacturing.',
    },
    {
      id: 5,
      code: 'EEE',
      name: 'Electrical & Electronics Engineering',
      degree: 'B.Tech & M.Tech',
      intake: 120,
      duration: '4 Years (8 Semesters)',
      description: 'Power systems, electrical machines, control engineering, and sustainable energy technologies.',
    },
    {
      id: 6,
      code: 'IT',
      name: 'Information Technology',
      degree: 'B.Tech & M.Tech',
      intake: 120,
      duration: '4 Years (8 Semesters)',
      description: 'Information systems, secure networking, enterprise software, and digital transformation.',
    },
    {
      id: 7,
      code: 'S&H',
      name: 'Science & Humanities',
      degree: 'B.Sc. / M.Sc. / Foundation',
      intake: 120,
      duration: '4 Years (8 Semesters)',
      description: 'Applied sciences, language proficiency, social sciences, and foundational engineering skills.',
    },
    {
      id: 8,
      code: 'MBA',
      name: 'Master of Business Administration',
      degree: 'MBA',
      intake: 60,
      duration: '2 Years (4 Semesters)',
      description: 'Leadership, analytics, marketing strategy, finance management, and entrepreneurship.',
    },
  ],

  // Official Notices & Circulars
  notices: [
    {
      id: 1,
      refNo: 'COE/REV/2026/098',
      date: '10 Oct 2026',
      title: 'Declaration of Results for B.Tech Odd Semester Examinations (Nov/Dec 2026 Session)',
      category: 'Results',
      isNew: true,
      summary: 'Official semester marksheets and grade points are now published on the Student Portal. Scholars may check subject-wise SGPA and download verified result sheets.',
      downloadText: 'Notification PDF',
    },
    {
      id: 2,
      refNo: 'COE/ARREAR/2026/074',
      date: '06 Oct 2026',
      title: 'Schedule for Standing Arrears Examination and Revaluation Applications',
      category: 'Examinations',
      isNew: true,
      summary: 'Candidates with active arrears may submit online applications for revaluation or supplementary examination before October 28, 2026 through the Academic Portal.',
      downloadText: 'Circular PDF',
    },
    {
      id: 3,
      refNo: 'ACAD/CIR/2026/114',
      date: '28 Sep 2026',
      title: 'Continuous Internal Assessment - 2 (IA-2) Timetable for Semesters III, V & VII',
      category: 'Academic',
      isNew: false,
      summary: 'IA-2 central evaluation tests will commence from October 14, 2026. Faculty are advised to complete portions and submit marks within the stipulated timeline.',
      downloadText: 'Timetable PDF',
    },
    {
      id: 4,
      refNo: 'REG/ATTN/2026/052',
      date: '18 Sep 2026',
      title: 'Mandatory 80% Attendance Compliance Advisory for University Examination Eligibility',
      category: 'Compliance',
      isNew: false,
      summary: 'As per University Academic Regulations, candidates possessing less than 80% aggregate attendance shall be prevented from appearing in end-semester examinations.',
      downloadText: 'Advisory PDF',
    },
    {
      id: 5,
      refNo: 'DIR/CAL/2026/008',
      date: '12 Sep 2026',
      title: 'Revised Academic Calendar for the Academic Year 2026-2025 (Revision 2.0)',
      category: 'Calendar',
      isNew: false,
      summary: 'Approved schedule of working days, Continuous Assessments, practical tests, study holidays, and semester end theory examinations.',
      downloadText: 'Calendar PDF',
    },
  ],

  // Academic Calendar Milestones
  calendarSchedule: [
    { event: 'Commencement of Classwork for Odd Semester', date: '15 July 2026', status: 'Completed' },
    { event: 'Continuous Internal Assessment - 1 (IA-1)', date: '26 - 31 August 2026', status: 'Completed' },
    { event: 'Continuous Internal Assessment - 2 (IA-2)', date: '14 - 19 October 2026', status: 'Ongoing' },
    { event: 'Last Working Day & Attendance Condonation Scrutiny', date: '02 November 2026', status: 'Upcoming' },
    { event: 'End Semester Practical & Laboratory Examinations', date: '04 - 09 November 2026', status: 'Upcoming' },
    { event: 'Commencement of End Semester Theory Examinations', date: '18 November 2026', status: 'Upcoming' },
    { event: 'Official Declaration of Semester Examination Results', date: '24 December 2026', status: 'Upcoming' },
    { event: 'Commencement of Even Semester Classwork', date: '06 January 2025', status: 'Upcoming' },
  ],

  // Useful Student Links
  studentLinks: [
    { title: 'Academic Regulations & Curriculum (CBCS)', desc: 'Choice Based Credit System syllabus and grading guidelines' },
    { title: 'Office of the Controller of Examinations', desc: 'Rules of examinations, revaluation procedures & grievance desk' },
    { title: 'National Academic Depository (NAD / DigiLocker)', desc: 'Access verified electronic certificates and grade sheets' },
    { title: 'Anti-Ragging Committee & National Helpline', desc: 'Strict zero-tolerance policy as mandated by UGC and AICTE' },
    { title: 'Internal Quality Assurance Cell (IQAC)', desc: 'Academic quality standards, institutional audit & feedbacks' },
    { title: 'Student Grievance Redressal Committee', desc: 'Institutional portal for academic and infrastructural queries' },
  ],
};

export function getCollegeConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const config = { ...DEFAULT_COLLEGE_CONFIG, ...JSON.parse(stored) };
      if (/[\u0B80-\u0BFF]/.test(config.collegeNameRegional || '')) {
        config.collegeNameRegional = '';
      }
      return config;
    }
  } catch (e) {
    console.error('Error reading college config:', e);
  }
  return DEFAULT_COLLEGE_CONFIG;
}

export function saveCollegeConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('college-config-updated'));
  } catch (e) {
    console.error('Error saving college config:', e);
  }
}
