import React, { useState, useEffect, useRef } from 'react';
import CollegeLogo from '../common/CollegeLogo';
import { useAuth } from '../../context/AuthContext';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from 'lucide-react';

// Helpers to handle native HTML5 date input format (YYYY-MM-DD) and display format (DD/MM/YYYY)
const toIsoDate = (str) => {
  if (!str) return '';
  const trimmed = str.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parts = trimmed.split(/[\/\-\.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return '';
};

const toDmyDate = (str) => {
  if (!str) return '';
  const trimmed = str.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;
  const parts = trimmed.split(/[\/\-\.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    const [d, m, y] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return trimmed;
};

// Official student registry mapping each Register Number to its corresponding DOB and Name
const STUDENT_DIRECTORY = {
  "711024243001": { name: "AADITH T", dob: "15/05/2005" },
  "711024243002": { name: "ARCHANA B", dob: "22/08/2005" },
  "711024243003": { name: "ARUL RAJ V", dob: "10/11/2005" },
  "711024243004": { name: "ATCHAYA S", dob: "03/02/2006" },
  "711024243005": { name: "BAVISHNITHIN S", dob: "18/07/2005" },
  "711024243006": { name: "DINAKAR SARAVANAKUMAR", dob: "14/09/2005" },
  "711024243007": { name: "GOWSIK R", dob: "29/01/2006" },
  "711024243008": { name: "HAKEEM M", dob: "05/06/2005" },
  "711024243009": { name: "HARINI K", dob: "12/12/2005" },
  "711024243010": { name: "HEMANTH K", dob: "25/03/2006" },
  "711024243011": { name: "HEMANTHKUMAR U", dob: "08/10/2005" },
  "711024243012": { name: "HIDHAYATH KHAAN F R", dob: "19/04/2005" },
  "711024243013": { name: "JAYASANJU S", dob: "22/12/2006" },
  "711024243014": { name: "JEEVITH P", dob: "02/11/2005" },
  "711024243015": { name: "KALEESWARAN S", dob: "16/01/2006" },
  "711024243016": { name: "KASHWI R", dob: "20/09/2005" },
  "711024243017": { name: "S KAVITHAN", dob: "30/08/2005" },
  "711024243018": { name: "KISHORE M", dob: "11/04/2006" },
  "711024243019": { name: "LOGESHWARAN M", dob: "07/07/2005" },
  "711024243020": { name: "MADHAN S", dob: "23/10/2005" },
  "711024243021": { name: "MANASSEH S", dob: "17/03/2006" },
  "711024243023": { name: "MOHANA PRIYA G", dob: "09/06/2005" },
  "711024243024": { name: "MOHANA PRIYA KALAIKOVAN", dob: "26/12/2005" },
  "711024243025": { name: "NAGAKISHORE KUMAR A", dob: "04/01/2006" },
  "711024243026": { name: "NAVEEN S", dob: "21/05/2005" },
  "711024243027": { name: "NAVINESH S", dob: "13/08/2005" },
  "711024243028": { name: "S NIJANTHAN NEHEMIAH", dob: "31/10/2005" },
  "711024243029": { name: "NIRANJAN S", dob: "06/02/2006" },
  "711024243030": { name: "PEROLI R", dob: "15/09/2005" },
  "711024243031": { name: "PRANESH A", dob: "28/11/2005" },
  "711024243033": { name: "PRAVEEN KUMAR A", dob: "01/04/2006" },
  "711024243034": { name: "PRAVEENKUMAR M", dob: "12/07/2005" },
  "711024243035": { name: "RAGUL P", dob: "24/06/2005" },
  "711024243036": { name: "ROHITH M", dob: "09/10/2005" },
  "711024243037": { name: "SAI SUSHMITHA R", dob: "18/03/2006" },
  "711024243038": { name: "SALODIS BENNY L", dob: "05/01/2006" },
  "711024243039": { name: "SAMGABRIEL J", dob: "22/05/2005" },
  "711024243040": { name: "SANTHIYA K", dob: "14/08/2005" },
  "711024243041": { name: "SANTHOSH BARATHI L", dob: "03/11/2005" },
  "711024243042": { name: "SARANYA DEVI S", dob: "27/02/2006" },
  "711024243043": { name: "SASTHA PRASANTH R", dob: "16/07/2005" },
  "711024243044": { name: "SEYAMOHAN R", dob: "10/12/2005" },
  "711024243045": { name: "SHAM J", dob: "25/04/2006" },
  "711024243046": { name: "SHIMONA A", dob: "08/09/2005" },
  "711024243047": { name: "SHRIRAM M", dob: "19/06/2005" },
  "711024243048": { name: "SILPA THOMAS", dob: "02/10/2005" },
  "711024243049": { name: "SOPNA I", dob: "21/01/2006" },
  "711024243050": { name: "SRI SATHYA P", dob: "11/05/2005" },
  "711024243051": { name: "SWETHA C", dob: "29/08/2005" },
  "711024243052": { name: "THISHOWN C", dob: "07/12/2005" },
  "711024243053": { name: "UDHAYANITHI M", dob: "17/04/2006" },
  "711024243054": { name: "VISHVA R", dob: "26/09/2005" },
  "711024243301": { name: "GANGATHARAN S", dob: "04/07/2005" },
  "711024243302": { name: "JITTESWARAN T", dob: "13/11/2005" },
  "711024243303": { name: "KARTHEESAN S", dob: "20/02/2006" },
  "711024243304": { name: "SABAREESH S", dob: "15/06/2005" },
  "711024243305": { name: "VISHWA K", dob: "28/10/2005" },
  "711024243501": { name: "SANJAY M", dob: "09/03/2006" },
};

export default function InstitutionalLogin({ portalRole = 'select', onNavigate }) {
  const { login, loading, authError, isAuthenticated, role, user, logout } = useAuth();

  // Tab state: 'student' or 'faculty-admin'
  const [activeTab, setActiveTab] = useState(() => {
    if (portalRole === 'student') return 'student';
    if (portalRole === 'faculty' || portalRole === 'admin') return 'faculty-admin';
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('faculty') || path.includes('admin')) return 'faculty-admin';
    return 'student';
  });

  // Student form state
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentDob, setStudentDob] = useState('');
  const dateInputRef = useRef(null);

  // Faculty / Admin form state
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  // If already authenticated and matches tab
  const activeTabMatchesSession = activeTab === 'student'
    ? role === 'student'
    : role === 'faculty' || role === 'admin';

  useEffect(() => {
    if (isAuthenticated && activeTabMatchesSession) {
      onNavigate?.(`/${role}/dashboard`);
    }
  }, [isAuthenticated, role, activeTabMatchesSession, onNavigate]);

  const handleStudentRegNoChange = (val) => {
    setStudentRegNo(val);
    setLocalError(null);
    const trimmed = val.trim();
    if (STUDENT_DIRECTORY[trimmed]) {
      setStudentDob(toIsoDate(STUDENT_DIRECTORY[trimmed].dob));
    }
  };

  const matchedStudent = STUDENT_DIRECTORY[studentRegNo.trim()];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);

    const isStudent = activeTab === 'student';
    const identifier = isStudent ? studentRegNo.trim() : facultyEmail.trim();
    const secret = isStudent ? toDmyDate(studentDob) : facultyPassword;

    if (!identifier || !secret) {
      setLocalError(isStudent
        ? 'Please enter both your register number and date of birth.'
        : 'Please enter both your email and password.');
      return;
    }

    try {
      const expectedRole = isStudent ? 'student' : 'faculty_admin';
      await login(identifier, secret, expectedRole);
    } catch (error) {
      setLocalError(error.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setLocalError(null);
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA] relative flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden font-sans text-[#0B2545] selection:bg-[#13315C] selection:text-white">
      {/* Decorative SVG Waves in Light-Blue Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Top-Right Decorative Wave Accent */}
        <svg
          className="absolute -top-12 -right-12 w-96 h-96 text-[#E1EDF8] opacity-60"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path
            d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.1,73.1,41.9C64.7,54.7,53.6,65.7,40.4,72.4C27.2,79.1,12,81.4,-2.4,85.6C-16.9,89.7,-30.7,95.7,-43.3,91.3C-56,86.9,-67.6,72.2,-75.4,56.8C-83.3,41.4,-87.4,25.3,-87.3,9.5C-87.2,-6.3,-82.9,-21.8,-75,-35.1C-67.1,-48.4,-55.6,-59.6,-42.6,-67.2C-29.6,-74.8,-15.1,-78.9,0.5,-79.8C16.1,-80.7,30.6,-83.6,44.7,-76.4Z"
            transform="translate(100 100)"
          />
        </svg>

        {/* Bottom Layered Waves */}
        <svg
          className="absolute bottom-0 left-0 w-full h-48 sm:h-64 text-[#E2EEF8] opacity-70"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,176C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full h-36 sm:h-48 text-[#D4E6F6] opacity-60"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,256L60,240C120,224,240,192,360,192C480,192,600,224,720,229.3C840,235,960,213,1080,192C1200,171,1320,149,1380,138.7L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
        </svg>
      </div>

      {/* Main Centered White Login Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/80 p-6 sm:p-8">
        {/* Top: College Logo + College Name (Tamil subtitle removed per request) */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 p-2 mb-3 flex items-center justify-center">
            <CollegeLogo size={52} />
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-[#0B2545] tracking-tight leading-snug">
            Info Institute of Engineering
          </h1>
          <p className="text-xs font-semibold text-slate-500 tracking-wide mt-0.5">
            (Autonomous)
          </p>

          <div className="mt-3 pt-2.5 border-t border-slate-100 w-full">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0E9AA7]">
              AcademIQ
            </p>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Student Academic Performance &amp; Result Analyzer
            </p>
          </div>
        </div>

        {/* Single Horizontal Row: Two Equal-Width Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'faculty-admin'}
            onClick={() => handleTabChange('faculty-admin')}
            className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === 'faculty-admin'
                ? 'bg-[#13315C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
          >
            Faculty / Admin
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'student'}
            onClick={() => handleTabChange('student')}
            className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === 'student'
                ? 'bg-[#13315C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
          >
            Student
          </button>
        </div>

        {/* Existing Session Notice */}
        {isAuthenticated && !activeTabMatchesSession && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-semibold">Active {role} session found</p>
            <p className="mt-0.5 text-slate-600">
              Signed in as {user?.full_name}. Continue to dashboard or sign out first.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => onNavigate?.(`/${role}/dashboard`)}
                className="rounded-lg bg-[#13315C] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#0B2545]"
              >
                Go to dashboard
              </button>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold hover:bg-amber-100"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Inline Error Message */}
        {(localError || authError) && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-[#FEF2F2] p-3 text-xs text-[#B91C1C]"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B91C1C]" />
            <div className="leading-relaxed">
              <span className="font-semibold block">Authentication error</span>
              <span>{localError || authError}</span>
            </div>
          </div>
        )}

        {/* Forms */}
        {activeTab === 'student' ? (
          /* Student Login Form with DOB according to Register Number */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="student-reg-no"
                className="block text-xs font-semibold text-[#0B2545] mb-1.5"
              >
                Register Number
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="student-reg-no"
                  type="text"
                  required
                  value={studentRegNo}
                  onChange={(e) => handleStudentRegNoChange(e.target.value)}
                  placeholder="e.g. 711024243013"
                  className="w-full h-11 pl-10 pr-3.5 text-sm bg-white text-[#0B2545] border border-slate-300 rounded-lg focus:border-[#0E9AA7] focus:ring-2 focus:ring-[#0E9AA7]/20 focus:outline-none transition-all placeholder:text-slate-400"
                  autoComplete="username"
                />
              </div>
              {matchedStudent && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#0E9AA7] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#0E9AA7]" />
                  <span>DOB set to {matchedStudent.dob} ({matchedStudent.name})</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="student-dob"
                className="block text-xs font-semibold text-[#0B2545] mb-1.5"
              >
                Date of Birth
              </label>
              <div className="relative flex items-center">
                <input
                  ref={dateInputRef}
                  id="student-dob"
                  type="date"
                  required
                  value={studentDob ? toIsoDate(studentDob) : ''}
                  onChange={(e) => {
                    setStudentDob(e.target.value);
                    setLocalError(null);
                  }}
                  max="2026-12-31"
                  className="w-full h-11 pl-3.5 pr-10 text-sm bg-white text-[#0B2545] border border-slate-300 rounded-lg focus:border-[#0E9AA7] focus:ring-2 focus:ring-[#0E9AA7]/20 focus:outline-none transition-all cursor-pointer font-medium [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  autoComplete="bday"
                />
                <button
                  type="button"
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker?.();
                    } catch {
                      dateInputRef.current?.focus();
                    }
                  }}
                  title="Open calendar"
                  aria-label="Open calendar"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#0E9AA7] rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9AA7]"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[#13315C] hover:bg-[#0B2545] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9AA7] focus-visible:ring-offset-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign in →'}</span>
            </button>
          </form>
        ) : (
          /* Faculty / Admin Login Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="faculty-email"
                className="block text-xs font-semibold text-[#0B2545] mb-1.5"
              >
                Faculty / Admin Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="faculty-email"
                  type="email"
                  required
                  value={facultyEmail}
                  onChange={(e) => setFacultyEmail(e.target.value)}
                  placeholder="faculty@123.in"
                  className="w-full h-11 pl-10 pr-3.5 text-sm bg-white text-[#0B2545] border border-slate-300 rounded-lg focus:border-[#0E9AA7] focus:ring-2 focus:ring-[#0E9AA7]/20 focus:outline-none transition-all placeholder:text-slate-400"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="faculty-password"
                className="block text-xs font-semibold text-[#0B2545] mb-1.5"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="faculty-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={facultyPassword}
                  onChange={(e) => setFacultyPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-11 pl-10 pr-10 text-sm bg-white text-[#0B2545] border border-slate-300 rounded-lg focus:border-[#0E9AA7] focus:ring-2 focus:ring-[#0E9AA7]/20 focus:outline-none transition-all placeholder:text-slate-400"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#13315C] rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9AA7]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[#13315C] hover:bg-[#0B2545] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9AA7] focus-visible:ring-offset-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign in →'}</span>
            </button>
          </form>
        )}

        {/* Collapsible Demo Credentials Helper */}
        <details className="mt-4 rounded-lg border border-slate-200/80 bg-slate-50 text-xs group">
          <summary className="cursor-pointer px-3.5 py-2 font-semibold text-[#13315C] hover:text-[#0E9AA7] select-none flex items-center justify-between list-none">
            <span>Demo credentials</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="border-t border-slate-200/80 px-3.5 py-2.5 space-y-2.5 text-slate-600">
            {activeTab === 'student' ? (
              <>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Select student to auto-fill Register No &amp; DOB:
                </p>
                <div className="space-y-1.5">
                  {[
                    { reg: '711024243013', name: 'JAYASANJU S', dob: '22/12/2006' },
                    { reg: '711024243001', name: 'AADITH T', dob: '15/05/2005' },
                    { reg: '711024243041', name: 'SANTHOSH BARATHI L', dob: '03/11/2005' },
                  ].map((s) => (
                    <div
                      key={s.reg}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-slate-200/60 hover:border-[#0E9AA7] transition-all"
                    >
                      <div className="text-xs">
                        <span className="font-semibold text-[#0B2545]">{s.reg}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">({s.name})</span>
                        <div className="text-[11px] text-[#0E9AA7] font-medium">DOB: {s.dob}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setStudentRegNo(s.reg);
                          setStudentDob(toIsoDate(s.dob));
                          setLocalError(null);
                        }}
                        className="px-2.5 py-1 rounded-md bg-[#E0F2F4] text-[#0E9AA7] hover:bg-[#0E9AA7] hover:text-white font-semibold text-xs transition-colors shrink-0"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  58 registered AI&amp;DS students available (711024243001–711024243501).
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-slate-200/60">
                  <div className="text-xs">
                    <span className="font-semibold text-[#0B2545]">Faculty:</span>
                    <span className="text-slate-500 text-[11px] ml-1.5">faculty@123.in</span>
                    <div className="text-[11px] text-[#0E9AA7] font-medium">Pass: Faculty@123</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFacultyEmail('faculty@123.in');
                      setFacultyPassword('Faculty@123');
                      setLocalError(null);
                    }}
                    className="px-2.5 py-1 rounded-md bg-[#E0F2F4] text-[#0E9AA7] hover:bg-[#0E9AA7] hover:text-white font-semibold text-xs transition-colors shrink-0"
                  >
                    Use
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-slate-200/60">
                  <div className="text-xs">
                    <span className="font-semibold text-[#0B2545]">Admin:</span>
                    <span className="text-slate-500 text-[11px] ml-1.5">admin@college.com</span>
                    <div className="text-[11px] text-[#0E9AA7] font-medium">Pass: admin123</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFacultyEmail('admin@college.com');
                      setFacultyPassword('admin123');
                      setLocalError(null);
                    }}
                    className="px-2.5 py-1 rounded-md bg-[#E0F2F4] text-[#0E9AA7] hover:bg-[#0E9AA7] hover:text-white font-semibold text-xs transition-colors shrink-0"
                  >
                    Use
                  </button>
                </div>
              </>
            )}
          </div>
        </details>
      </div>

      {/* Simple Footer */}
      <footer className="relative z-10 mt-6 text-center text-xs text-slate-500">
        <p>© AcademIQ · Info Institute of Engineering</p>
      </footer>
    </div>
  );
}
