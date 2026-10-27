import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { getCollegeConfig } from '../../config/collegeConfig';
import { exportReportToExcel } from '../../services/reportsExporter';
import Pagination from '../common/Pagination';
import { extractUniversityResultsFromPdf, generateSimulatedExtractedResults } from '../../services/pdfExtractor';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Download,
  Database,
  ArrowRight,
  Filter,
  Check,
  ArrowDownUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export default function UniversityPdfExtractorView() {
  const highRiskArrearCount = getCollegeConfig().highRiskArrearCount;
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [reviewedUnparsedLines, setReviewedUnparsedLines] = useState(false);
  const [semester, setSemester] = useState(3);
  const [examSession, setExamSession] = useState('Apr/May 2026');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [commitStatus, setCommitStatus] = useState(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'register_number', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadUniversityAnalytics();
  }, [highRiskArrearCount]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, extractedData?.records?.length]);

  const loadUniversityAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      setAnalytics(await api.getUniversityResultAnalytics(highRiskArrearCount));
    } catch (err) {
      setAnalyticsError(err.message || 'Unable to load saved university result analytics.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile) return;
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files can be processed by the university result extractor.');
      setExtractedData(null);
      setReviewedUnparsedLines(false);
      setFile(null);
      return;
    }
    setFile(uploadedFile);
    setExtractedData(null);
    setUploadError('');
    setIsProcessing(true);
    setCommitStatus(null);

    try {
      const result = await extractUniversityResultsFromPdf(uploadedFile);
      setExtractedData(result);
    } catch (err) {
      console.error('Error parsing PDF:', err);
      setUploadError(err.message || 'The PDF could not be read. No result records were created.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    setIsProcessing(true);
    setFile({ name: 'IIE_Anna_Univ_Autonomous_Results_NovDec2025.pdf', size: 142050 });
    setUploadError('');
    setExtractedData(null);
    setReviewedUnparsedLines(false);
    setCommitStatus(null);
    setTimeout(() => {
      const sample = generateSimulatedExtractedResults();
      setExtractedData(sample);
      setIsProcessing(false);
    }, 400);
  };

  const handleCommitToDatabase = async () => {
    if (!extractedData || !extractedData.records) return;
    if (!examSession.trim() || !Number.isInteger(Number(semester)) || semester < 1 || semester > 8) {
      setCommitStatus({
        success: false,
        message: 'Enter a valid examination session and semester (1–8) before saving results.',
      });
      return;
    }
    if (extractedData.records.some((record) => !record.is_valid)) {
      setCommitStatus({
        success: false,
        message: 'Resolve all flagged result rows before committing this examination session.',
      });
      return;
    }
    if (extractedData.unparsed_lines?.length && !reviewedUnparsedLines) {
      setCommitStatus({
        success: false,
        message: 'Review the unparsed PDF lines before importing the recognized rows.',
      });
      return;
    }
    setIsCommitting(true);
    try {
      const res = await api.commitExtractedPdfResults(
        extractedData.records,
        Number(semester),
        examSession.trim()
      );
      await loadUniversityAnalytics();
      setCommitStatus({
        success: true,
        message: res.message || `Saved ${res.imported_count} university results to student examination histories.`,
        updatedCount: res.imported_count,
      });
    } catch (err) {
      setCommitStatus({
        success: false,
        message: err.message || 'Failed to commit results to database.',
      });
    } finally {
      setIsCommitting(false);
    }
  };

  const handleRecordEdit = (recordId, field, value) => {
    setExtractedData((current) => {
      if (!current) return current;
      const editedRecords = current.records.map((record) =>
        record.id === recordId ? { ...record, [field]: value } : record
      );
      const seen = new Set();
      const records = editedRecords.map((record) => {
        const registerNumber = String(record.register_number || '').trim().toUpperCase();
        const subjectCode = String(record.subject_code || '').trim().toUpperCase();
        const key = `${registerNumber}:${subjectCode}`;
        const duplicate = seen.has(key);
        seen.add(key);
        const valid =
          !duplicate &&
          Boolean(registerNumber) &&
          Boolean(subjectCode) &&
          Boolean(String(record.grade || '').trim()) &&
          ['PASS', 'FAIL', 'WITHHELD'].includes(record.result_status);
        return {
          ...record,
          is_arrear: record.result_status === 'FAIL',
          is_valid: valid,
          validation_error: duplicate
            ? 'Duplicate student and subject row; verify the result sheet.'
            : valid
              ? ''
              : 'Register number, subject code, grade, and result status are required.',
        };
      });
      return {
        ...current,
        records,
        total_extracted: records.length,
        passed_count: records.filter((record) => record.result_status === 'PASS').length,
        arrear_count: records.filter((record) => record.result_status === 'FAIL').length,
      };
    });
  };

  const filteredRecords = (extractedData?.records || []).filter((r) => {
    const matchesSearch =
      String(r.register_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.subject_code || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'PASS') return r.result_status === 'PASS';
    if (statusFilter === 'FAIL') return r.result_status === 'FAIL' || r.is_arrear;
    return true;
  });
  const sortedRecords = [...filteredRecords].sort((left, right) => {
    const first = left[sortConfig.key] ?? '';
    const second = right[sortConfig.key] ?? '';
    const comparison = typeof first === 'number' && typeof second === 'number'
      ? first - second
      : String(first).localeCompare(String(second), undefined, { numeric: true, sensitivity: 'base' });
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const visibleRecords = sortedRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const changeSort = (key) => setSortConfig((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }));

  const exportPreviewCsv = () => {
    const columns = [
      ['Reg. Number', 'register_number'],
      ['Student Name', 'student_name'],
      ['Subject Code', 'subject_code'],
      ['Course Name', 'subject_name'],
      ['External Marks', 'external_marks'],
      ['Total Marks', 'total_marks'],
      ['Grade', 'grade'],
      ['Result Status', 'result_status'],
      ['Arrear Flag', 'is_arrear'],
    ];
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const content = [
      columns.map(([header]) => escapeCsv(header)).join(','),
      ...sortedRecords.map((record) => columns.map(([, key]) => escapeCsv(record[key])).join(',')),
    ].join('\r\n');
    const url = window.URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `university_results_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  };
  const exportPreviewExcel = async () => {
    const columns = [
      { header: 'Register Number', key: 'register_number' },
      { header: 'Student Name', key: 'student_name' },
      { header: 'Subject Code', key: 'subject_code' },
      { header: 'Course Name', key: 'subject_name' },
      { header: 'External Marks', key: 'external_marks' },
      { header: 'Total Marks', key: 'total_marks' },
      { header: 'Grade', key: 'grade' },
      { header: 'Result Status', key: 'result_status' },
      { header: 'Arrear Flag', key: 'is_arrear' },
    ];
    try {
      await exportReportToExcel('university_results_preview', columns, sortedRecords);
    } catch (error) {
      setUploadError(error.message || 'Excel export failed.');
    }
  };

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
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Module B · PDF Optical Parser
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                Autonomous University Format
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Module B · University Results
            </h2>
            <p className="text-slate-600 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              Upload official Controller of Examinations consolidated result sheets (PDF). Review extracted
              student records and grades before saving university exam history.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLoadSample}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Load Sample University Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <label className="text-xs font-semibold text-slate-600">
            Examination semester
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                <option key={value} value={value}>Semester {value}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Examination session
            <input
              value={examSession}
              onChange={(e) => setExamSession(e.target.value)}
              maxLength={100}
              placeholder="e.g. Nov/Dec 2025"
              className="mt-1 block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </label>
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center cursor-pointer relative"
        >
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {file ? file.name : 'Drag & Drop University Result PDF here'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            Supports standard university consolidated semester marksheets, grade cards, and notification PDFs.
          </p>
          <span className="mt-3 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
            Browse PDF File from Computer
          </span>
        </div>

        {isProcessing && (
          <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="text-xs text-blue-800 font-semibold">
              Extracting candidate register numbers, subject codes, grades, and result status...
            </p>
          </div>
        )}
        {uploadError && (
          <div role="alert" className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800">
            {uploadError}
          </div>
        )}
      </div>

      <section className="space-y-4" aria-labelledby="saved-results-heading">
        <div>
          <h3 id="saved-results-heading" className="text-lg font-bold text-slate-900">Saved university result analytics</h3>
          <p className="text-sm text-slate-500">Latest attempt per student and subject, with historical arrear patterns.</p>
        </div>
        {analyticsLoading ? (
          <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Loading saved result analytics…
          </div>
        ) : analyticsError ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {analyticsError}
            <button onClick={loadUniversityAnalytics} className="ml-3 font-bold underline">Retry</button>
          </div>
        ) : analytics?.summary?.total_attempts ? (
          <>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
              {[
                ['Students with results', analytics.summary.total_students],
                ['All-clear students', analytics.summary.all_clear_students],
                ['Students with arrears', analytics.summary.students_with_arrears],
                ['Current arrears', analytics.summary.total_current_arrears],
                ['Overall pass rate', `${analytics.summary.pass_percentage}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
                <h4 className="mb-3 text-sm font-bold text-slate-800">Current arrears by subject</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.subject_stats.slice(0, 8)} margin={{ left: 0, right: 12, bottom: 28 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="subject_code" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="current_arrears" name="Current arrears" fill="#b91c1c" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="mb-3 text-sm font-bold text-slate-800">Latest attempt outcomes</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pass', value: analytics.summary.pass_count },
                          { name: 'Fail', value: analytics.summary.fail_count },
                          { name: 'Withheld', value: analytics.summary.withheld_count },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                      >
                        <Cell fill="#15803d" />
                        <Cell fill="#b91c1c" />
                        <Cell fill="#b45309" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-center text-xs text-slate-500">
                  {analytics.summary.pass_count} passed · {analytics.summary.fail_count} failed · {analytics.summary.withheld_count} withheld
                </p>
              </div>
              {analytics.session_trend.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-3">
                  <h4 className="mb-3 text-sm font-bold text-slate-800">Pass rate and arrear trend by examination session</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.session_trend} margin={{ left: 0, right: 12, bottom: 28 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="session" angle={-20} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="rate" domain={[0, 100]} unit="%" />
                        <YAxis yAxisId="arrears" orientation="right" allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="rate" type="monotone" dataKey="pass_percentage" name="Pass rate (%)" stroke="#13315c" strokeWidth={2} dot={{ r: 3 }} />
                        <Line yAxisId="arrears" type="monotone" dataKey="fail_count" name="Failed attempts" stroke="#b91c1c" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-3">
                <h4 className="mb-3 text-sm font-bold text-slate-800">Subject-wise pass percentage</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.subject_stats} margin={{ left: 0, right: 12, bottom: 28 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="subject_code" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} unit="%" />
                      <Tooltip formatter={(value) => [`${value}%`, 'Pass rate']} />
                      <Bar dataKey="pass_percentage" name="Pass rate" fill="#13315c" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="mb-3 text-sm font-bold text-slate-800">Recurring arrears</h4>
                {analytics.recurring_arrears.length ? (
                  <ul className="space-y-2">
                    {analytics.recurring_arrears.slice(0, 8).map((row) => (
                      <li key={`${row.register_number}-${row.subject_code}`} className="flex justify-between gap-3 rounded-xl bg-rose-50 px-3 py-2 text-xs">
                        <span><strong>{row.register_number}</strong> · {row.subject_code} — {row.student_name}</span>
                        <span className="shrink-0 font-bold text-rose-700">{row.failed_attempts} fails</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-500">No recurring subject arrears found.</p>}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="mb-3 text-sm font-bold text-slate-800">High-risk students · {highRiskArrearCount}+ current arrears</h4>
                {analytics.high_risk_students.length ? (
                  <ul className="space-y-2">
                    {analytics.high_risk_students.map((row) => (
                      <li key={row.register_number} className="flex justify-between gap-3 rounded-xl bg-amber-50 px-3 py-2 text-xs">
                        <span><strong>{row.register_number}</strong> · {row.student_name}</span>
                        <span className="shrink-0 font-bold text-amber-800">{row.current_arrears} arrears</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-500">No students currently meet the {highRiskArrearCount}-arrear threshold.</p>}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No university results have been saved yet. Upload and commit a result PDF to see pass rates, arrears, and session trends.
          </div>
        )}
      </section>

      {/* Commit status banner */}
      {commitStatus && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            commitStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {commitStatus.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <h4 className="text-sm font-bold">{commitStatus.success ? 'Database Synchronization Complete' : 'Commit Failed'}</h4>
              <p className="text-xs opacity-90">{commitStatus.message}</p>
            </div>
          </div>
          <button
            onClick={() => setCommitStatus(null)}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-white/80 hover:bg-white text-slate-800 shadow-2xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Extracted Results Table & Metrics */}
      {extractedData && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-xs font-semibold text-slate-500">Total Extracted Records</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{extractedData.total_extracted}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Parsed from PDF text stream</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-xs font-semibold text-emerald-600">Passed Subject Units</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{extractedData.passed_count}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {extractedData.total_extracted
                  ? `${Math.round((extractedData.passed_count / extractedData.total_extracted) * 100)}% pass percentage`
                  : 'No recognized result rows'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-xs font-semibold text-rose-600">Identified Arrears / Backlogs</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{extractedData.arrear_count}</p>
              <p className="text-[11px] text-rose-500 mt-0.5 font-medium">Automatic backlog flagged</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl text-white shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-blue-100">Commit Ready</p>
                <p className="text-xs text-blue-200 mt-0.5">Sync grades with student database</p>
              </div>
              <button
                onClick={handleCommitToDatabase}
                disabled={isCommitting || extractedData.is_demo || extractedData.records.length === 0 || extractedData.records.some((record) => !record.is_valid)}
                className="mt-3 w-full py-2 bg-white text-blue-900 font-extrabold text-xs rounded-xl shadow-xs hover:bg-blue-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCommitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                    Committing...
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    Commit to Database
                  </>
                )}
              </button>
            </div>
          </div>

          {(extractedData.is_demo || extractedData.unparsed_lines?.length > 0) && (
            <div className="p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 text-xs">
              {extractedData.is_demo
                ? 'Demo records are shown for preview only. They are not extracted from the selected PDF and cannot be saved.'
                : `${extractedData.unparsed_lines.length} PDF text line(s) could not be matched to a complete student, subject, and grade row. Verify the source sheet before importing.`}
              {!extractedData.is_demo && extractedData.unparsed_lines?.length > 0 && (
                <>
                  <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto list-disc pl-5">
                    {extractedData.unparsed_lines.slice(0, 20).map((line) => (
                      <li key={`${line.line_number}-${line.text}`}>
                        Line {line.line_number}: {line.text}
                      </li>
                    ))}
                  </ul>
                  {extractedData.unparsed_lines.length > 20 && (
                    <p className="mt-1">Showing first 20 lines.</p>
                  )}
                  <label className="mt-3 flex items-center gap-2 font-semibold">
                    <input
                      type="checkbox"
                      checked={reviewedUnparsedLines}
                      onChange={(e) => setReviewedUnparsedLines(e.target.checked)}
                    />
                    I reviewed the unparsed lines and confirmed they do not contain result records to import.
                  </label>
                </>
              )}
            </div>
          )}

          {extractedData.records.length === 0 && (
            <div role="status" className="p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 text-xs">
              No result rows were extracted from the PDF or OCR text. Check the layout and extraction preview; no sample records were substituted.
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Extracted Candidate Results</h3>
                <p className="text-xs text-slate-500">
                  Inspect parsed university grades and marks before committing to student histories
                </p>
                {extractedData.extraction_method && (
                  <p className="mt-1 text-[11px] font-semibold text-blue-700">Text source: {extractedData.extraction_method}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter register / subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {['All', 'PASS', 'FAIL'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        statusFilter === filter
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {filter === 'FAIL' ? 'Arrears Only' : filter}
                    </button>
                  ))}
                </div>
                <button
                  onClick={exportPreviewCsv}
                  disabled={sortedRecords.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
                <button
                  onClick={exportPreviewExcel}
                  disabled={sortedRecords.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" /> Export Excel
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                    {[
                      ['Reg. Number', 'register_number'],
                      ['Student Name', 'student_name'],
                      ['Subject Code', 'subject_code'],
                      ['Course Name', 'subject_name'],
                      ['External Marks', 'external_marks'],
                      ['Total (100)', 'total_marks'],
                      ['Grade', 'grade'],
                      ['Result Status', 'result_status'],
                      ['Arrear Flag', 'is_arrear'],
                    ].map(([label, key]) => (
                      <th key={key} className="py-2.5 px-3">
                        <button onClick={() => changeSort(key)} className="inline-flex items-center gap-1 hover:text-slate-800">
                          {label}<ArrowDownUp className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleRecords.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <input
                          aria-label={`Register number for row ${i + 1}`}
                          value={r.register_number}
                          onChange={(e) => handleRecordEdit(r.id, 'register_number', e.target.value)}
                          className="w-40 px-2 py-1 border border-slate-200 rounded font-mono font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{r.student_name || 'Enrolled Scholar'}</td>
                      <td className="py-2.5 px-3">
                        <input
                          aria-label={`Subject code for row ${i + 1}`}
                          value={r.subject_code}
                          onChange={(e) => handleRecordEdit(r.id, 'subject_code', e.target.value)}
                          className="w-24 px-2 py-1 border border-slate-200 rounded font-mono font-semibold text-blue-700"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{r.subject_name || 'Course Module'}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{r.external_marks ?? '--'}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{r.total_marks ?? '--'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          aria-label={`Grade for row ${i + 1}`}
                          value={r.grade}
                          onChange={(e) => handleRecordEdit(r.id, 'grade', e.target.value.toUpperCase())}
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-center font-black"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <select
                          aria-label={`Result status for row ${i + 1}`}
                          value={r.result_status}
                          onChange={(e) => handleRecordEdit(r.id, 'result_status', e.target.value)}
                          className="px-2 py-1 border border-slate-200 rounded font-bold"
                        >
                          <option value="PASS">PASS</option>
                          <option value="FAIL">FAIL</option>
                          <option value="WITHHELD">WITHHELD</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {r.is_arrear ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Arrear Tracked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-[10px] text-emerald-600">
                            <Check className="w-3 h-3" /> Cleared
                          </span>
                        )}
                        {!r.is_valid && (
                          <p className="mt-1 text-[10px] text-rose-700">
                            {r.validation_error || 'Verify this row'}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRecords.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  No result records match your search and filters. Review the extraction or adjust the filters.
                </div>
              )}
            </div>
            <Pagination
              currentPage={Math.min(currentPage, totalPages)}
              pageSize={pageSize}
              totalItems={sortedRecords.length}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
