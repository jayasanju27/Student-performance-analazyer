import React, { useState } from 'react';
import { api } from '../../services/api';
import { exportReportToCsv, exportReportToExcel } from '../../services/reportsExporter';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Save,
  RefreshCw,
  FileText,
  Edit2,
  Search,
  ArrowDownUp
} from 'lucide-react';

export default function UploadView() {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewSort, setPreviewSort] = useState({ key: 'row_number', direction: 'asc' });
  const [exportError, setExportError] = useState('');

  const handleDownloadTemplate = async () => {
    try {
      await api.downloadTemplate();
    } catch (e) {
      alert('Error downloading template: ' + e.message);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async (selectedFile) => {
    setFile(selectedFile);
    setCommitResult(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await api.previewUpload(formData);
      setPreviewData(res);
    } catch (err) {
      alert('Failed to parse file: ' + err.message);
      setFile(null);
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRowChange = (index, field, value) => {
    if (!previewData) return;
    const updatedRecords = [...previewData.records];
    const rec = { ...updatedRecords[index], [field]: value };

    // Re-check validity of the row
    let errs = [];
    const intMark = parseFloat(rec.internal_marks);
    const extMark = parseFloat(rec.external_marks);
    if (isNaN(intMark) || intMark < 0 || intMark > 30) errs.push('Internal marks out of range [0-30]');
    if (isNaN(extMark) || extMark < 0 || extMark > 70) errs.push('External marks out of range [0-70]');
    if (!rec.register_number) errs.push('Missing register number');
    if (!rec.subject_code) errs.push('Missing subject code');

    rec.is_valid = errs.length === 0;
    rec.error_message = errs.length > 0 ? errs.join('; ') : null;

    updatedRecords[index] = rec;

    const validCnt = updatedRecords.filter((r) => r.is_valid).length;
    const invalidCnt = updatedRecords.length - validCnt;

    setPreviewData({
      ...previewData,
      valid_records_count: validCnt,
      invalid_records_count: invalidCnt,
      records: updatedRecords,
    });
  };

  const handleCommit = async () => {
    if (!previewData || previewData.records.length === 0) return;
    setCommitting(true);
    try {
      const res = await api.commitUpload(previewData.records);
      setCommitResult(res);
    } catch (err) {
      alert('Commit failed: ' + err.message);
    } finally {
      setCommitting(false);
    }
  };

  const visibleUploadRows = (previewData?.records || [])
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => Object.values(record).some((value) =>
      String(value ?? '').toLowerCase().includes(previewSearch.toLowerCase())
    ))
    .sort(({ record: first }, { record: second }) => {
      const left = first[previewSort.key] ?? '';
      const right = second[previewSort.key] ?? '';
      const comparison = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
      return previewSort.direction === 'asc' ? comparison : -comparison;
    });
  const uploadExportColumns = [
    { header: 'Row', key: 'row_number' },
    { header: 'Register Number', key: 'register_number' },
    { header: 'Student Name', key: 'student_name' },
    { header: 'Subject Code', key: 'subject_code' },
    { header: 'Semester', key: 'semester' },
    { header: 'Internal Marks', key: 'internal_marks' },
    { header: 'External Marks', key: 'external_marks' },
    { header: 'Attendance %', key: 'attendance' },
    { header: 'Validation Status', key: 'error_message' },
  ];
  const changePreviewSort = (key) => setPreviewSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }));
  const handleExportCsv = () => {
    exportReportToCsv('Student_Marks_Import_Preview', uploadExportColumns, visibleUploadRows.map(({ record }) => ({
      ...record,
      error_message: record.is_valid ? 'Ready' : record.error_message,
    })));
  };
  const handleExportExcel = async () => {
    setExportError('');
    try {
      await exportReportToExcel(
        'Student_Marks_Import_Preview',
        uploadExportColumns,
        visibleUploadRows.map(({ record }) => ({
          ...record,
          error_message: record.is_valid ? 'Ready' : record.error_message,
        }))
      );
    } catch (err) {
      setExportError(err.message || 'Excel export failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              Batch Data Ingestion Hub
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Upload Student Marks & Attendance (CSV / Excel)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Bulk import marks with real-time schema validation and in-line correction before committing to the database.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Download Sample CSV Template
        </button>
      </div>

      {commitResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Batch Import Successful!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">{commitResult.message}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setPreviewData(null);
              setFile(null);
              setCommitResult(null);
            }}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
          >
            Upload Another File
          </button>
        </div>
      )}

      {/* Drag and Drop Zone */}
      {!previewData && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
            dragOver ? 'border-blue-600 bg-blue-50/50 scale-[1.01]' : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Drag and drop your spreadsheet here, or browse
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Supports comma-separated files (.csv) and Microsoft Excel spreadsheets (.xlsx, .xls)
          </p>

          <label className="mt-5 inline-block">
            <span className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all">
              Choose Spreadsheet File
            </span>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Preview & Correction Inspector */}
      {previewData && (
        <div className="space-y-4">
          {/* Status Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500 font-medium">
                File: <strong className="text-slate-800">{file?.name}</strong> ({previewData.total_records} rows)
              </span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ✓ {previewData.valid_records_count} Valid
              </span>
              {previewData.invalid_records_count > 0 && (
                <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  ⚠ {previewData.invalid_records_count} Needs Correction
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPreviewData(null);
                  setFile(null);
                }}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCommit}
                disabled={committing || previewData.valid_records_count === 0}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {committing ? 'Importing...' : `Commit ${previewData.valid_records_count} Records`}
              </button>
            </div>
          </div>

          {/* Validation Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Preview & In-Line Edit Grid</p>
                <p className="text-[11px] text-slate-400">Edit marks to fix validation errors; search and sort the preview rows.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input value={previewSearch} onChange={(event) => setPreviewSearch(event.target.value)} placeholder="Search preview" aria-label="Search upload preview" className="w-44 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-xs" />
                </label>
                <button type="button" onClick={handleExportCsv} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                  <Download className="h-3.5 w-3.5" /> CSV
                </button>
                <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
                </button>
              </div>
            </div>
            {exportError && <div role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-800">{exportError}</div>}

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/90 text-slate-600 font-bold text-[11px] uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    {[
                      ['Row', 'row_number'],
                      ['Reg Number', 'register_number'],
                      ['Student Name', 'student_name'],
                      ['Subject Code', 'subject_code'],
                      ['Sem', 'semester'],
                      ['Internal (30)', 'internal_marks'],
                      ['External (70)', 'external_marks'],
                      ['Attendance %', 'attendance'],
                      ['Validation Status', 'error_message'],
                    ].map(([label, key]) => (
                      <th key={key} className="py-2.5 px-3">
                        <button type="button" onClick={() => changePreviewSort(key)} className="inline-flex items-center gap-1 hover:text-slate-900">
                          {label}<ArrowDownUp className="h-3 w-3" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleUploadRows.map(({ record: r, index: idx }) => (
                    <tr
                      key={idx}
                      className={r.is_valid ? 'hover:bg-slate-50/50' : 'bg-rose-50/40 hover:bg-rose-50/60'}
                    >
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">#{r.row_number}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{r.register_number}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{r.student_name}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{r.subject_code}</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.semester}</td>

                      {/* Editable Marks */}
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={r.internal_marks}
                          onChange={(e) => handleRowChange(idx, 'internal_marks', e.target.value)}
                          className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={r.external_marks}
                          onChange={(e) => handleRowChange(idx, 'external_marks', e.target.value)}
                          className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={r.attendance}
                          onChange={(e) => handleRowChange(idx, 'attendance', e.target.value)}
                          className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-bold"
                        />
                      </td>

                      {/* Status / Error message */}
                      <td className="py-2.5 px-3">
                        {r.is_valid ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            {r.error_message}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {visibleUploadRows.length === 0 && (
                    <tr><td colSpan="9" className="py-8 text-center text-sm text-slate-500">No import rows match the search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
