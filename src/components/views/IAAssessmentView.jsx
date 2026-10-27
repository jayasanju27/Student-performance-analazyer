import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getCollegeConfig } from '../../config/collegeConfig';
import { exportReportToExcel } from '../../services/reportsExporter';
import Pagination from '../common/Pagination';
import {
  Award,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  BarChart3,
  Sparkles,
  Download,
  UploadCloud
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
  Cell,
  PieChart,
  Pie
} from 'recharts';

const isValidMark = (value, max = 50) => Number.isFinite(value) && value >= 0 && value <= max;

export default function IAAssessmentView() {
  const { role } = useAuth();
  const thresholds = getCollegeConfig();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [semester, setSemester] = useState(3);
  const [iaData, setIaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrend, setFilterTrend] = useState('All');
  const [importError, setImportError] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [improvementThreshold] = useState(() => getCollegeConfig().improvementThresholdPct);
  const [declineThreshold] = useState(() => getCollegeConfig().declineThresholdPct);
  const [tableSort, setTableSort] = useState({ key: 'average', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadSubjects();
  }, [role]);

  useEffect(() => {
    setIaData((rows) => rows.map((row) => {
      const complete = isValidMark(row.ia1_mark, row.ia1_max || 50) && isValidMark(row.ia2_mark, row.ia2_max || 50);
      const delta = complete ? ((row.ia2_mark / (row.ia2_max || 50)) - (row.ia1_mark / (row.ia1_max || 50))) * 100 : 0;
      return { ...row, trend: !complete ? 'Pending' : delta > improvementThreshold ? 'Improved' : delta < -declineThreshold ? 'Declined' : 'Steady' };
    }));
  }, [improvementThreshold, declineThreshold]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadIaData(selectedSubjectId, semester);
    }
  }, [selectedSubjectId, semester]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTrend, selectedSubjectId, semester]);

  const loadSubjects = async () => {
    setLoading(true);
    setError('');
    try {
      const subs = role === 'faculty' ? await api.getFacultyAssignedSubjects() : await api.getSubjects();
      const sortedSubs = [...subs].sort((a, b) => (a.semester - b.semester) || a.code.localeCompare(b.code));
      setSubjects(sortedSubs);
      if (sortedSubs.length > 0) {
        setSelectedSubjectId((current) => {
          if (current && sortedSubs.some((s) => s.id === current)) return current;
          const defaultSubject = sortedSubs.find((s) => s.code === 'MA3391') || sortedSubs.find((s) => s.semester === 4) || sortedSubs[0];
          setSemester(defaultSubject.semester || 4);
          return defaultSubject.id;
        });
      }
    } catch (e) {
      setError(e.message || 'Unable to load assigned subjects.');
    } finally {
      setLoading(false);
    }
  };

  const loadIaData = async (subId, sem) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getIaMarks(subId, sem);
      setIaData(data.map((row) => {
        const complete = isValidMark(row.ia1_mark, row.ia1_max || 50) && isValidMark(row.ia2_mark, row.ia2_max || 50);
        const delta = complete ? ((row.ia2_mark / (row.ia2_max || 50)) - (row.ia1_mark / (row.ia1_max || 50))) * 100 : 0;
        return { ...row, trend: !complete ? 'Pending' : delta > improvementThreshold ? 'Improved' : delta < -declineThreshold ? 'Declined' : 'Steady' };
      }));
    } catch (e) {
      setError(e.message || 'Unable to load assessment marks.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, field, value) => {
    const mark = value === '' ? null : Number.parseFloat(value);
    const validMark = mark === null || Number.isFinite(mark) ? mark : null;
    setIaData((current) => current.map((row) => {
      if (row.student_id !== studentId) return row;
      const updated = { ...row, [field]: validMark };
      const ia1Max = updated.ia1_max || 50;
      const ia2Max = updated.ia2_max || 50;
      const complete = isValidMark(updated.ia1_mark, ia1Max) && isValidMark(updated.ia2_mark, ia2Max);
      const diff = complete ? updated.ia2_mark - updated.ia1_mark : null;
      const percentageDiff = complete ? ((updated.ia2_mark / ia2Max) - (updated.ia1_mark / ia1Max)) * 100 : 0;
      return {
        ...updated,
        ia_diff: diff,
        trend: !complete ? 'Pending' : percentageDiff > improvementThreshold ? 'Improved' : percentageDiff < -declineThreshold ? 'Declined' : 'Steady',
        converted_internal: complete
          ? Math.round((((updated.ia1_mark / ia1Max + updated.ia2_mark / ia2Max) / 2) * (currentSubject?.max_internal || 30)) * 10) / 10
          : null,
      };
    }));
  };

  const handleSaveRow = async (row) => {
    if (!isValidMark(row.ia1_mark, row.ia1_max || 50) || !isValidMark(row.ia2_mark, row.ia2_max || 50)) {
      alert('Enter valid IA marks between 0 and their configured maximum before saving this student.');
      return;
    }
    try {
      await api.recordIaMark({
        student_id: row.student_id,
        subject_id: selectedSubjectId,
        semester,
        ia1_mark: row.ia1_mark,
        ia2_mark: row.ia2_mark,
        ia1_max: row.ia1_max || 50,
        ia2_max: row.ia2_max || 50,
      });
      setSuccessMsg(`IA marks saved for ${row.student_name}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error saving IA mark: ' + err.message);
    }
  };

  const handleSaveAll = async () => {
    if (iaData.some((row) => !isValidMark(row.ia1_mark, row.ia1_max || 50) || !isValidMark(row.ia2_mark, row.ia2_max || 50))) {
      alert('Enter valid IA marks within each configured maximum before saving all entries.');
      return;
    }
    try {
      for (const row of iaData) {
        await api.recordIaMark({
          student_id: row.student_id,
          subject_id: selectedSubjectId,
          semester,
          ia1_mark: row.ia1_mark,
          ia2_mark: row.ia2_mark,
          ia1_max: row.ia1_max || 50,
          ia2_max: row.ia2_max || 50,
        });
      }
      setSuccessMsg(`All ${iaData.length} student IA records updated successfully!`);
      setTimeout(() => setSuccessMsg(''), 3500);
      loadIaData(selectedSubjectId, semester);
    } catch (err) {
      alert('Batch save error: ' + err.message);
    }
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleImportFile = async (file) => {
    if (!file) return;
    setImporting(true);
    setImportError('');
    setImportMessage('');
    try {
      const result = await api.importIaMarks(file);
      setImportMessage(result.message);
      await loadSubjects();
      if (selectedSubjectId) {
        await loadIaData(selectedSubjectId, semester);
      }
    } catch (error) {
      setImportError(error.message || 'The assessment file could not be imported.');
    } finally {
      setImporting(false);
    }
  };

  // Filtered rows
  const filteredRows = iaData.filter((r) => {
    const matchSearch =
      r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.register_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTrend = filterTrend === 'All' || r.trend === filterTrend;
    return matchSearch && matchTrend;
  }).sort((first, second) => {
    const firstAverage = (first.ia1_mark / (first.ia1_max || 50) + first.ia2_mark / (first.ia2_max || 50)) / 2;
    const secondAverage = (second.ia1_mark / (second.ia1_max || 50) + second.ia2_mark / (second.ia2_max || 50)) / 2;
    return secondAverage - firstAverage;
  });

  // Calculate cohort aggregates
  const completedRows = iaData.filter((row) =>
    isValidMark(row.ia1_mark, row.ia1_max || 50) && isValidMark(row.ia2_mark, row.ia2_max || 50)
  );
  const ia1Avg = completedRows.length > 0
    ? Math.round((completedRows.reduce((sum, row) => sum + (row.ia1_mark / (row.ia1_max || 50)) * 50, 0) / completedRows.length) * 10) / 10
    : 0;
  const ia2Avg = completedRows.length > 0
    ? Math.round((completedRows.reduce((sum, row) => sum + (row.ia2_mark / (row.ia2_max || 50)) * 50, 0) / completedRows.length) * 10) / 10
    : 0;
  const netDiff = Math.round((ia2Avg - ia1Avg) * 10) / 10;

  const improvedCount = completedRows.filter((r) => r.trend === 'Improved').length;
  const declinedCount = completedRows.filter((r) => r.trend === 'Declined').length;
  const steadyCount = completedRows.filter((r) => r.trend === 'Steady').length;

  const chartData = completedRows.slice(0, 10).map((r) => ({
    name: r.student_name.split(' ')[0],
    ia1: Math.round((r.ia1_mark / (r.ia1_max || 50)) * 50),
    ia2: Math.round((r.ia2_mark / (r.ia2_max || 50)) * 50),
    diff: r.ia_diff,
  }));
  const rankedRows = [...completedRows].sort((first, second) => {
    const firstAverage = (first.ia1_mark / (first.ia1_max || 50) + first.ia2_mark / (first.ia2_max || 50)) / 2;
    const secondAverage = (second.ia1_mark / (second.ia1_max || 50) + second.ia2_mark / (second.ia2_max || 50)) / 2;
    return secondAverage - firstAverage;
  });
  const ranks = new Map(rankedRows.map((row, index) => [row.student_id, index + 1]));
  const sortedRows = [...filteredRows].sort((first, second) => {
    const valueFor = (row) => {
      if (tableSort.key === 'rank') return ranks.get(row.student_id) || Number.MAX_SAFE_INTEGER;
      if (tableSort.key === 'average') return (row.ia1_mark / (row.ia1_max || 50) + row.ia2_mark / (row.ia2_max || 50)) / 2;
      if (tableSort.key === 'converted_internal') return row.converted_internal ?? -1;
      return row[tableSort.key] ?? '';
    };
    const left = valueFor(first);
    const right = valueFor(second);
    const comparison = typeof left === 'number' && typeof right === 'number'
      ? left - right
      : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
    return tableSort.direction === 'asc' ? comparison : -comparison;
  });
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const visibleRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const changeTableSort = (key) => setTableSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }));
  const distribution = [
    { range: '0–39%', count: completedRows.filter((row) => (row.ia1_mark / (row.ia1_max || 50) + row.ia2_mark / (row.ia2_max || 50)) / 2 < 0.4).length },
    { range: '40–59%', count: completedRows.filter((row) => { const average = (row.ia1_mark / (row.ia1_max || 50) + row.ia2_mark / (row.ia2_max || 50)) / 2; return average >= 0.4 && average < 0.6; }).length },
    { range: '60–79%', count: completedRows.filter((row) => { const average = (row.ia1_mark / (row.ia1_max || 50) + row.ia2_mark / (row.ia2_max || 50)) / 2; return average >= 0.6 && average < 0.8; }).length },
    { range: '80–100%', count: completedRows.filter((row) => (row.ia1_mark / (row.ia1_max || 50) + row.ia2_mark / (row.ia2_max || 50)) / 2 >= 0.8).length },
  ];
  const needsAttention = iaData.map((row) => {
    const average = row.ia1_mark == null || row.ia2_mark == null
      ? null
      : ((row.ia1_mark / (row.ia1_max || 50) + row.ia2_mark / (row.ia2_max || 50)) / 2) * 100;
    const reasons = [];
    if (average !== null && average < 50) reasons.push('Average below 50%');
    if (row.ia2_mark !== null && row.ia2_mark < (row.ia2_max || 50) * (thresholds.passMarkPct / 100)) reasons.push('IA-2 below pass threshold');
    if (row.trend === 'Declined') reasons.push(`Decline over ${declineThreshold}%`);
    return { ...row, reasons };
  }).filter((row) => row.reasons.length);
  const exportCsv = () => {
    const headers = ['Rank', 'RegNo', 'Name', 'Subject', 'IA1', 'IA1Max', 'IA2', 'IA2Max', 'CombinedPercent', 'Trend'];
    const lines = sortedRows.map((row) => [
      ranks.get(row.student_id) || '',
      row.register_number,
      row.student_name,
      currentSubject?.code || '',
      row.ia1_mark ?? '',
      row.ia1_max || 50,
      row.ia2_mark ?? '',
      row.ia2_max || 50,
      row.ia1_mark == null || row.ia2_mark == null ? '' : Math.round(((row.ia1_mark / (row.ia1_max || 50) + row.ia2_mark / (row.ia2_max || 50)) / 2) * 100),
      row.trend,
    ]);
    const content = [headers, ...lines]
      .map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSubject?.code || 'ia'}_assessment.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const exportExcel = async () => {
    const columns = [
      { header: 'Rank', key: 'rank' },
      { header: 'Register Number', key: 'register_number' },
      { header: 'Student Name', key: 'student_name' },
      { header: 'Subject', key: 'subject' },
      { header: 'IA-1', key: 'ia1_mark' },
      { header: 'IA-1 Maximum', key: 'ia1_max' },
      { header: 'IA-2', key: 'ia2_mark' },
      { header: 'IA-2 Maximum', key: 'ia2_max' },
      { header: 'Combined Percentage', key: 'combined_percentage' },
      { header: 'Trend', key: 'trend' },
    ];
    const rows = sortedRows.map((row) => ({
      rank: ranks.get(row.student_id) || '',
      register_number: row.register_number,
      student_name: row.student_name,
      subject: currentSubject?.code || '',
      ia1_mark: row.ia1_mark ?? '',
      ia1_max: row.ia1_max || 50,
      ia2_mark: row.ia2_mark ?? '',
      ia2_max: row.ia2_max || 50,
      combined_percentage: row.ia1_mark == null || row.ia2_mark == null
        ? ''
        : Math.round(((row.ia1_mark / (row.ia1_max || 50) + row.ia2_mark / (row.ia2_max || 50)) / 2) * 100),
      trend: row.trend,
    }));
    try {
      await exportReportToExcel(`${currentSubject?.code || 'ia'}_assessment`, columns, rows);
    } catch (error) {
      setImportError(error.message || 'Excel export failed.');
    }
  };

  if (loading) {
    return (
      <div aria-label="Loading IA assessment" className="space-y-4">
        <div className="faculty-skeleton h-28" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="faculty-skeleton h-24" />)}
        </div>
        <div className="faculty-skeleton h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              Module A · Internal Assessment Analyzer
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            IA-1 & IA-2 performance
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track student score changes between Internal Assessment 1 and 2, identify declining scholars, and calculate converted internal marks (out of 30).
          </p>
        </div>

        {/* Course dropdown */}
        <div className="w-full md:w-80">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Course Selected:
          </label>
          <select
            value={selectedSubjectId || ''}
            onChange={(e) => {
              const sid = parseInt(e.target.value, 10);
              setSelectedSubjectId(sid);
              const sub = subjects.find((s) => s.id === sid);
              if (sub) setSemester(sub.semester);
            }}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name} (Sem {s.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => selectedSubjectId ? loadIaData(selectedSubjectId, semester) : loadSubjects()} className="w-fit rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-rose-800">Retry</button>
        </div>
      )}

      {!loading && subjects.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No subjects are assigned to your faculty account yet.
        </div>
      )}

      {(importError || importMessage) && (
        <div
          role={importError ? 'alert' : 'status'}
          className={`rounded-xl border px-4 py-3 text-sm ${importError ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}
        >
          {importError || importMessage}
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Import assessment marks</h3>
          <p className="mt-1 text-xs text-slate-500">CSV or Excel columns: RegNo, Name, Subject, IA1, IA2, MaxMarks.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => api.downloadIaTemplate().catch((error) => setImportError(error.message))}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" /> Download template
          </button>
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 ${importing ? 'pointer-events-none opacity-60' : ''}`}>
            <UploadCloud className="h-4 w-4" />
            {importing ? 'Importing…' : 'Upload marks'}
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="sr-only"
              disabled={importing}
              onChange={(event) => {
                handleImportFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </label>
        </div>
      </section>

      {/* IA Performance KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] text-slate-400 font-bold uppercase">IA-1 Class Average</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{ia1Avg} / 50</p>
          <p className="text-[10px] text-slate-400">Recorded students: {completedRows.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] text-slate-400 font-bold uppercase">IA-2 Class Average</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{ia2Avg} / 50</p>
          <p className="text-[10px] text-slate-400">Recorded students: {completedRows.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] text-slate-400 font-bold uppercase">Net Progression Delta</p>
          <p className={`text-2xl font-black mt-0.5 flex items-center gap-1 ${netDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {netDiff >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {netDiff >= 0 ? `+${netDiff}` : netDiff}
          </p>
          <p className="text-[10px] text-slate-400">Cohort progression trend</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] text-slate-400 font-bold uppercase">Cohort Trend Breakdown</p>
          <div className="flex items-center gap-2 mt-1 text-xs font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{improvedCount} Improved</span>
            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded">{declinedCount} Dropped</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{steadyCount} stayed steady</p>
        </div>
      </div>

      {/* IA Comparison Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">IA-1 vs IA-2 Score Progression</h3>
            <p className="text-xs text-slate-500">Scores are normalized to a 50-mark scale for comparison.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
            Internal Assessments
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={13} fontWeight={600} />
              <YAxis domain={[0, 50]} stroke="#64748b" fontSize={13} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="ia1" name="IA-1 (Max 50)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ia2" name="IA-2 (Max 50)" fill="#0e9aa7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Performance distribution</h3>
          <p className="mb-3 mt-1 text-xs text-slate-500">Combined IA average by percentage of the configured maximum.</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="range" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" name="Students" fill="#13315c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Assessment movement</h3>
          <p className="mb-3 mt-1 text-xs text-slate-500">Improved, steady, and declining students using your threshold.</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Improved', value: improvedCount, fill: '#15803d' },
                    { name: 'Declined', value: declinedCount, fill: '#b91c1c' },
                    { name: 'Steady', value: steadyCount, fill: '#64748b' },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={78}
                  label
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search scholar by name or Register Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={exportExcel} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export Excel
          </button>
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <span className="text-xs text-slate-600">
            Improvement ≥ {improvementThreshold}% · decline ≥ {declineThreshold}%
          </span>
          <select
            value={filterTrend}
            onChange={(e) => setFilterTrend(e.target.value)}
            className="py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Progression Tiers</option>
            <option value="Improved">Improved (over threshold)</option>
            <option value="Declined">Declined (over threshold)</option>
            <option value="Steady">Steady performance</option>
          </select>

          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save All Entries
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-1 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Needs attention</h3>
            <p className="mt-1 text-xs text-slate-500">Low average, IA-2 below {thresholds.passMarkPct}%, or decline beyond {declineThreshold}%.</p>
          </div>
          <span className="w-fit rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">{needsAttention.length} flagged</span>
        </div>
        {needsAttention.length ? (
          <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {needsAttention.map((row) => (
              <div key={row.student_id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">{row.student_name}</p>
                <p className="mt-1 font-mono text-xs text-slate-600">{row.register_number}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {row.reasons.map((reason) => (
                    <span key={reason} className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">{reason}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : <p className="p-6 text-center text-xs text-slate-500">No students currently meet the attention criteria.</p>}
      </section>

      {/* IA Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                {[
                  ['Rank', 'rank'],
                  ['Student', 'student_name'],
                  ['Register Number', 'register_number'],
                  ['IA-1 Mark', 'ia1_mark'],
                  ['IA-2 Mark', 'ia2_mark'],
                  ['Progression Delta', 'ia_diff'],
                  ['Converted Internal (30)', 'converted_internal'],
                  ['Standing Trend', 'trend'],
                ].map(([label, key]) => (
                  <th key={key} className="py-3 px-4">
                    <button type="button" onClick={() => changeTableSort(key)} className="hover:text-slate-900">
                      {label} {tableSort.key === key ? (tableSort.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </button>
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.map((row) => (
                <tr key={row.student_id} className={`${ranks.get(row.student_id) === 1 ? 'bg-amber-50/70' : ''} hover:bg-slate-50/70 transition-colors`}>
                  <td className="py-3 px-4 font-bold text-slate-700">{ranks.get(row.student_id) ? `#${ranks.get(row.student_id)}` : '—'}{ranks.get(row.student_id) === 1 && <span className="ml-1 text-amber-600">Top</span>}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{row.student_name}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700">{row.register_number}</td>

                  {/* IA 1 Input */}
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      max={row.ia1_max || 50}
                      value={row.ia1_mark ?? ''}
                      onChange={(e) => handleMarkChange(row.student_id, 'ia1_mark', e.target.value)}
                      className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-600/20"
                    />
                    {row.ia1_mark !== null && !isValidMark(row.ia1_mark, row.ia1_max || 50) && (
                      <p className="mt-1 text-[10px] text-rose-600">Max {row.ia1_max || 50}</p>
                    )}
                  </td>

                  {/* IA 2 Input */}
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      max={row.ia2_max || 50}
                      value={row.ia2_mark ?? ''}
                      onChange={(e) => handleMarkChange(row.student_id, 'ia2_mark', e.target.value)}
                      className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-600/20"
                    />
                    {row.ia2_mark !== null && !isValidMark(row.ia2_mark, row.ia2_max || 50) && (
                      <p className="mt-1 text-[10px] text-rose-600">Max {row.ia2_max || 50}</p>
                    )}
                  </td>

                  {/* Delta */}
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 font-bold ${
                      row.ia_diff > 0 ? 'text-emerald-600' : row.ia_diff < 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {row.ia_diff === null ? 'Pending' : row.ia_diff > 0 ? `+${row.ia_diff}` : row.ia_diff}
                    </span>
                  </td>

                  {/* Converted Internal (30) */}
                  <td className="py-3 px-4 font-extrabold text-blue-700">
                    {row.converted_internal === null ? '--' : `${row.converted_internal} / ${currentSubject?.max_internal || 30}`}
                  </td>

                  {/* Standing Trend */}
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      row.trend === 'Improved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : row.trend === 'Declined'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {row.trend === 'Improved' ? <TrendingUp className="w-3 h-3" /> : row.trend === 'Declined' ? <TrendingDown className="w-3 h-3" /> : null}
                      {row.trend}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSaveRow(row)}
                      disabled={!isValidMark(row.ia1_mark, row.ia1_max || 50) || !isValidMark(row.ia2_mark, row.ia2_max || 50)}
                      className="px-3 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-all ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
              {!sortedRows.length && !loading && (
                <tr><td colSpan="9" className="py-10 text-center text-slate-500">No assessment records match this subject and filter. Enter marks or import a CSV/Excel file to begin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={Math.min(currentPage, totalPages)}
          pageSize={pageSize}
          totalItems={sortedRows.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
