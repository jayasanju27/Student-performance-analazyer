import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CollegeLogo from '../common/CollegeLogo';
import { getCollegeConfig } from '../../config/collegeConfig';
import {
  FileText,
  Download,
  Printer,
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Search
} from 'lucide-react';

export default function MarksheetView({ defaultStudentId, defaultSemester }) {
  const { role, user } = useAuth();
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudentId || (user?.student_id || 1));
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester || 3);
  const [marksheet, setMarksheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (role !== 'student') {
      loadStudentsList();
    }
  }, [role]);

  useEffect(() => {
    if (selectedStudentId) {
      loadMarksheet(selectedStudentId, selectedSemester);
    }
  }, [selectedStudentId, selectedSemester]);

  const loadStudentsList = async () => {
    try {
      const res = await api.getStudents();
      setStudentsList(res);
      if (!selectedStudentId && res.length > 0) {
        setSelectedStudentId(res[0].id);
        setSelectedSemester(res[0].semester || 3);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadMarksheet = async (studentId, semester) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMarksheet(studentId, semester);
      setMarksheet(data);
    } catch (err) {
      setError(err.message || 'Could not load statement of marks');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!marksheet) return;
    setDownloadingPdf(true);
    try {
      await api.downloadMarksheetPdf(
        marksheet.student_id,
        marksheet.semester,
        marksheet.register_number
      );
    } catch (err) {
      alert('Failed to download PDF: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Bar (No print) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          {role !== 'student' && (
            <div className="w-full sm:w-72">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Select Student:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(parseInt(e.target.value, 10))}
                className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.register_number} - {s.full_name} ({s.department_code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Semester:
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              {[1, 2, 3, 4].map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedSemester === sem
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Sem {sem}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || !marksheet}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            {downloadingPdf ? 'Generating PDF...' : 'Download Official PDF'}
          </button>
        </div>
      </div>

      {/* Marksheet Canvas */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Compiling official statement of grades...</p>
        </div>
      ) : error || !marksheet ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-rose-200 text-rose-600 text-xs font-medium">
          {error || 'No marks recorded for this semester.'}
        </div>
      ) : (
        <div className="marksheet-print-container bg-white rounded-xs border-2 border-slate-300 shadow-xs p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
          {/* University Header Banner */}
          <div className="text-center border-b-2 border-[#0F2F57] pb-5">
            <CollegeLogo size={64} className="mx-auto mb-2" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#0F2F57] uppercase">
              {getCollegeConfig().collegeName}
            </h1>
            <p className="text-[11px] text-slate-700 font-medium mt-0.5">
              {getCollegeConfig().affiliation} • {getCollegeConfig().approvals}
            </p>
            <p className="text-[10px] text-slate-500">
              {getCollegeConfig().campusAddress}, {getCollegeConfig().city} - {getCollegeConfig().pincode}
            </p>

            <div className="mt-4 pt-2 border-t border-slate-200 inline-block px-6">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                OFFICIAL GRADE CARD & STATEMENT OF MARKS
              </h2>
              <p className="text-[11px] text-[#0F2F57] font-bold uppercase tracking-wider">
                Bachelor of Technology (B.Tech) - Semester {marksheet.semester} End Examinations
              </p>
            </div>
          </div>

          {/* Student Candidate Details Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Register Number</p>
              <p className="font-mono font-bold text-slate-900 text-sm">{marksheet.register_number}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Candidate Name</p>
              <p className="font-bold text-slate-900 text-sm">{marksheet.student_name}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Department / Branch</p>
              <p className="font-semibold text-slate-800">{marksheet.department_name}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Academic Session</p>
              <p className="font-semibold text-slate-800">2025-2026 (Odd Sem)</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Year & Section</p>
              <p className="font-semibold text-slate-800">Year {marksheet.year} • Sec {marksheet.section}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Attendance Record</p>
              <p className="font-semibold text-slate-800">{marksheet.attendance_percentage}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Candidate Email</p>
              <p className="font-semibold text-slate-800 truncate">{marksheet.email}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Date of Issue</p>
              <p className="font-semibold text-slate-800">{marksheet.issue_date}</p>
            </div>
          </div>

          {/* Statement of Marks Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 border-r border-blue-800">Course Code</th>
                  <th className="py-2.5 px-3 border-r border-blue-800">Course Title</th>
                  <th className="py-2.5 px-2 text-center border-r border-blue-800">Credits</th>
                  <th className="py-2.5 px-2 text-center border-r border-blue-800">Internal (30)</th>
                  <th className="py-2.5 px-2 text-center border-r border-blue-800">External (70)</th>
                  <th className="py-2.5 px-2 text-center border-r border-blue-800">Total (100)</th>
                  <th className="py-2.5 px-2 text-center border-r border-blue-800">Grade</th>
                  <th className="py-2.5 px-2 text-center border-r border-blue-800">Grade Pt</th>
                  <th className="py-2.5 px-2 text-center border-r border-blue-800">Credit Pts</th>
                  <th className="py-2.5 px-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {marksheet.subjects?.map((sub, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800 border-r border-slate-200">
                      {sub.subject_code}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 border-r border-slate-200">
                      {sub.subject_name}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-700 border-r border-slate-200">
                      {sub.credits}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-700 border-r border-slate-200">
                      {sub.internal_marks}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-700 border-r border-slate-200">
                      {sub.external_marks}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-900 border-r border-slate-200">
                      {sub.total_marks}
                    </td>
                    <td className="py-2.5 px-2 text-center font-black text-blue-700 border-r border-slate-200">
                      {sub.grade}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-800 border-r border-slate-200">
                      {sub.grade_point}
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-800 border-r border-slate-200">
                      {sub.credit_points}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`font-bold ${sub.is_passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {sub.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Academic Summary Footer Card */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Registered Credits</p>
                <p className="text-base font-extrabold text-slate-900">{marksheet.total_credits}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Earned Credits</p>
                <p className="text-base font-extrabold text-slate-900">{marksheet.earned_credits}</p>
              </div>
              <div className="h-8 w-px bg-blue-200 hidden sm:block" />
              <div>
                <p className="text-[10px] text-blue-700 uppercase font-bold">Semester SGPA</p>
                <p className="text-xl font-black text-blue-900">{marksheet.sgpa}</p>
              </div>
              <div>
                <p className="text-[10px] text-indigo-700 uppercase font-bold">Cumulative CGPA</p>
                <p className="text-xl font-black text-indigo-900">{marksheet.cgpa}</p>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                marksheet.result_status === 'PASS'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {marksheet.result_status === 'PASS' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {marksheet.result_status}
              </span>
              <p className="text-[11px] font-bold text-slate-700 mt-1">
                Classification: {marksheet.classification}
              </p>
            </div>
          </div>

          {/* Grading System Guide Footnote */}
          <div className="text-[10px] text-slate-500 border border-slate-200 p-2.5 rounded-lg bg-slate-50/50">
            <strong>Grading Scale:</strong> O (90-100, GP 10) Outstanding • A+ (80-89, GP 9) Excellent • A (70-79, GP 8) Very Good •
            B+ (60-69, GP 7) Good • B (50-59, GP 6) Above Average • C (40-49, GP 5) Pass • F (&lt;40, GP 0) Fail / Backlog.
          </div>

          {/* Signatures & Seal Verification */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-1" />
              <p className="font-bold text-slate-800">Academic Records Officer</p>
              <p className="text-[10px] text-slate-400">Section In-Charge</p>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-1" />
              <p className="font-bold text-blue-900">Controller of Examinations</p>
              <p className="text-[10px] text-slate-400">Info Institute of Engineering Official Seal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
