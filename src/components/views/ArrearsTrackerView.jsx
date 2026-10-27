import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { exportReportToPdf, exportReportToCsv, exportReportToExcel } from '../../services/reportsExporter';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Award
} from 'lucide-react';

export default function ArrearsTrackerView() {
  const [arrears, setArrears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [exportError, setExportError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'register_number', direction: 'asc' });

  useEffect(() => {
    loadArrears();
  }, [filterType]);

  const loadArrears = async () => {
    setLoading(true);
    try {
      const data = await api.getArrears(filterType);
      setArrears(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearArrear = async (id, studentName, subjectCode) => {
    try {
      await api.clearArrear(id);
      setActionMsg(`Arrear in ${subjectCode} for ${studentName} successfully marked as CLEARED!`);
      setTimeout(() => setActionMsg(''), 4000);
      loadArrears();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredList = arrears.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.register_number.toLowerCase().includes(q) ||
      item.student_name.toLowerCase().includes(q) ||
      item.subject_code.toLowerCase().includes(q) ||
      item.subject_name.toLowerCase().includes(q)
    );
  });
  const sortedList = [...filteredList].sort((first, second) => {
    const left = first[sortConfig.key] ?? '';
    const right = second[sortConfig.key] ?? '';
    const comparison = typeof left === 'number' && typeof right === 'number'
      ? left - right
      : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  const changeSort = (key) => setSortConfig((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }));

  const activeCount = arrears.filter((a) => a.status === 'Active').length;
  const currentCount = arrears.filter((a) => a.status === 'Active' && a.type === 'Current').length;
  const previousCount = arrears.filter((a) => a.status === 'Active' && a.type === 'Previous').length;
  const clearedCount = arrears.filter((a) => a.status === 'Cleared').length;

  const handleExportPdf = () => {
    const columns = [
      { header: 'Reg. Number', key: 'register_number' },
      { header: 'Student Name', key: 'student_name' },
      { header: 'Sub Code', key: 'subject_code' },
      { header: 'Course Name', key: 'subject_name' },
      { header: 'Sem Failed', key: 'semester_failed' },
      { header: 'Backlog Type', key: 'type' },
      { header: 'Attempts', key: 'attempts' },
      { header: 'Status', key: 'status' },
      { header: 'Exam Session', key: 'exam_session' },
    ];
    exportReportToPdf('Official University Arrears & Standing Backlog Register', 'Standing Arrears Audit & Remedial Tracking', columns, sortedList);
  };

  const handleExportCsv = () => {
    const columns = [
      { header: 'Register Number', key: 'register_number' },
      { header: 'Student Name', key: 'student_name' },
      { header: 'Subject Code', key: 'subject_code' },
      { header: 'Subject Name', key: 'subject_name' },
      { header: 'Semester Failed', key: 'semester_failed' },
      { header: 'Arrear Type', key: 'type' },
      { header: 'Attempts', key: 'attempts' },
      { header: 'Status', key: 'status' },
      { header: 'Session', key: 'exam_session' },
    ];
    exportReportToCsv('University_Standing_Arrear_Report', columns, sortedList);
  };

  const handleExportExcel = async () => {
    const columns = [
      { header: 'Register Number', key: 'register_number' },
      { header: 'Student Name', key: 'student_name' },
      { header: 'Subject Code', key: 'subject_code' },
      { header: 'Subject Name', key: 'subject_name' },
      { header: 'Semester Failed', key: 'semester_failed' },
      { header: 'Arrear Type', key: 'type' },
      { header: 'Attempts', key: 'attempts' },
      { header: 'Status', key: 'status' },
      { header: 'Session', key: 'exam_session' },
    ];
    setExportError('');
    try {
      await exportReportToExcel('University_Standing_Arrear_Report', columns, sortedList);
    } catch (err) {
      setExportError(err.message || 'Excel export failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Backlog Management
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Supplementary Clearance Tracking
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Institutional Arrear & Standing Backlog Tracker
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Real-time audit tracking previous arrears, current semester backlogs, and cleared supplementary
              exam attempts to safeguard graduation eligibility and NAAC compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-300" />
              Export PDF
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Backlogs</p>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-black text-rose-600 mt-2">{activeCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Requires remedial re-evaluation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Sem Arrears</p>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-2">{currentCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Failed in active semester session</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Previous Sem Arrears</p>
            <span className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <RotateCcw className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-black text-orange-600 mt-2">{previousCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Carried forward across semesters</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cleared Arrears</p>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">{clearedCount}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Successfully passed supplementary</p>
        </div>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {actionMsg}
          </div>
          <button onClick={() => setActionMsg('')} className="text-emerald-700 hover:text-emerald-950">
            Dismiss
          </button>
        </div>
      )}
      {exportError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {exportError}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter View:
            </span>
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['All', 'Active', 'Current', 'Previous', 'Cleared'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    filterType === type
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'Current'
                    ? 'Current Sem'
                    : type === 'Previous'
                    ? 'Previous Sem'
                    : type === 'Active'
                    ? 'Active Backlogs'
                    : type}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student, reg no, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Arrears Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                {[
                  ['Candidate Reg #', 'register_number'],
                  ['Student Name', 'student_name'],
                  ['Course Code', 'subject_code'],
                  ['Course Title', 'subject_name'],
                  ['Failed Sem', 'semester_failed'],
                  ['Backlog Type', 'type'],
                  ['Attempts', 'attempts'],
                  ['Current Status', 'status'],
                ].map(([label, key]) => (
                  <th key={key} className="py-2.5 px-3">
                    <button onClick={() => changeSort(key)} className="hover:text-slate-800">
                      {label} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </button>
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right">Clearance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{item.register_number}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{item.student_name}</td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-700">{item.subject_code}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{item.subject_name}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-700">Sem {item.semester_failed}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.type === 'Current'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-orange-100 text-orange-800 border border-orange-200'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-700">{item.attempts}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Cleared'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {item.status === 'Active' ? (
                      item.source === 'University result' ? (
                        <span className="text-[10px] font-semibold text-slate-500">
                          Import a passing exam result to clear
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClearArrear(item.id, item.student_name, item.subject_code)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Mark Cleared
                        </button>
                      )
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cleared (Sem {item.semester_cleared || item.semester_failed})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredList.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No backlogs found matching current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
