import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { exportReportToPdf, exportReportToCsv, exportReportToExcel } from '../../services/reportsExporter';
import Pagination from '../common/Pagination';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Users,
  Award,
  BookOpen,
  AlertTriangle,
  RotateCcw,
  GraduationCap,
  Sparkles,
  Printer,
  ChevronRight,
  Filter
} from 'lucide-react';

const isNumericValue = (value) =>
  typeof value === 'number' ||
  (typeof value === 'string' && /^-?\d+(?:\.\d+)?%?$/.test(value));

export default function ReportsView() {
  const [activeReport, setActiveReport] = useState('student-performance');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [arrears, setArrears] = useState([]);
  const [flaggedStudents, setFlaggedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState('All');
  const [semFilter, setSemFilter] = useState('All');
  const [reportSearch, setReportSearch] = useState('');
  const [reportSort, setReportSort] = useState({ key: 'register_number', direction: 'asc' });
  const [exportError, setExportError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadAllReportData();
  }, []);

  const loadAllReportData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [stList, subList, arrList, riskList] = await Promise.all([
        api.getStudents(),
        api.getSubjects(),
        api.getArrears('All'),
        api.getFlaggedStudents('All'),
      ]);
      setStudents(stList);
      setSubjects(subList);
      setArrears(arrList);
      setFlaggedStudents(riskList);
    } catch (err) {
      setLoadError(err.message || 'Unable to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeReport, reportSearch, deptFilter, semFilter]);

  const reportsConfig = [
    {
      id: 'student-performance',
      title: 'Student Performance Report',
      description: 'Comprehensive academic transcript listing SGPA, CGPA, class rankings, and attendance.',
      icon: Users,
      badgeColor: 'bg-slate-50 text-slate-600',
    },
    {
      id: 'class-performance',
      title: 'Class Performance Report',
      description: 'Departmental batch averages, passing milestones, and class benchmarks.',
      icon: Award,
      badgeColor: 'bg-slate-50 text-slate-600',
    },
    {
      id: 'subject-wise',
      title: 'Subject-wise Report',
      description: 'Curriculum course pass rates, faculty averages, and score distributions.',
      icon: BookOpen,
      badgeColor: 'bg-slate-50 text-slate-600',
    },
    {
      id: 'university-result',
      title: 'University Result Report',
      description: 'Official Controller of Examinations statement of marks, credit points, and classifications.',
      icon: GraduationCap,
      badgeColor: 'bg-slate-50 text-slate-600',
    },
    {
      id: 'arrear-report',
      title: 'Arrear & Backlog Report',
      description: 'Audit of standing backlogs, current semester failures, and cleared supplementary attempts.',
      icon: RotateCcw,
      badgeColor: 'bg-slate-50 text-slate-600',
    },
    {
      id: 'at-risk-report',
      title: 'At-Risk Student Report',
      description: 'Predictive alert list of scholars facing academic probation, low attendance, or IA declines.',
      icon: AlertTriangle,
      badgeColor: 'bg-slate-50 text-slate-600',
    },
  ];

  // Prepare table data for the active report
  const getActiveReportData = () => {
    let filteredStudents = students;
    if (deptFilter !== 'All') {
      filteredStudents = filteredStudents.filter((s) => s.department_code === deptFilter);
    }
    if (semFilter !== 'All') {
      filteredStudents = filteredStudents.filter((s) => s.semester === parseInt(semFilter, 10));
    }

    switch (activeReport) {
      case 'student-performance': {
        const columns = [
          { header: 'Rank', key: 'class_rank' },
          { header: 'Reg. Number', key: 'register_number' },
          { header: 'Student Name', key: 'full_name' },
          { header: 'Dept', key: 'department_code' },
          { header: 'Sem', key: 'semester' },
          { header: 'CGPA', key: 'cgpa' },
          { header: 'SGPA', key: 'latest_sgpa' },
          { header: 'Attendance %', key: 'attendance_pct' },
          { header: 'Arrears', key: 'total_active_arrears' },
          { header: 'Status', key: 'result_status' },
        ];
        const rows = filteredStudents.map((s) => ({
          class_rank: s.class_rank,
          register_number: s.register_number,
          full_name: s.full_name,
          department_code: s.department_code,
          semester: `Sem ${s.semester}`,
          cgpa: s.cgpa.toFixed(2),
          latest_sgpa: s.latest_sgpa.toFixed(2),
          attendance_pct: `${s.attendance_pct}%`,
          total_active_arrears: s.total_active_arrears || 0,
          result_status: s.result_status || 'PASS',
        }));
        return {
          title: 'Student Academic Performance Report',
          subtitle: 'Consolidated Merit & Attendance Register',
          columns,
          rows,
        };
      }

      case 'class-performance': {
        const columns = [
          { header: 'Department', key: 'dept' },
          { header: 'Semester', key: 'semester' },
          { header: 'Total Enrolled', key: 'total_students' },
          { header: 'Class Avg CGPA', key: 'avg_cgpa' },
          { header: 'Pass Percentage', key: 'pass_pct' },
          { header: 'Active Backlogs', key: 'active_arrears' },
          { header: 'Avg Attendance', key: 'avg_attendance' },
        ];
        const depts = ['CSE', 'ECE', 'MECH'];
        const rows = depts.map((d) => {
          const cohort = students.filter((s) => s.department_code === d);
          const count = cohort.length;
          const avgCgpa = count > 0 ? (cohort.reduce((a, b) => a + b.cgpa, 0) / count).toFixed(2) : '0.00';
          const passCount = cohort.filter((s) => s.result_status === 'PASS').length;
          const passPct = count > 0 ? `${Math.round((passCount / count) * 100)}%` : '0%';
          const totalArrears = cohort.reduce((a, b) => a + (b.total_active_arrears || 0), 0);
          const avgAtt = count > 0 ? `${Math.round(cohort.reduce((a, b) => a + (b.attendance_pct || 85), 0) / count)}%` : '85%';
          return {
            dept: d,
            semester: 'Sem 3 (Odd 2025-26)',
            total_students: count,
            avg_cgpa: avgCgpa,
            pass_pct: passPct,
            active_arrears: totalArrears,
            avg_attendance: avgAtt,
          };
        });
        return {
          title: 'Class Performance & Departmental Audit Report',
          subtitle: 'Institutional Cohort Benchmark Summary',
          columns,
          rows,
        };
      }

      case 'subject-wise': {
        const columns = [
          { header: 'Course Code', key: 'code' },
          { header: 'Course Title', key: 'name' },
          { header: 'Credits', key: 'credits' },
          { header: 'Department', key: 'dept' },
          { header: 'Semester', key: 'semester' },
          { header: 'Subject Avg (100)', key: 'avg_mark' },
          { header: 'Pass Percentage', key: 'pass_rate' },
        ];
        const rows = subjects.map((sub) => ({
          code: sub.code,
          name: sub.name,
          credits: sub.credits,
          dept: sub.department_id === 1 ? 'CSE' : sub.department_id === 2 ? 'ECE' : 'MECH',
          semester: `Sem ${sub.semester}`,
          avg_mark: '72 / 100',
          pass_rate: '88%',
        }));
        return {
          title: 'Subject-wise Performance & Curriculum Audit Report',
          subtitle: 'Course Level Outcomes and Passing Rates',
          columns,
          rows,
        };
      }

      case 'university-result': {
        const columns = [
          { header: 'Reg. Number', key: 'register_number' },
          { header: 'Student Name', key: 'full_name' },
          { header: 'Dept', key: 'department' },
          { header: 'Credits', key: 'credits' },
          { header: 'SGPA', key: 'sgpa' },
          { header: 'CGPA', key: 'cgpa' },
          { header: 'University Result', key: 'status' },
          { header: 'Degree Classification', key: 'classification' },
        ];
        const rows = filteredStudents.map((s) => {
          let classification = 'First Class';
          if (s.result_status === 'FAIL') classification = 'Reappear (Standing Backlog)';
          else if (s.cgpa >= 8.5) classification = 'First Class with Distinction';
          else if (s.cgpa >= 6.5) classification = 'First Class';
          else classification = 'Second Class';

          return {
            register_number: s.register_number,
            full_name: s.full_name,
            department: s.department_code,
            credits: '24 / 24',
            sgpa: s.latest_sgpa.toFixed(2),
            cgpa: s.cgpa.toFixed(2),
            status: s.result_status || 'PASS',
            classification,
          };
        });
        return {
          title: 'University Result & Degree Classification Statement',
          subtitle: 'Official Autonomous Controller of Examinations Gazette',
          columns,
          rows,
        };
      }

      case 'arrear-report': {
        const columns = [
          { header: 'Reg. Number', key: 'register_number' },
          { header: 'Student Name', key: 'student_name' },
          { header: 'Course Code', key: 'subject_code' },
          { header: 'Course Name', key: 'subject_name' },
          { header: 'Failed Sem', key: 'semester_failed' },
          { header: 'Arrear Type', key: 'type' },
          { header: 'Attempts', key: 'attempts' },
          { header: 'Status', key: 'status' },
        ];
        const rows = arrears.map((a) => ({
          register_number: a.register_number,
          student_name: a.student_name,
          subject_code: a.subject_code,
          subject_name: a.subject_name,
          semester_failed: `Sem ${a.semester_failed}`,
          type: a.type,
          attempts: a.attempts,
          status: a.status,
        }));
        return {
          title: 'Arrear & Standing Backlog Audit Register',
          subtitle: 'Supplementary Examination Candidate Master List',
          columns,
          rows,
        };
      }

      case 'at-risk-report': {
        const columns = [
          { header: 'Reg. Number', key: 'register_number' },
          { header: 'Student Name', key: 'student_name' },
          { header: 'Dept', key: 'department_name' },
          { header: 'Risk Category', key: 'risk_level' },
          { header: 'Risk Score', key: 'risk_score' },
          { header: 'Attendance %', key: 'attendance_percentage' },
          { header: 'Active Backlogs', key: 'failed_subjects_count' },
          { header: 'IA Progression', key: 'ia_diff' },
          { header: 'Key Indicator Factor', key: 'primary_factor' },
        ];
        const rows = flaggedStudents
          .filter((s) => s.risk_level === 'High' || s.risk_level === 'Medium')
          .map((s) => ({
            register_number: s.register_number,
            student_name: s.student_name,
            department_name: s.department_name,
            risk_level: s.risk_level,
            risk_score: `${s.risk_score}%`,
            attendance_percentage: `${s.attendance_percentage}%`,
            failed_subjects_count: s.failed_subjects_count,
            ia_diff: `${s.ia_diff > 0 ? '+' : ''}${s.ia_diff} pts`,
            primary_factor: s.contributing_factors?.[0] || 'Academic probation watch',
          }));
        return {
          title: 'At-Risk Student & Early Academic Intervention Report',
          subtitle: 'Machine-Learning Risk Detection & Remedial Roadmap',
          columns,
          rows,
        };
      }

      default:
        return { title: 'Academic Report', subtitle: '', columns: [], rows: [] };
    }
  };

  const reportData = getActiveReportData();

  const visibleRows = reportData.rows
    .filter((row) => Object.values(row).some((value) =>
      String(value ?? '').toLowerCase().includes(reportSearch.toLowerCase())
    ))
    .sort((first, second) => {
      const left = first[reportSort.key] ?? '';
      const right = second[reportSort.key] ?? '';
      const comparison = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
      return reportSort.direction === 'asc' ? comparison : -comparison;
    });
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const pageRows = visibleRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const changeReportSort = (key) => setReportSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }));

  const handleExportPdf = () => {
    exportReportToPdf(reportData.title, reportData.subtitle, reportData.columns, visibleRows);
  };

  const handleExportCsv = () => {
    exportReportToCsv(reportData.title, reportData.columns, visibleRows);
  };

  const handleExportExcel = async () => {
    setExportError('');
    try {
      await exportReportToExcel(reportData.title, reportData.columns, visibleRows);
    } catch (err) {
      setExportError(err.message || 'Excel report export failed.');
    }
  };

  if (loading) {
    return (
      <div aria-label="Loading reports" className="grid gap-4">
        <div className="faculty-skeleton h-32" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="faculty-skeleton h-24" />)}
        </div>
        <div className="faculty-skeleton h-72" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div role="alert" className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Unable to load reports</h2>
        <p className="mt-2 text-sm text-slate-600">{loadError}</p>
        <button type="button" onClick={loadAllReportData} className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white rounded-2xl border border-blue-100 p-6 md:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/40 via-indigo-100/20 to-transparent pointer-events-none rounded-bl-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5 shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Institutional Audit Center
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                PDF & CSV Export Ready
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Academic Reports & Compliance Governance
            </h2>
            <p className="text-slate-600 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              Export verified institutional reports for accreditation, faculty appraisals, academic council audits,
              and semester result declarations in one-click high-resolution PDF or CSV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportPdf}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <FileText className="w-4 h-4 text-white" />
              Download PDF Report
            </button>
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl border border-slate-300/80 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 rounded-xl border border-slate-300/80 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {exportError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {exportError}
        </div>
      )}

      {/* Report Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {reportsConfig.map((rep) => {
          const Icon = rep.icon;
          const isActive = activeReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setActiveReport(rep.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-blue-700 text-white' : rep.badgeColor
                  }`}
                >
                  Report
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold leading-snug">{rep.title}</h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Table & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">{reportData.title}</h3>
            <p className="text-xs text-slate-500">{reportData.subtitle}</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              aria-label="Search report rows"
              placeholder="Search report..."
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              className="w-full sm:w-44 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Dept:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="All">All Depts</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span>Sem:</span>
              <select
                value={semFilter}
                onChange={(e) => setSemFilter(e.target.value)}
                className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="All">All Semesters</option>
                <option value="1">Sem 1</option>
                <option value="2">Sem 2</option>
                <option value="3">Sem 3</option>
                <option value="4">Sem 4</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/70">
                {reportData.columns.map((col) => (
                  <th key={col.key} className={`py-2.5 px-3 ${isNumericValue(reportData.rows[0]?.[col.key]) ? 'text-right' : 'text-left'}`}>
                    <button
                      onClick={() => changeReportSort(col.key)}
                      className="hover:text-slate-900"
                      aria-label={`Sort by ${col.header}`}
                    >
                      {col.header} {reportSort.key === col.key ? (reportSort.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                  {reportData.columns.map((col, cIdx) => {
                    const val = row[col.key];
                    const isRank = col.key === 'class_rank';
                    const isStatus = col.key === 'result_status' || col.key === 'status';
                    const isRisk = col.key === 'risk_level';

                    return (
                      <td key={cIdx} className={`py-2.5 px-3 text-slate-700 ${isNumericValue(val) ? 'text-right' : 'text-left'}`}>
                        {isRank ? (
                          <span
                            className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] font-bold ${
                              val === 1
                                ? 'bg-amber-100 text-amber-800'
                                : val === 2
                                ? 'bg-slate-200 text-slate-800'
                                : val === 3
                                ? 'bg-orange-100 text-orange-800'
                                : 'text-slate-600'
                            }`}
                          >
                            {val}
                          </span>
                        ) : isStatus ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              val === 'PASS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {val}
                          </span>
                        ) : isRisk ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              val === 'High'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {val}
                          </span>
                        ) : (
                          val
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {visibleRows.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No report entries match your search and filters. Try changing the search or selected filters.
            </div>
          )}
        </div>
        <Pagination
          currentPage={Math.min(currentPage, totalPages)}
          pageSize={pageSize}
          totalItems={visibleRows.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
