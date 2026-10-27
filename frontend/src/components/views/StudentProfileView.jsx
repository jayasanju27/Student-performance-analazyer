import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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
  Calendar
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
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Default to user.student_id or 1
      const studentId = user?.student_id || 1;
      const data = await api.getStudentById(studentId);
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading student profile...</p>
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

  return (
    <div className="space-y-6">
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" stroke="#64748b" fontSize={11} fontWeight={600} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val, name, item) => [`${val}/100`, `${item.payload.name}`]}
                />
                <Bar dataKey="total" name="Total Marks" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.total >= 80 ? '#10b981' : entry.total >= 50 ? '#3b82f6' : '#ef4444'}
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
