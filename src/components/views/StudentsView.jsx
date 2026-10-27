import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import { DataTable } from '../common/PortalPrimitives';
import { useAuth } from '../../context/AuthContext';
import { exportReportToCsv, exportReportToExcel } from '../../services/reportsExporter';
import {
  Users,
  Search,
  Download,
  FileSpreadsheet,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  FileText,
  AlertTriangle,
  GraduationCap,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  BookOpen
} from 'lucide-react';

export default function StudentsView({ onSelectStudentForMarksheet, globalSearch }) {
  const { role } = useAuth();
  const accountFileInput = useRef(null);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(globalSearch || '');
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'register_number', direction: 'asc' });
  const [exportError, setExportError] = useState('');
  const [accountUploadStatus, setAccountUploadStatus] = useState('');
  const [accountUploadError, setAccountUploadError] = useState('');
  const [accountUploadBusy, setAccountUploadBusy] = useState(false);

  // Modals & Drawers
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    register_number: '',
    full_name: '',
    department_id: '',
    year: 1,
    semester: 1,
    section: 'A',
    email: '',
    phone: '',
    admission_year: 2026,
  });

  useEffect(() => {
    if (globalSearch !== undefined) setSearch(globalSearch);
  }, [globalSearch]);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, deptFilter, semFilter, riskFilter, statusFilter]);

  const loadDepartments = async () => {
    try {
      const depts = await api.getDepartments();
      setDepartments(depts);
      if (depts.length > 0 && !formData.department_id) {
        setFormData((prev) => ({ ...prev, department_id: depts[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents({
        search,
        department_id: deptFilter || undefined,
        semester: semFilter || undefined,
        risk_level: riskFilter,
        status: statusFilter,
      });
      setStudents(res);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (studentId) => {
    setDetailLoading(true);
    setSelectedStudentDetail(null);
    try {
      const detail = await api.getStudentById(studentId);
      setSelectedStudentDetail(detail);
    } catch (err) {
      alert('Could not fetch student details: ' + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      register_number: `REG2026${departments[0]?.code || 'CSE'}0${Math.floor(10 + Math.random() * 89)}`,
      full_name: '',
      department_id: departments[0]?.id || 1,
      year: 1,
      semester: 1,
      section: 'A',
      email: '',
      phone: '+91-98' + Math.floor(10000000 + Math.random() * 90000000),
      admission_year: 2026,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      await api.createStudent({
        ...formData,
        department_id: parseInt(formData.department_id, 10),
        year: parseInt(formData.year, 10),
        semester: parseInt(formData.semester, 10),
      });
      setIsAddModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert('Error creating student: ' + err.message);
    }
  };

  const handleAccountUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!window.confirm("Create student records for new register numbers and reset passwords for existing accounts in this CSV? Default password will be each student's register number.")) return;
    setAccountUploadBusy(true);
    setAccountUploadError('');
    setAccountUploadStatus('');
    try {
      const result = await api.bulkCreateStudentAccounts(file);
      setAccountUploadStatus(result.message);
      await fetchStudents();
    } catch (err) {
      setAccountUploadError(err.message || 'Unable to process the student CSV.');
    } finally {
      setAccountUploadBusy(false);
    }
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      register_number: student.register_number,
      full_name: student.full_name,
      department_id: student.department_id,
      year: student.year,
      semester: student.semester,
      section: student.section,
      email: student.email,
      phone: student.phone || '',
      admission_year: student.admission_year || 2023,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.updateStudent(editingStudent.id, {
        full_name: formData.full_name,
        department_id: parseInt(formData.department_id, 10),
        year: parseInt(formData.year, 10),
        semester: parseInt(formData.semester, 10),
        section: formData.section,
        email: formData.email,
        phone: formData.phone,
      });
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert('Error updating student: ' + err.message);
    }
  };

  const handleDelete = async (studentId, regNo) => {
    if (!window.confirm(`Are you sure you want to permanently delete student ${regNo}?`)) return;
    try {
      await api.deleteStudent(studentId);
      fetchStudents();
    } catch (err) {
      alert('Error deleting student: ' + err.message);
    }
  };

  const sortedStudents = [...students].sort((first, second) => {
    const left = first[sortConfig.key] ?? '';
    const right = second[sortConfig.key] ?? '';
    const comparison = typeof left === 'number' && typeof right === 'number'
      ? left - right
      : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
  const studentExportColumns = [
    { header: 'Register Number', key: 'register_number' },
    { header: 'Student Name', key: 'full_name' },
    { header: 'Department', key: 'department_code' },
    { header: 'Year', key: 'year' },
    { header: 'Semester', key: 'semester' },
    { header: 'Section', key: 'section' },
    { header: 'CGPA', key: 'cgpa' },
    { header: 'SGPA', key: 'latest_sgpa' },
    { header: 'Attendance %', key: 'attendance_pct' },
    { header: 'Risk Level', key: 'risk_level' },
    { header: 'Result Status', key: 'result_status' },
  ];
  const changeSort = (key) => setSortConfig((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }));
  const handleExportCsv = () => {
    exportReportToCsv('AcademIQ_Student_Directory', studentExportColumns, sortedStudents);
  };
  const handleExportExcel = async () => {
    setExportError('');
    try {
      await exportReportToExcel('AcademIQ_Student_Directory', studentExportColumns, sortedStudents);
    } catch (err) {
      setExportError(err.message || 'Excel export failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            University Student Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic profiles, course registrations, results, and GPA records ({students.length} found)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleExportCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </button>
          {role === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Register New Student
            </button>
          )}
          {(role === 'admin' || role === 'faculty') && (
            <>
              <input
                ref={accountFileInput}
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleAccountUpload}
                type="file"
              />
              <button
                type="button"
                disabled={accountUploadBusy}
                onClick={() => accountFileInput.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {accountUploadBusy ? 'Processing CSV…' : 'Bulk create/reset accounts'}
              </button>
            </>
          )}
        </div>
      </div>
      {(role === 'admin' || role === 'faculty') && (
        <p className="text-xs text-slate-500">
          CSV columns: register_number, full_name, department_code (or department_id), year, semester, section, email, phone, admission_year. New and reset account passwords are the register number.
        </p>
      )}
      {accountUploadStatus && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{accountUploadStatus}</p>
      )}
      {accountUploadError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{accountUploadError}</p>
      )}
      {exportError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{exportError}</div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or Reg No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800"
          />
        </div>

        {/* Dept Filter */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none text-slate-700 font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Filter */}
        <div>
          <select
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none text-slate-700 font-medium"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Level Filter */}
        <div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none text-slate-700 font-medium"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">🟢 Low Risk</option>
            <option value="Medium">🟡 Medium Risk</option>
            <option value="High">🔴 High Risk</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none text-slate-700 font-medium"
          >
            <option value="All">All Pass / Fail</option>
            <option value="PASS">Pass Class</option>
            <option value="FAIL">Backlog / Reappear</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Filtering students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No students match your filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting search filters or load demo data.</p>
          </div>
        ) : (
          <DataTable>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {[
                    ['Student', 'full_name'],
                    ['Reg Number', 'register_number'],
                    ['Department & Class', 'department_code'],
                    ['CGPA / SGPA', 'cgpa'],
                    ['Attendance', 'attendance_pct'],
                    ['Risk Level', 'risk_level'],
                    ['Status', 'result_status'],
                  ].map(([label, key]) => (
                    <th key={key} className="py-3 px-4">
                      <button type="button" onClick={() => changeSort(key)} className="hover:text-slate-900">
                        {label} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </button>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Avatar & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.full_name}`}
                          alt={s.full_name}
                          className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{s.full_name}</p>
                          <p className="text-[11px] text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Reg No */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {s.register_number}
                    </td>

                    {/* Department & Class */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{s.department_code}</span>
                      <p className="text-[11px] text-slate-500">
                        Year {s.year} • Sem {s.semester} (Sec {s.section})
                      </p>
                    </td>

                    {/* CGPA */}
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {s.cgpa} CGPA
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Sem SGPA: {s.latest_sgpa}</p>
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${s.attendance_pct < 75 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {s.attendance_pct}%
                        </span>
                        {s.attendance_pct < 75 && (
                          <span className="text-[9px] font-bold px-1 rounded bg-rose-100 text-rose-700">
                            Shortage
                          </span>
                        )}
                      </div>
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            s.attendance_pct < 65 ? 'bg-rose-500' : s.attendance_pct < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, s.attendance_pct)}%` }}
                        />
                      </div>
                    </td>

                    {/* Risk Level */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        s.risk_level === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : s.risk_level === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          s.risk_level === 'High' ? 'bg-rose-600' : s.risk_level === 'Medium' ? 'bg-amber-600' : 'bg-emerald-600'
                        }`} />
                        {s.risk_level} Risk
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                        s.result_status === 'PASS' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {s.result_status === 'PASS' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {s.result_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(s.id)}
                          title="View Full Academic Profile"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectStudentForMarksheet && onSelectStudentForMarksheet(s.id, s.semester)}
                          title="Generate University Marksheet"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(s)}
                              title="Edit Student Info"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id, s.register_number)}
                              title="Delete Record"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        )}
      </div>

      {/* Student Profile Drawer / Modal */}
      <Modal
        isOpen={!!selectedStudentDetail || detailLoading}
        onClose={() => setSelectedStudentDetail(null)}
        title="Student Academic Profile & Performance Records"
        maxWidth="max-w-4xl"
      >
        {detailLoading || !selectedStudentDetail ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading student profile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={selectedStudentDetail.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudentDetail.full_name}`}
                alt={selectedStudentDetail.full_name}
                className="w-16 h-16 rounded-full bg-white border border-slate-200 shadow-xs"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedStudentDetail.full_name}</h3>
                    <p className="text-xs font-mono text-slate-500">{selectedStudentDetail.register_number}</p>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-end">
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                      {selectedStudentDetail.cgpa} CGPA
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      selectedStudentDetail.risk_level === 'High' ? 'bg-rose-100 text-rose-800' :
                      selectedStudentDetail.risk_level === 'Medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedStudentDetail.risk_level} Risk
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                  <div>
                    <p className="text-slate-400 text-[11px]">Department</p>
                    <p className="font-semibold text-slate-800">{selectedStudentDetail.department_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px]">Current Semester</p>
                    <p className="font-semibold text-slate-800">Sem {selectedStudentDetail.semester} (Sec {selectedStudentDetail.section})</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px]">Attendance</p>
                    <p className="font-semibold text-slate-800">{selectedStudentDetail.attendance_pct}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px]">Email</p>
                    <p className="font-semibold text-slate-800 truncate">{selectedStudentDetail.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Risk Factors & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Risk Indicators & Contributing Factors
                </h4>
                <ul className="space-y-1.5 text-xs text-rose-800">
                  {selectedStudentDetail.contributing_factors?.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Personalized Academic Recommendations
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-800">
                  {selectedStudentDetail.recommendations?.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-900">Current Semester Subjects & Marks</h4>
                <button
                  onClick={() => {
                    setSelectedStudentDetail(null);
                    onSelectStudentForMarksheet && onSelectStudentForMarksheet(selectedStudentDetail.id, selectedStudentDetail.semester);
                  }}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> View Official Marksheet PDF
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Credits</th>
                      <th className="py-2.5 px-3">Internal</th>
                      <th className="py-2.5 px-3">External</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Grade</th>
                      <th className="py-2.5 px-3">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedStudentDetail.marks
                      ?.filter((m) => m.semester === selectedStudentDetail.semester)
                      .map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono font-semibold text-slate-700">{m.subject_code}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{m.subject_name}</td>
                          <td className="py-2 px-3">{m.credits}</td>
                          <td className="py-2 px-3">{m.internal_marks}</td>
                          <td className="py-2 px-3">{m.external_marks}</td>
                          <td className="py-2 px-3 font-bold">{m.total_marks}</td>
                          <td className="py-2 px-3">
                            <span className="font-extrabold text-blue-700">{m.grade}</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`font-bold ${m.is_passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {m.is_passed ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Student">
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Register Number *</label>
              <input
                type="text"
                required
                value={formData.register_number}
                onChange={(e) => setFormData({ ...formData, register_number: e.target.value.toUpperCase() })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department *</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10), year: Math.ceil(parseInt(e.target.value, 10) / 2) })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="student@college.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
            >
              Register Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Student Profile">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10), year: Math.ceil(parseInt(e.target.value, 10) / 2) })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
            >
              Update Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
