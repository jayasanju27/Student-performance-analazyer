import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import StatCard from '../common/StatCard';
import {
  Users,
  Award,
  BookOpen,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

export default function DashboardView({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardAnalytics();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading university academic analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 shadow-xs">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Unable to load dashboard</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const GRADE_COLORS = {
    O: '#10b981',
    'A+': '#059669',
    A: '#2563eb',
    'B+': '#3b82f6',
    B: '#eab308',
    C: '#f97316',
    F: '#ef4444',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div 
        className="rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden bg-cover bg-center border border-slate-700/50"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(10, 25, 47, 0.94) 0%, rgba(15, 35, 68, 0.90) 50%, rgba(10, 25, 47, 0.96) 100%), url('/campus-banner.jpg')`
        }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-emerald-500/10 via-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-blue-950 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Info Institute of Engineering
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/25 text-blue-200 border border-blue-400/30">
                Autonomous • Anna Univ
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                TNEA: 2732
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Academic Performance & Result Intelligence
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Institutional intelligence dashboard tracking real-time student CGPA progression,
              internal exam assessments, attendance compliance, and machine-learning academic risk detection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate && onNavigate('results')}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 shadow-sm transition-all"
            >
              Generate Results
            </button>
            <button
              onClick={() => onNavigate && onNavigate('risk')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Risk Radar ({data.students_at_risk})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={data.total_students}
          subtext="Enrolled undergraduates"
          icon={Users}
          color="blue"
          trend="+4.2%"
        />
        <StatCard
          title="Average CGPA"
          value={`${data.average_cgpa} / 10`}
          subtext="University cumulative"
          icon={Award}
          color="indigo"
          trend="+0.18"
        />
        <StatCard
          title="Average Score"
          value={`${data.average_percentage}%`}
          subtext="Course overall avg"
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Pass Percentage"
          value={`${data.pass_percentage}%`}
          subtext="Cleared all courses"
          icon={CheckCircle2}
          color="emerald"
          trend="+2.5%"
        />
        <StatCard
          title="Avg Attendance"
          value={`${data.average_attendance}%`}
          subtext="Threshold cutoff: 75%"
          icon={CalendarCheck}
          color="amber"
        />
        <StatCard
          title="Students At Risk"
          value={data.students_at_risk}
          subtext={`${data.risk_breakdown?.High || 0} Critical • ${data.risk_breakdown?.Medium || 0} Warning`}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Row 2: Performance Trend & Subject Averages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Semester SGPA & Pass Progression</h3>
              <p className="text-xs text-slate-500">Semester-by-semester university performance trend</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              Historical Cohort
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.performance_trends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="semester" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="left" domain={[0, 10]} stroke="#3b82f6" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#10b981" fontSize={12} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avg_sgpa"
                  name="Average SGPA"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="pass_rate"
                  name="Pass Rate (%)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject-Wise Average (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Subject-wise Average Marks</h3>
              <p className="text-xs text-slate-500">Benchmark across core curriculum courses</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
              Score / 100
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.subject_averages} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="code" type="category" stroke="#64748b" fontSize={11} width={50} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val, name, item) => [`${val}/100`, `${item.payload.name}`]}
                />
                <Bar dataKey="average_mark" name="Subject Average" fill="#6366f1" radius={[0, 6, 6, 0]}>
                  {data.subject_averages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.average_mark < 60 ? '#f59e0b' : '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Grade Distribution, Attendance Bands & Department Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Grade Category Distribution</h3>
          <p className="text-xs text-slate-500 mb-3">O, A+, A, B+, B, C, F breakdown</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.grade_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="grade" stroke="#64748b" fontSize={12} fontWeight={600} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]}>
                  {data.grade_distribution.map((entry, index) => (
                    <Cell key={`grade-${index}`} fill={GRADE_COLORS[entry.grade] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Attendance Distribution Bands</h3>
          <p className="text-xs text-slate-500 mb-3">University 75% condonation compliance</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.attendance_distribution} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="band" type="category" stroke="#64748b" fontSize={9.5} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" name="Course Enrollments" fill="#0ea5e9" radius={[0, 6, 6, 0]}>
                  {data.attendance_distribution.map((entry, index) => (
                    <Cell
                      key={`att-${index}`}
                      fill={entry.band.includes('< 65%') ? '#ef4444' : entry.band.includes('65%') ? '#f59e0b' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Analytics */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Department Performance</h3>
          <p className="text-xs text-slate-500 mb-3">CSE, ECE, and Mechanical comparisons</p>
          <div className="space-y-3 pt-1">
            {data.department_analytics?.map((dept) => (
              <div key={dept.code} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {dept.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{dept.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {dept.students} students enrolled
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{dept.avg_cgpa} CGPA</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">{dept.pass_rate}% Pass</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Top Performers & Students Needing Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Top Performing Scholars</h3>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('students')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data.top_performers?.map((student, idx) => (
              <div key={student.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-amber-100 text-amber-800' :
                    idx === 1 ? 'bg-slate-200 text-slate-800' :
                    idx === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{student.name}</h4>
                    <p className="text-[11px] text-slate-400">{student.register_number} • {student.department} (Sem {student.semester})</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {student.cgpa} CGPA
                  </span>
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Sem SGPA: {student.sgpa}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students Requiring Academic Attention */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-slate-900">Academic Attention Required</h3>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('risk')}
              className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
            >
              Analyze Risk Radar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data.students_needing_attention?.map((student) => (
              <div key={student.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${student.risk_level === 'High' ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{student.name}</h4>
                    <p className="text-[11px] text-slate-400">{student.register_number} • {student.department} (Sem {student.semester})</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    student.risk_level === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {student.risk_level} Risk ({student.risk_score}%)
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    CGPA: {student.cgpa}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
