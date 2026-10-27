import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge, Card, KpiCard, PageHeader } from '../common/PortalPrimitives';
import {
  Users,
  Award,
  BookOpen,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  RotateCcw,
  FileText,
  UploadCloud,
  FileSpreadsheet,
  ArrowRight
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
  const [arrearRecords, setArrearRecords] = useState([]);
  const [arrearError, setArrearError] = useState('');
  const [arrearsLoading, setArrearsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
    api.getArrears('Active')
      .then((records) => setArrearRecords(records))
      .catch((err) => setArrearError(err.message || 'Unable to load arrears by subject.'))
      .finally(() => setArrearsLoading(false));
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
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
      <div aria-label="Loading dashboard" className="space-y-6">
        <div className="faculty-skeleton h-36" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="faculty-skeleton h-28" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="faculty-skeleton h-80" />
          <div className="faculty-skeleton h-80" />
        </div>
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
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const GRADE_COLORS = {
    O: '#13315c',
    'A+': '#13315c',
    A: '#0e9aa7',
    'B+': '#64748b',
    B: '#94a3b8',
    C: '#cbd5e1',
    F: '#b91c1c',
  };
  const passFailData = [
    { name: 'Pass', value: data.pass_percentage },
    { name: 'Fail', value: Math.max(0, 100 - data.pass_percentage) },
  ];
  const arrearSubjectCounts = arrearRecords
    .filter((record) => record.status === 'Active')
    .reduce((subjects, record) => {
      const subject = subjects.get(record.subject_code) || {
        code: record.subject_code,
        name: record.subject_name,
        count: 0,
      };
      subject.count += 1;
      subjects.set(record.subject_code, subject);
      return subjects;
    }, new Map());
  const arrearsBySubject = [...arrearSubjectCounts.values()].sort((first, second) => second.count - first.count);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic performance overview"
        actions={
          <>
            <button
              onClick={() => onNavigate && onNavigate('ia-assessment')}
              className="portal-button-secondary inline-flex items-center gap-2"
            >
              <Award className="h-[18px] w-[18px] text-[#13315C]" />
              IA-1 vs IA-2
            </button>
            <button
              onClick={() => onNavigate && onNavigate('arrears')}
              className="portal-button-secondary inline-flex items-center gap-2"
            >
              <RotateCcw className="h-[18px] w-[18px] text-slate-500" />
              Arrears ({data.arrear_stats?.total_active_arrears || 0})
            </button>
            <button
              onClick={() => onNavigate && onNavigate('reports')}
              className="portal-button-primary inline-flex items-center gap-2"
            >
              <FileSpreadsheet className="h-[18px] w-[18px] text-white" />
              Reports Center
            </button>
          </>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Total students"
          value={data.total_students}
          detail="Students in your cohort"
          icon={Users}
        />
        <KpiCard
          label="Class average"
          value={`${data.average_percentage}%`}
          detail="Across recorded subject marks"
          icon={TrendingUp}
        />
        <KpiCard
          label="Overall pass"
          value={`${data.pass_percentage}%`}
          detail="Latest recorded results"
          icon={CheckCircle2}
        />
        <KpiCard
          label="Students at risk"
          value={data.students_at_risk}
          detail={`${data.risk_breakdown?.High || 0} Critical • ${data.risk_breakdown?.Medium || 0} Warning`}
          icon={AlertTriangle}
        />
        <KpiCard
          label="Current arrears"
          value={data.arrear_stats?.total_active_arrears || 0}
          detail="Subjects to follow up"
          icon={RotateCcw}
        />
        <KpiCard
          label="Class topper"
          value={data.top_performers?.[0]?.name?.split(' ')[0] || '—'}
          detail={data.top_performers?.[0] ? `${data.top_performers[0].cgpa} CGPA · ${data.top_performers[0].register_number}` : 'No result records yet'}
          icon={Award}
        />
      </div>

      {/* Internal Assessment Cohort Performance Strip */}
      <Card className="bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Award className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">Internal Assessment (IA) Cohort Performance</h3>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('ia-assessment')}
            className="flex items-center gap-1 text-xs font-semibold text-[#1E3A5F] hover:underline"
          >
            View Full IA Analyzer <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500">IA-1 Average</p>
            <p className="text-xl font-black text-slate-900 mt-1">{data.ia1_average ? `${data.ia1_average} / 50` : '—'}</p>
            <p className="text-[10px] text-slate-400">Cohort assessment 1</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500">IA-2 Average</p>
            <p className="text-xl font-black text-slate-900 mt-1">{data.ia2_average ? `${data.ia2_average} / 50` : '—'}</p>
            <p className="text-[10px] text-slate-400">Cohort assessment 2</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500">Progression Delta</p>
            <p className={`text-xl font-black mt-1 flex items-center gap-1 ${(data.ia2_average - data.ia1_average) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {(data.ia2_average && data.ia1_average) ? (
                <>
                  {(data.ia2_average - data.ia1_average) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {(data.ia2_average - data.ia1_average) >= 0 ? `+${(data.ia2_average - data.ia1_average).toFixed(1)}` : (data.ia2_average - data.ia1_average).toFixed(1)}
                </>
              ) : '—'}
            </p>
            <p className="text-[10px] text-slate-400">IA-2 vs IA-1 delta</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500">Cohort Size</p>
            <p className="text-xl font-black text-blue-600 mt-1">{data.total_students}</p>
            <p className="text-[10px] text-slate-400">Total active students</p>
          </div>
        </div>
      </Card>

      {/* Arrears Audit Strip */}
      <Card className="bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <RotateCcw className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">University Arrear & Standing Backlog Intelligence</h3>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('arrears')}
            className="flex items-center gap-1 text-xs font-semibold text-[#1E3A5F] hover:underline"
          >
            Manage Backlogs & Supplementary Exams <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500">Active Arrears</p>
            <p className="text-xl font-black text-rose-600 mt-1">{data.arrear_stats?.total_active_arrears || 0}</p>
            <p className="text-[10px] text-slate-400">Total un-cleared</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500">Current Sem</p>
            <p className="text-xl font-black text-amber-600 mt-1">{data.arrear_stats?.current_arrears || 0}</p>
            <p className="text-[10px] text-slate-400">Odd sem backlogs</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500">Previous Sem</p>
            <p className="text-xl font-black text-orange-600 mt-1">{data.arrear_stats?.previous_arrears || 0}</p>
            <p className="text-[10px] text-slate-400">Carried forward</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500">Cleared Backlogs</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{data.arrear_stats?.cleared_arrears_count || 0}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">Supplementary cleared</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500">Clean Scholars</p>
            <p className="text-xl font-black text-indigo-600 mt-1">{data.arrear_stats?.clean_students || 0}</p>
            <p className="text-[10px] text-slate-400">0 Backlog record</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500">Students w/ Arrears</p>
            <p className="text-xl font-black text-slate-800 mt-1">{data.arrear_stats?.arrear_students || 0}</p>
            <p className="text-[10px] text-slate-400">Enrolled candidates</p>
          </div>
        </div>
      </Card>

      {/* Row: IA-1 vs IA-2 Comparison & Semester Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* IA-1 vs IA-2 Bar Chart (7 cols) */}
        <Card className="lg:col-span-7 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Internal Assessment: IA-1 vs IA-2 Progression</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Net Delta: {data.ia_overall?.diff > 0 ? `+${data.ia_overall.diff}` : data.ia_overall?.diff} pts
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Comparative student test performance across major curriculum subjects (Max: 50 Marks)
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('ia-assessment')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              View Sheet <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ia_subject_comparison || []} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" />
                <XAxis dataKey="code" stroke="#64748b" fontSize={13} />
                <YAxis domain={[0, 50]} stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val, name, item) => [`${val} / 50`, name === 'ia1' ? 'Internal Exam 1' : 'Internal Exam 2']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="ia1" name="IA-1 Average (50)" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ia2" name="IA-2 Average (50)" fill="#0e9aa7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* SGPA & Pass Progression Line Chart (5 cols) */}
        <Card className="lg:col-span-5 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">SGPA & Pass Progression</h3>
              <p className="text-xs text-slate-500">Historical semester progression trend</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              Cohorts 1-3
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.performance_trends} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" />
                <XAxis dataKey="semester" stroke="#64748b" fontSize={13} />
                <YAxis yAxisId="left" domain={[0, 10]} stroke="#64748b" fontSize={13} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#15803d" fontSize={13} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avg_sgpa"
                  name="Avg SGPA"
                  stroke="#13315c"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#13315c' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="pass_rate"
                  name="Pass Rate (%)"
                  stroke="#15803d"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#15803d' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row: Grade Distribution, Attendance Bands & Subject Pass Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Grade Distribution */}
        <Card className="bg-white p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Grade Category Distribution</h3>
          <p className="text-xs text-slate-500 mb-3">O, A+, A, B+, B, C, F breakdown</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.grade_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="grade" stroke="#64748b" fontSize={13} fontWeight={600} />
                <YAxis stroke="#64748b" fontSize={13} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]}>
                  {data.grade_distribution.map((entry, index) => (
                    <Cell key={`grade-${index}`} fill={GRADE_COLORS[entry.grade] || '#1e3a5f'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">Class insights</h3>
            </div>
            {data.subject_averages?.length ? (
              <div className="flex flex-wrap gap-2">
                {[...data.subject_averages]
                  .sort((a, b) => (a.pass_rate ?? 100) - (b.pass_rate ?? 100))
                  .slice(0, 3)
                  .map((subject) => (
                    <p key={subject.code} className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs text-slate-700">
                      <strong>{subject.name}</strong> has a {Math.max(0, 100 - (subject.pass_rate ?? 0))}% failure rate.
                    </p>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Insights will appear as subject result records are added.</p>
            )}
          </div>
        </Card>

        {/* Attendance Distribution */}
        <Card className="bg-white p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Attendance Compliance Bands</h3>
          <p className="text-xs text-slate-500 mb-3">University 75% cutoff compliance</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.attendance_distribution} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={13} />
                <YAxis dataKey="band" type="category" stroke="#64748b" fontSize={13} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" name="Enrollments" fill="#13315c" radius={[0, 6, 6, 0]}>
                  {data.attendance_distribution.map((entry, index) => (
                    <Cell
                      key={`att-${index}`}
                      fill={entry.band.includes('< 65%') ? '#b91c1c' : entry.band.includes('65%') ? '#b45309' : '#15803d'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Subject Pass Rates */}
        <Card className="bg-white p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Subject Pass Percentages</h3>
          <p className="text-xs text-slate-500 mb-3">Core curriculum clearance rates</p>
          <div className="space-y-2.5 overflow-y-auto max-h-56 pr-1">
            {data.subject_averages?.map((sub) => (
              <div key={sub.code} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-700 text-xs font-mono">{sub.code}</span>
                  <p className="text-[11px] text-slate-600 font-medium truncate max-w-[150px]">{sub.name}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black ${sub.pass_rate >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {sub.pass_rate}% Pass
                  </span>
                  <p className="text-[10px] text-slate-400">Avg {sub.average_mark}/100</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row: Top Performers & Students Needing Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers Leaderboard with Rankings */}
        <Card className="bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Top Rankers & University Merit Scholars</h3>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('students')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              All Students <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data.top_performers?.map((student, idx) => (
              <div key={student.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-2xs ${
                      student.class_rank === 1
                        ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                        : student.class_rank === 2
                        ? 'bg-slate-200 text-slate-800'
                        : student.class_rank === 3
                        ? 'bg-orange-200 text-orange-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    #{student.class_rank || idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{student.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {student.register_number} • {student.department} (Sem {student.semester})
                    </p>
                  </div>

                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                    {student.cgpa} CGPA
                  </span>
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Sem SGPA: {student.sgpa}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Students Requiring Academic Attention */}
        <Card className="bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-slate-900">Academic Attention & At-Risk Radar</h3>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('risk')}
              className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Analyze ML Risk <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data.students_needing_attention?.map((student) => (
              <div key={student.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      student.risk_level === 'High' ? 'bg-rose-500 animate-ping' : 'bg-amber-500'
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{student.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {student.register_number} • {student.department} (Sem {student.semester})
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <Badge tone={student.risk_level === 'High' ? 'danger' : 'warning'}>
                    {student.risk_level} Risk ({student.risk_score}%)
                  </Badge>
                  {student.arrears > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                      {student.arrears} Arrear
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="bg-white p-5">
          <h3 className="text-base font-semibold text-slate-900">Pass / fail distribution</h3>
          {data.total_students ? (
            <div className="relative mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={passFailData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3}>
                    <Cell fill="#0E9AA7" />
                    <Cell fill="#CBD5E1" />
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-xl font-semibold text-[#0B2545]">{data.pass_percentage}%</strong>
                <span className="text-xs text-slate-500">Pass rate</span>
              </div>
            </div>
          ) : <p className="py-12 text-center text-sm text-slate-500">Result data will appear here after publication.</p>}
        </Card>

        <Card className="bg-white p-5">
          <h3 className="text-base font-semibold text-slate-900">Active arrears by subject</h3>
          {arrearsLoading ? (
            <div aria-label="Loading arrears by subject" className="faculty-skeleton mt-4 h-56" />
          ) : arrearError ? (
            <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{arrearError}</p>
          ) : arrearsBySubject.length ? (
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={arrearsBySubject} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid horizontal={false} stroke="#E5EAF1" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="code" type="category" width={58} />
                  <Tooltip formatter={(value) => [value, 'Active arrears']} />
                  <Bar dataKey="count" name="Active arrears" fill="#0E9AA7" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="py-12 text-center text-sm text-slate-500">No active arrears are currently recorded.</p>}
        </Card>

        <Card className="bg-white p-5">
          <h3 className="text-base font-semibold text-slate-900">Academic insights</h3>
          {data.subject_averages?.length ? (
            <div className="mt-3 space-y-3">
              {[...data.subject_averages]
                .sort((first, second) => (first.pass_rate ?? 100) - (second.pass_rate ?? 100))
                .slice(0, 3)
                .map((subject) => (
                  <div key={subject.code} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-800">{subject.name}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Pass rate: <strong>{subject.pass_rate}%</strong> · Average: <strong>{subject.average_mark}/100</strong>
                    </p>
                  </div>
                ))}
            </div>
          ) : <p className="py-12 text-center text-sm text-slate-500">Insights will appear as academic records are added.</p>}
        </Card>
      </div>
    </div>
  );
}
