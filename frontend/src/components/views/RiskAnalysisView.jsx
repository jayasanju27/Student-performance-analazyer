import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Info
} from 'lucide-react';

export default function RiskAnalysisView({ onSelectStudentForMarksheet }) {
  const { role, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchRiskData();
  }, [filterLevel]);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      if (role === 'student' && user?.student_id) {
        const studentRisk = await api.getStudentRisk(user.student_id);
        setStudents([studentRisk]);
        setSelectedStudent(studentRisk);
      } else {
        const res = await api.getFlaggedStudents(filterLevel);
        setStudents(res);
        if (res.length > 0) setSelectedStudent(res[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.student_name?.toLowerCase().includes(term) ||
      s.register_number?.toLowerCase().includes(term) ||
      s.department_name?.toLowerCase().includes(term)
    );
  });

  const highCount = students.filter((s) => s.risk_level === 'High').length;
  const medCount = students.filter((s) => s.risk_level === 'Medium').length;
  const lowCount = students.filter((s) => s.risk_level === 'Low').length;

  return (
    <div className="space-y-6">
      {/* Header & Disclaimer Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rose-600" />
                Predictive ML Academic Radar
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Academic Risk Detection & Advisory Intelligence
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Automated multi-factor evaluation of attendance patterns, internal examination trends, backlogs, and academic progression.
            </p>
          </div>

          {/* Quick Counter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterLevel('High')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterLevel === 'High' ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              High Risk: {highCount}
            </button>
            <button
              onClick={() => setFilterLevel('Medium')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterLevel === 'Medium' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Medium Risk: {medCount}
            </button>
            <button
              onClick={() => setFilterLevel('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterLevel === 'All' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Students
            </button>
          </div>
        </div>

        {/* IMPORTANT Academic Advisory Disclaimer */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <span className="font-bold">Official University Advisory Notice:</span> This module provides early academic-support indicators
            and formative performance insights only. Predictions and risk estimates are advisory and should not be treated as official university exam results or disciplinary decisions.
          </div>
        </div>
      </div>

      {/* Main Split Layout: Student List & Detailed Diagnostic Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Flagged Students List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search at-risk students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Evaluating academic risk parameters...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No students currently flagged in this tier.</p>
              </div>
            ) : (
              filtered.map((s) => {
                const isSelected = selectedStudent?.student_id === s.student_id;
                const isHigh = s.risk_level === 'High';
                const isMed = s.risk_level === 'Medium';
                return (
                  <button
                    key={s.student_id}
                    onClick={() => setSelectedStudent(s)}
                    className={`w-full text-left p-4 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-blue-600'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isHigh ? 'bg-rose-500 animate-ping' : isMed ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <h4 className="text-xs font-bold text-slate-900">{s.student_name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{s.register_number} • {s.department_name}</p>
                      
                      <div className="flex items-center gap-2 mt-2 text-[10px]">
                        <span className="text-slate-500">Attendance: <strong className={s.attendance_percentage < 75 ? 'text-rose-600' : 'text-slate-700'}>{s.attendance_percentage}%</strong></span>
                        <span>•</span>
                        <span className="text-slate-500">Backlogs: <strong className={s.failed_subjects_count > 0 ? 'text-rose-600' : 'text-slate-700'}>{s.failed_subjects_count}</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isHigh ? 'bg-rose-100 text-rose-800' : isMed ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {s.risk_level} ({s.risk_score}%)
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 ml-auto mt-2" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Diagnostic & Recommendations Card (7 cols) */}
        <div className="lg:col-span-7">
          {selectedStudent ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
              {/* Student Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      selectedStudent.risk_level === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      selectedStudent.risk_level === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {selectedStudent.risk_level} Risk Category ({selectedStudent.risk_score}%)
                    </span>
                    <span className="text-xs text-slate-400">• Sem {selectedStudent.semester}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedStudent.student_name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedStudent.register_number} • {selectedStudent.department_name}</p>
                </div>

                <button
                  onClick={() => onSelectStudentForMarksheet && onSelectStudentForMarksheet(selectedStudent.student_id, selectedStudent.semester)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shrink-0"
                >
                  View Marksheet
                </button>
              </div>

              {/* Four Factor Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase">Overall Attendance</p>
                  <p className={`text-lg font-bold mt-0.5 ${selectedStudent.attendance_percentage < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {selectedStudent.attendance_percentage}%
                  </p>
                  <p className="text-[10px] text-slate-400">Min 75% required</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase">Current Avg Score</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">
                    {selectedStudent.current_average}%
                  </p>
                  <p className="text-[10px] text-slate-400">Total marks avg</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase">Failed Courses</p>
                  <p className={`text-lg font-bold mt-0.5 ${selectedStudent.failed_subjects_count > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedStudent.failed_subjects_count}
                  </p>
                  <p className="text-[10px] text-slate-400">{selectedStudent.failed_subjects_count > 0 ? 'Backlogs to clear' : 'Clean sheet'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase">Performance Trend</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                    {selectedStudent.trend === 'Improving' ? (
                      <span className="text-emerald-600 flex items-center gap-0.5"><TrendingUp className="w-4 h-4" /> Up</span>
                    ) : selectedStudent.trend === 'Declining' ? (
                      <span className="text-rose-600 flex items-center gap-0.5"><TrendingDown className="w-4 h-4" /> Down</span>
                    ) : (
                      <span className="text-slate-600">Stable</span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">Prev CGPA: {selectedStudent.previous_cgpa}</p>
                </div>
              </div>

              {/* Explainable Contributing Factors */}
              <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Key Factors Responsible for Academic Risk Rating
                </h4>
                <div className="space-y-1.5 text-xs text-rose-800 pt-1">
                  {selectedStudent.contributing_factors?.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized Academic Recommendations */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Personalized Academic Recommendations & Intervention Plan
                </h4>
                <div className="space-y-2 text-xs text-emerald-800 pt-1">
                  {selectedStudent.recommendations?.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-emerald-100/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Mitigation Next Steps */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Department Faculty Advisory Protocol:</p>
                <p>
                  1. Notify Course Instructors to offer remedial question sets.<br />
                  2. Student Proctor to verify attendance recovery progress within 14 instructional days.<br />
                  3. Encourage registration for peer tutoring circles in Engineering Mathematics and Algorithms.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400 text-xs">
              Select a student from the radar list to view their detailed diagnostic assessment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
