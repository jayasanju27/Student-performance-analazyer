import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Save,
  Search,
  Filter,
  Users
} from 'lucide-react';

export default function FacultyPortalView() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Selected student editing
  const [activeTab, setActiveTab] = useState('marks'); // 'marks' or 'attendance'

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      loadSubjectData(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const subs = await api.getSubjects();
      setSubjects(subs);
      if (subs.length > 0) {
        setSelectedSubjectId(subs[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectData = async (subId) => {
    setLoading(true);
    try {
      const [marksRes, studsRes] = await Promise.all([
        api.getStudentMarks(1), // test
        api.getStudents(),
      ]);

      const subObj = subjects.find((s) => s.id === subId);
      const sem = subObj?.semester || 3;

      // Filter students of this department & semester
      const relevantStudents = studsRes.filter(
        (s) => (!subObj?.department_id || s.department_id === subObj.department_id) && s.semester >= sem
      );
      setStudents(relevantStudents);

      // Fetch marks and attendance for this subject
      const subjectMarks = await api.getStudents(); // lookup
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMark = async (studentId, internal, external) => {
    const subObj = subjects.find((s) => s.id === selectedSubjectId);
    if (!subObj) return;

    try {
      await api.recordMarks({
        student_id: studentId,
        subject_id: subObj.id,
        semester: subObj.semester,
        internal_marks: parseFloat(internal) || 0,
        external_marks: parseFloat(external) || 0,
      });
      setSaveSuccessMsg('Marks updated successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
      loadSubjectData(selectedSubjectId);
    } catch (err) {
      alert('Error updating marks: ' + err.message);
    }
  };

  const handleUpdateAttendance = async (studentId, held, attended) => {
    const subObj = subjects.find((s) => s.id === selectedSubjectId);
    if (!subObj) return;

    try {
      await api.recordAttendance({
        student_id: studentId,
        subject_id: subObj.id,
        semester: subObj.semester,
        classes_held: parseInt(held, 10) || 45,
        classes_attended: parseInt(attended, 10) || 0,
      });
      setSaveSuccessMsg('Attendance updated successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
      loadSubjectData(selectedSubjectId);
    } catch (err) {
      alert('Error updating attendance: ' + err.message);
    }
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Title & Subject Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              Faculty Grading & Continuous Evaluation
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Marks & Attendance Entry Portal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record continuous internal assessment (CIA) marks, semester external exams, and lecture attendance.
          </p>
        </div>

        {/* Subject dropdown */}
        <div className="w-full md:w-80">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Assigned Course:
          </label>
          <select
            value={selectedSubjectId || ''}
            onChange={(e) => setSelectedSubjectId(parseInt(e.target.value, 10))}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name} (Sem {s.semester}, {s.credits} Credits)
              </option>
            ))}
          </select>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {saveSuccessMsg}
        </div>
      )}

      {/* Course Stats Card */}
      {currentSubject && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {currentSubject.code}
            </span>
            <h3 className="text-base font-bold mt-1 text-white">{currentSubject.name}</h3>
            <p className="text-xs text-slate-400">
              Department: {currentSubject.department_name} • Semester {currentSubject.semester} • Credits: {currentSubject.credits}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Max Internal</p>
              <p className="text-lg font-bold text-amber-400">{currentSubject.max_internal} Marks</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Max External</p>
              <p className="text-lg font-bold text-blue-400">{currentSubject.max_external} Marks</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Passing Total</p>
              <p className="text-lg font-bold text-emerald-400">40 / 100</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Marks Entry vs Attendance */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('marks')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'marks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Continuous Internal & External Grading
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'attendance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Subject Attendance Tracker
        </button>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Enrolled Students ({students.length})
          </h4>
          <span className="text-xs text-slate-500">Changes update GPA calculations automatically</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Register Number</th>
                {activeTab === 'marks' ? (
                  <>
                    <th className="py-3 px-4">Internal Marks (Max {currentSubject?.max_internal || 30})</th>
                    <th className="py-3 px-4">External Marks (Max {currentSubject?.max_external || 70})</th>
                    <th className="py-3 px-4">Total Score</th>
                    <th className="py-3 px-4">Grade & Result</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4">Classes Held</th>
                    <th className="py-3 px-4">Classes Attended</th>
                    <th className="py-3 px-4">Attendance %</th>
                    <th className="py-3 px-4">Eligibility Status</th>
                  </>
                )}
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => (
                <StudentRow
                  key={st.id}
                  student={st}
                  activeTab={activeTab}
                  currentSubject={currentSubject}
                  onSaveMark={handleUpdateMark}
                  onSaveAttendance={handleUpdateAttendance}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentRow({ student, activeTab, currentSubject, onSaveMark, onSaveAttendance }) {
  const [internal, setInternal] = useState('25');
  const [external, setExternal] = useState('55');
  const [held, setHeld] = useState('45');
  const [attended, setAttended] = useState('40');
  const [saving, setSaving] = useState(false);

  const total = (parseFloat(internal) || 0) + (parseFloat(external) || 0);
  const isPass = total >= 40 && parseFloat(external) >= (currentSubject?.max_external * 0.4 || 28);
  const attPct = Math.round(((parseInt(attended, 10) || 0) / (parseInt(held, 10) || 45)) * 100);

  const handleSave = async () => {
    setSaving(true);
    if (activeTab === 'marks') {
      await onSaveMark(student.id, internal, external);
    } else {
      await onSaveAttendance(student.id, held, attended);
    }
    setSaving(false);
  };

  return (
    <tr className="hover:bg-slate-50/60 transition-colors">
      <td className="py-3 px-4">
        <p className="font-bold text-slate-900">{student.full_name}</p>
        <p className="text-[11px] text-slate-400">{student.department_code} • Sem {student.semester}</p>
      </td>
      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
        {student.register_number}
      </td>

      {activeTab === 'marks' ? (
        <>
          <td className="py-3 px-4">
            <input
              type="number"
              min="0"
              max={currentSubject?.max_internal || 30}
              value={internal}
              onChange={(e) => setInternal(e.target.value)}
              className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-bold"
            />
          </td>
          <td className="py-3 px-4">
            <input
              type="number"
              min="0"
              max={currentSubject?.max_external || 70}
              value={external}
              onChange={(e) => setExternal(e.target.value)}
              className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600/20 text-slate-800 font-bold"
            />
          </td>
          <td className="py-3 px-4 font-bold text-slate-900">
            {total} / 100
          </td>
          <td className="py-3 px-4">
            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {isPass ? 'PASS' : 'FAIL'}
            </span>
          </td>
        </>
      ) : (
        <>
          <td className="py-3 px-4">
            <input
              type="number"
              min="1"
              value={held}
              onChange={(e) => setHeld(e.target.value)}
              className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </td>
          <td className="py-3 px-4">
            <input
              type="number"
              min="0"
              max={held}
              value={attended}
              onChange={(e) => setAttended(e.target.value)}
              className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </td>
          <td className="py-3 px-4 font-bold text-slate-900">
            {attPct}%
          </td>
          <td className="py-3 px-4">
            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              attPct >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {attPct >= 75 ? 'Eligible' : 'Detention Alert'}
            </span>
          </td>
        </>
      )}

      <td className="py-3 px-4 text-right">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 ml-auto"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </td>
    </tr>
  );
}
