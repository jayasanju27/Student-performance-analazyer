import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { exportReportToCsv, exportReportToExcel } from '../../services/reportsExporter';
import Pagination from '../common/Pagination';
import {
  GraduationCap,
  Award,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sparkles,
  BookOpen,
  TrendingUp,
  Download,
  Mail,
  Building2,
  Calendar,
  Search
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export default function StudentProfileView({ onSelectStudentForMarksheet }) {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [universityHistory, setUniversityHistory] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [assessmentSearch, setAssessmentSearch] = useState('');
  const [assessmentSort, setAssessmentSort] = useState({ key: 'subject_code', direction: 'asc' });
  const [assessmentPage, setAssessmentPage] = useState(1);
  const [exportError, setExportError] = useState('');
  const assessmentPageSize = 10;

  useEffect(() => {
    loadProfile();
  }, [user, role, selectedStudentId]);

  useEffect(() => {
    setAssessmentPage(1);
    setAssessmentSearch('');
  }, [selectedStudentId]);

  const loadProfile = async () => {
    const studentId = role === 'faculty' ? selectedStudentId : user?.student_id || 1;
    if (!studentId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [data, history] = await Promise.all([
        api.getStudentById(studentId),
        api.getUniversityResultHistory(studentId),
      ]);
      setProfile(data);
      setUniversityHistory(history);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    try {
      setError(null);
      setSearchResults(await api.getStudents({ search: searchTerm.trim() }));
      setHasSearched(true);
    } catch (err) {
      setError(err.message || 'Could not search students.');
    }
  };

  if (loading) {
    return (
      <div aria-label="Loading student profile" className="space-y-4">
        <div className="faculty-skeleton h-20" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="faculty-skeleton h-24" />)}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="faculty-skeleton h-64" />
          <div className="faculty-skeleton h-64" />
        </div>
      </div>
    );
  }

  if (role === 'faculty' && !profile) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Student profile</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Find a student</h2>
          <p className="mt-1 text-sm text-slate-500">Search by register number or student name to view academic performance and university history.</p>
        </div>
        <form onSubmit={handleSearch} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row">
          <label className="sr-only" htmlFor="student-profile-search">Search by name or register number</label>
          <input
            id="student-profile-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="e.g. REG2026CSE001 or Aditya Verma"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800">
            <Search className="h-4 w-4" /> Search
          </button>
        </form>
        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
        {searchResults.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {searchResults.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => setSelectedStudentId(student.id)}
                className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
              >
                <span>
                  <span className="block text-sm font-bold text-slate-900">{student.full_name}</span>
                  <span className="mt-0.5 block font-mono text-xs text-slate-500">{student.register_number} · {student.department_code}</span>
                </span>
                <span className="text-xs font-semibold text-blue-700">View profile →</span>
              </button>
            ))}
          </div>
        )}
        {hasSearched && searchResults.length === 0 && (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">No students match that search.</p>
        )}
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 text-rose-600 text-xs">
        {error || 'Student profile not found.'}
      </div>
    );
  }

  // Filter marks for current semester
  const currentMarks = profile.marks?.filter((m) => m.semester === profile.semester) || [];
  const assessmentRows = (profile.ia_assessments || []).map((assessment) => {
    const ia1Pct = assessment.ia1_max ? (assessment.ia1_mark / assessment.ia1_max) * 100 : 0;
    const ia2Pct = assessment.ia2_max ? (assessment.ia2_mark / assessment.ia2_max) * 100 : 0;
    return { ...assessment, change: Math.round((ia2Pct - ia1Pct) * 10) / 10 };
  });
  const filteredAssessmentRows = assessmentRows
    .filter((assessment) => [assessment.subject_code, assessment.ia1_mark, assessment.ia2_mark, assessment.change]
      .some((value) => String(value ?? '').toLowerCase().includes(assessmentSearch.toLowerCase())))
    .sort((first, second) => {
      const left = first[assessmentSort.key] ?? '';
      const right = second[assessmentSort.key] ?? '';
      const comparison = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
      return assessmentSort.direction === 'asc' ? comparison : -comparison;
    });
  const assessmentTotalPages = Math.max(1, Math.ceil(filteredAssessmentRows.length / assessmentPageSize));
  const visibleAssessmentRows = filteredAssessmentRows.slice(
    (assessmentPage - 1) * assessmentPageSize,
    assessmentPage * assessmentPageSize
  );
  const changeAssessmentSort = (key) => setAssessmentSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }));
  const assessmentExportColumns = [
    { header: 'Subject', key: 'subject_code' },
    { header: 'IA-1 Mark', key: 'ia1_mark' },
    { header: 'IA-1 Maximum', key: 'ia1_max' },
    { header: 'IA-2 Mark', key: 'ia2_mark' },
    { header: 'IA-2 Maximum', key: 'ia2_max' },
    { header: 'Change (%)', key: 'change' },
  ];
  const exportAssessmentsToExcel = async () => {
    setExportError('');
    try {
      await exportReportToExcel('student_ia_assessments', assessmentExportColumns, filteredAssessmentRows);
    } catch (err) {
      setExportError(err.message || 'Excel export failed.');
    }
  };
  
  // Identify strong (>= 75) and weak (< 55) subjects
  const strongSubjects = currentMarks.filter((m) => m.total_marks >= 75);
  const weakSubjects = currentMarks.filter((m) => m.total_marks < 55);

  const chartData = currentMarks.map((m) => ({
    subject: m.subject_code,
    name: m.subject_name,
    internal: m.internal_marks,
    external: m.external_marks,
    total: m.total_marks,
  }));
  const attemptsBySubject = universityHistory.reduce((groups, attempt) => {
    const attempts = groups.get(attempt.subject_code) || [];
    attempts.push(attempt);
    groups.set(attempt.subject_code, attempts);
    return groups;
  }, new Map());
  const latestAttempts = [...attemptsBySubject.values()].map((attempts) => attempts[attempts.length - 1]);
  const previousArrears = [...attemptsBySubject.values()].filter((attempts) =>
    attempts.some((attempt) => attempt.result_status === 'FAIL')
  ).length;
  const currentArrears = latestAttempts.filter((attempt) => attempt.result_status === 'FAIL').length;
  const clearedArrears = [...attemptsBySubject.values()].filter((attempts) =>
    attempts.some((attempt) => attempt.result_status === 'FAIL') &&
    attempts[attempts.length - 1].result_status === 'PASS'
  ).length;

  return (
    <div className="space-y-6">
      {role === 'faculty' && (
        <>
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Student profile</p>
            <p className="mt-1 text-xs text-slate-500">Viewing {profile.full_name} · {profile.register_number}</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <label className="sr-only" htmlFor="student-profile-search">Search another student</label>
            <input id="student-profile-search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search another student" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:w-64" />
            <button type="submit" className="rounded-xl bg-blue-700 px-3 py-2 text-xs font-bold text-white">Search</button>
          </form>
        </div>
        {searchResults.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {searchResults.map((student) => (
              <button key={student.id} type="button" onClick={() => setSelectedStudentId(student.id)} className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50">
                <span className="text-xs"><strong className="text-slate-900">{student.full_name}</strong><span className="ml-2 font-mono text-slate-500">{student.register_number}</span></span>
                <span className="text-xs font-bold text-blue-700">Open profile</span>
              </button>
            ))}
          </div>
        )}
        </>
      )}
      {/* Top Banner & Profile Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`}
            alt={profile.full_name}
            className="w-24 h-24 rounded-full bg-white/10 p-1 border-2 border-white/40 shadow-xl shrink-0"
          />

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    B.Tech Undergraduate
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    Active Scholar
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">{profile.full_name}</h2>
                <p className="text-xs text-blue-200 font-mono mt-0.5">
                  Register No: {profile.register_number} • Dept: {profile.department_name}
                </p>
              </div>

              <div className="flex items-center gap-2 justify-center md:justify-end">
                <button
                  onClick={() => onSelectStudentForMarksheet && onSelectStudentForMarksheet(profile.id, profile.semester)}
                  className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  Official Grade Sheet
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                <p className="text-blue-200 text-[10px] uppercase font-bold">Cumulative CGPA</p>
                <p className="text-xl font-black mt-0.5 text-white">{profile.cgpa} / 10</p>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                <p className="text-blue-200 text-[10px] uppercase font-bold">Current Attendance</p>
                <p className={`text-xl font-black mt-0.5 ${profile.attendance_pct < 75 ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {profile.attendance_pct}%
                </p>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                <p className="text-blue-200 text-[10px] uppercase font-bold">Current Semester</p>
                <p className="text-xl font-black mt-0.5 text-white">Sem {profile.semester} (Sec {profile.section})</p>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                <p className="text-blue-200 text-[10px] uppercase font-bold">Academic Risk</p>
                <p className={`text-xl font-black mt-0.5 ${
                  profile.risk_level === 'High' ? 'text-rose-300' : profile.risk_level === 'Medium' ? 'text-amber-300' : 'text-emerald-300'
                }`}>
                  {profile.risk_level} Risk
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Previous arrears', value: previousArrears, color: 'text-amber-700' },
          { label: 'Current arrears', value: currentArrears, color: 'text-rose-700' },
          { label: 'Cleared arrears', value: clearedArrears, color: 'text-emerald-700' },
          { label: 'University attempts', value: universityHistory.length, color: 'text-blue-700' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
            <p className={`mt-1 text-2xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4">
            <h3 className="text-sm font-bold text-slate-900">IA-1 & IA-2 trend</h3>
            <p className="mt-1 text-xs text-slate-500">Recorded internal assessment scores by subject.</p>
          </div>
          <div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              aria-label="Search assessment rows"
              value={assessmentSearch}
              onChange={(event) => {
                setAssessmentSearch(event.target.value);
                setAssessmentPage(1);
              }}
              placeholder="Search assessments"
              className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => exportReportToCsv('student_ia_assessments', assessmentExportColumns, filteredAssessmentRows)}
                className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={exportAssessmentsToExcel}
                className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
              >
                Export Excel
              </button>
            </div>
          </div>
          {exportError && <p role="alert" className="px-4 pt-3 text-xs text-rose-700">{exportError}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  {[
                    ['Subject', 'subject_code'],
                    ['IA-1', 'ia1_mark'],
                    ['IA-2', 'ia2_mark'],
                    ['Change', 'change'],
                  ].map(([label, key]) => (
                    <th key={key} className="px-4 py-3">
                      <button type="button" onClick={() => changeAssessmentSort(key)} aria-label={`Sort by ${label}`}>
                        {label} {assessmentSort.key === key ? (assessmentSort.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleAssessmentRows.map((assessment) => (
                  <tr key={`${assessment.subject_code}-${assessment.semester}`}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{assessment.subject_code}</td>
                    <td className="px-4 py-3">{assessment.ia1_mark}/{assessment.ia1_max}</td>
                    <td className="px-4 py-3">{assessment.ia2_mark}/{assessment.ia2_max}</td>
                    <td className={`px-4 py-3 font-bold ${assessment.change >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {assessment.change > 0 ? '+' : ''}{assessment.change}%
                    </td>
                  </tr>
                ))}
                {filteredAssessmentRows.length === 0 && (
                  <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-500">No assessment records match your search. Try a different subject or mark.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={Math.min(assessmentPage, assessmentTotalPages)}
            pageSize={assessmentPageSize}
            totalItems={filteredAssessmentRows.length}
            onPageChange={setAssessmentPage}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4">
            <h3 className="text-sm font-bold text-slate-900">University result history</h3>
            <p className="mt-1 text-xs text-slate-500">Exam attempts retained across sessions.</p>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {universityHistory.map((attempt) => (
              <div key={attempt.id} className="flex items-start gap-3">
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${attempt.result_status === 'PASS' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">{attempt.subject_code} · {attempt.subject_name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Semester {attempt.semester} · {attempt.exam_session}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${attempt.result_status === 'PASS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{attempt.grade} · {attempt.result_status}</span>
              </div>
            ))}
            {!universityHistory.length && <p className="py-6 text-center text-xs text-slate-500">No university exam attempts have been imported.</p>}
          </div>
        </div>
      </section>

      {/* Row 2: Performance Chart & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Semester {profile.semester} Course Performance (Score / 100)</h3>
              <p className="text-xs text-slate-500">Internal CIA + External End-Semester exams</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
              Total Marks
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="subject" stroke="#64748b" fontSize={13} fontWeight={600} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={13} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val, name, item) => [`${val}/100`, `${item.payload.name}`]}
                />
                <Bar dataKey="total" name="Total Marks" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.total >= 80 ? '#15803d' : entry.total >= 50 ? '#1e3a5f' : '#b91c1c'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strong & Weak Subjects (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Strong Subjects */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Core Strengths ({strongSubjects.length})
            </h4>
            <div className="space-y-2">
              {strongSubjects.length > 0 ? (
                strongSubjects.map((s) => (
                  <div key={s.id} className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-emerald-950">{s.subject_name}</p>
                      <p className="text-[10px] text-emerald-700 font-mono">{s.subject_code} • {s.credits} Credits</p>
                    </div>
                    <span className="font-black text-xs text-emerald-700 bg-white px-2 py-0.5 rounded shadow-xs">
                      {s.total_marks}/100 ({s.grade})
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Aim for 75+ in your core subjects.</p>
              )}
            </div>
          </div>

          {/* Weak / Attention Subjects */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Subjects Requiring Additional Focus ({weakSubjects.length})
            </h4>
            <div className="space-y-2">
              {weakSubjects.length > 0 ? (
                weakSubjects.map((s) => (
                  <div key={s.id} className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-rose-950">{s.subject_name}</p>
                      <p className="text-[10px] text-rose-700 font-mono">{s.subject_code} • Grade {s.grade}</p>
                    </div>
                    <span className="font-black text-xs text-rose-700 bg-white px-2 py-0.5 rounded shadow-xs">
                      {s.total_marks}/100
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-emerald-600 font-medium">
                  Great work! All your subjects are currently comfortably above the passing threshold.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Personalized Recommendations & Risk Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Evaluation */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Academic Standing & Risk Diagnostic
            </h4>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              profile.risk_level === 'High' ? 'bg-rose-100 text-rose-800' :
              profile.risk_level === 'Medium' ? 'bg-amber-100 text-amber-800' :
              'bg-emerald-100 text-emerald-800'
            }`}>
              {profile.risk_level} Risk Category
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-700 pt-1">
            {profile.contributing_factors?.map((factor, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{factor}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 mt-4 italic border-t border-slate-100 pt-2">
            Predictions are formative early-warning estimates and do not represent final degree notifications.
          </p>
        </div>

        {/* Personalized Recommendations */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Personalized Academic Advice & Study Guidance
          </h4>

          <div className="space-y-2.5 text-xs text-slate-700">
            {profile.recommendations?.map((rec, idx) => (
              <div key={idx} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/70 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium text-emerald-950">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
