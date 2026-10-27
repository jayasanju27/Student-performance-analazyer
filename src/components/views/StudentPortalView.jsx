import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { exportReportToPdf } from '../../services/reportsExporter';
import { Badge, Card, DataTable, KpiCard, PageHeader } from '../common/PortalPrimitives';

const cardClass = 'p-5 sm:p-6';

function SummaryCard({ label, value, detail, status }) {
  return (
    <KpiCard
      label={label}
      value={status ? undefined : value}
      trend={status ? value : undefined}
      trendTone={status === 'Declining' ? 'danger' : status === 'Stable' ? 'warning' : 'success'}
      detail={detail}
    />
  );
}

function EmptyState({ message }) {
  return (
    <p className="rounded-lg border border-dashed border-[#E2E8F0] bg-white px-4 py-8 text-center text-sm text-[#64748B]">
      {message}
    </p>
  );
}

export default function StudentPortalView({ activeTab }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!user?.student_id) {
      setError('Your student account is missing its student record. Contact the academic office.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [profile, results, arrears] = await Promise.all([
        api.getStudentById(user.student_id),
        api.getUniversityResultHistory(user.student_id),
        api.getArrears(),
      ]);
      setData({ profile, results, arrears });
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your academic information.');
    } finally {
      setLoading(false);
    }
  }, [user?.student_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentAssessments = useMemo(
    () => (data?.profile.ia_assessments || []).filter((assessment) => assessment.semester === data?.profile.semester),
    [data]
  );
  const latestAssessments = useMemo(() => {
    const subjects = new Map();
    for (const assessment of currentAssessments) {
      subjects.set(assessment.subject_code, assessment);
    }
    return [...subjects.values()];
  }, [currentAssessments]);
  const internalAverage = latestAssessments.length
    ? latestAssessments.reduce((total, item) => total + ((item.ia1_mark / item.ia1_max + item.ia2_mark / item.ia2_max) * 50), 0) / (latestAssessments.length * 2)
    : null;
  const internalChange = latestAssessments.length
    ? latestAssessments.reduce((total, item) => total + ((item.ia2_mark / item.ia2_max - item.ia1_mark / item.ia1_max) * 100), 0) / latestAssessments.length
    : null;
  const trend = internalChange === null ? 'Not enough assessment data' : internalChange > 5 ? 'Improving' : internalChange < -5 ? 'Declining' : 'Stable';

  const studentArrears = data?.arrears || [];
  const activeArrears = studentArrears.filter((item) => item.status === 'Active');
  const clearedArrears = studentArrears.filter((item) => item.status === 'Cleared');
  const previousArrears = activeArrears.filter((item) => item.type === 'Previous');
  const currentArrears = activeArrears.filter((item) => item.type === 'Current');

  const downloadProgressReport = () => {
    if (!data) return;
    const rows = [
      ...(data.profile.ia_assessments || []).map((item) => ({
        type: 'Internal assessment',
        semester: item.semester,
        subject: item.subject_code,
        session: 'IA-1 / IA-2',
        first: item.ia1_mark,
        second: item.ia2_mark,
        grade: '',
        status: '',
      })),
      ...(data.results || []).map((item) => ({
        type: 'University result',
        semester: item.semester,
        subject: item.subject_code,
        session: item.exam_session,
        first: item.total_marks ?? '',
        second: '',
        grade: item.grade,
        status: item.result_status,
      })),
    ];
    exportReportToPdf(
      `Academic Progress Report - ${data.profile.register_number}`,
      `${data.profile.full_name} · ${data.profile.department_code} · Generated ${new Date().toLocaleDateString()}`,
      [
        { header: 'Record', key: 'type' },
        { header: 'Semester', key: 'semester' },
        { header: 'Subject', key: 'subject' },
        { header: 'Session', key: 'session' },
        { header: 'Mark 1 / Total', key: 'first' },
        { header: 'Mark 2', key: 'second' },
        { header: 'Grade', key: 'grade' },
        { header: 'Result', key: 'status' },
      ],
      rows
    );
  };

  if (loading) {
    return (
      <div aria-label="Loading your academic information" className="space-y-4">
        <div className="faculty-skeleton h-24" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="faculty-skeleton h-28" />)}
        </div>
        <div className="faculty-skeleton h-72" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div role="alert" className="rounded-lg border border-red-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-[#B91C1C]" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-[#0F172A]">Unable to load your portal</h1>
            <p className="mt-1 text-sm text-[#64748B]">{error || 'Your academic record is unavailable.'}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#13315C] px-4 text-sm font-medium text-white hover:bg-[#0B2545]"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { profile, results } = data;
  const averagePercentage = profile.marks?.length
    ? profile.marks.reduce((total, item) => total + item.total_marks, 0) / profile.marks.length
    : 0;
  const chartRows = latestAssessments.map((item) => ({
    subject: item.subject_code,
    'My IA-1': item.ia1_mark,
    'My IA-2': item.ia2_mark,
    'Class average': ((item.class_ia1_avg || 0) + (item.class_ia2_avg || 0)) / 2,
  }));
  const heading = {
    dashboard: 'My Overview',
    'ia-assessment': 'My Internal Marks',
    results: 'My University Results',
    arrears: 'My Arrears',
  }[activeTab] || 'My Overview';

  return (
    <div className="space-y-6">
      <section className="student-welcome-banner rounded-xl px-5 py-5 sm:px-7 sm:py-6">
        <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
          Welcome back, {profile.full_name}
        </h1>
        <p className="mt-2 text-sm text-slate-100">
          {profile.register_number} <span className="px-1.5 text-teal-200">·</span>
          {profile.department_name} <span className="px-1.5 text-teal-200">·</span>
          Semester {profile.semester}
        </p>
      </section>
      <PageHeader
        title={heading}
        actions={(
          <button type="button" onClick={downloadProgressReport} className="portal-button-primary inline-flex items-center justify-center gap-2">
            <Download className="h-[18px] w-[18px]" /> Download progress report
          </button>
        )}
      />

      {activeTab === 'dashboard' && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Internal assessment average" value={internalAverage === null ? '—' : `${internalAverage.toFixed(1)}%`} />
            <SummaryCard label="University result average" value={`${averagePercentage.toFixed(1)}%`} />
            <SummaryCard label="Current-semester arrears" value={currentArrears.length} />
            <SummaryCard label="IA trend" value={trend} status={trend} detail={internalChange === null ? '' : `${internalChange > 0 ? '+' : ''}${internalChange.toFixed(1)} percentage points`} />
          </div>
          <Card className={`${cardClass} border-l-4 border-l-[#0E9AA7]`}>
            <h2 className="text-lg font-semibold text-[#0F172A]">Academic insight</h2>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              {internalChange === null
                ? 'Internal assessment results will appear here after your marks are recorded.'
                : `Your internal assessment average is ${internalAverage.toFixed(1)}%. Your IA-2 performance is ${trend.toLowerCase()} compared with IA-1. Your university result average is ${averagePercentage.toFixed(1)}%.`}
              {activeArrears.length > 0
                ? ` You have ${activeArrears.length} active arrears (${currentArrears.length} current-semester and ${previousArrears.length} previous).`
                : ' You have no active arrears.'}
            </p>
          </Card>
          <div className="grid gap-6 lg:grid-cols-2">
          <Card className={cardClass}>
            <h2 className="text-base font-semibold text-[#0F172A]">IA-1 vs IA-2 trend</h2>
            {chartRows.length ? (
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartRows}>
                    <CartesianGrid stroke="#E5EAF1" vertical={false} />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 50]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="My IA-1" stroke="#64748B" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="My IA-2" stroke="#13315C" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Class average" stroke="#0E9AA7" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState message="Your assessment trend will appear once your internal marks are recorded." />}
          </Card>
          <Card className={cardClass}>
            <h2 className="text-lg font-semibold text-[#0F172A]">Semester progress</h2>
            {(profile.semester_results || []).length ? (
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profile.semester_results}>
                    <CartesianGrid stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="semester" tickFormatter={(semester) => `Sem ${semester}`} />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="sgpa" name="SGPA" fill="#13315C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState message="Semester results are not available yet. Check back after results are published." />}
          </Card>
          </div>
        </>
      )}

      {activeTab === 'ia-assessment' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryCard label="My current-semester IA average" value={internalAverage === null ? '—' : `${internalAverage.toFixed(1)}%`} />
            <SummaryCard label="My average vs class average" value={chartRows.length ? 'Per-subject comparison' : '—'} detail="Class averages only; individual student marks are not shown." />
          </div>
          <Card className={cardClass}>
            <h2 className="text-lg font-semibold text-[#0F172A]">IA-1 and IA-2 by subject</h2>
            {chartRows.length ? (
              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartRows}>
                    <CartesianGrid stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 50]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="My IA-1" fill="#94A3B8" />
                    <Bar dataKey="My IA-2" fill="#13315C" />
                    <Bar dataKey="Class average" fill="#0E9AA7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState message="Your internal assessment marks are not available yet. Contact your faculty if you expected to see marks." />}
          </Card>
          {chartRows.length > 0 && (
            <Card className={cardClass}>
              <DataTable>
              <table className="w-full min-w-[600px] text-left text-[13px]">
                <thead className="bg-slate-50 text-[#64748B]">
                  <tr>
                    <th className="p-3 font-medium">Subject</th>
                    <th className="p-3 text-right font-medium">IA-1</th>
                    <th className="p-3 text-right font-medium">IA-2</th>
                    <th className="p-3 text-right font-medium">Class average</th>
                  </tr>
                </thead>
                <tbody>
                  {chartRows.map((row) => (
                    <tr key={row.subject} className="border-t border-[#E2E8F0]">
                      <td className="p-3 font-medium text-[#0F172A]">{row.subject}</td>
                      <td className="p-3 text-right">{row['My IA-1']}</td>
                      <td className="p-3 text-right">{row['My IA-2']}</td>
                      <td className="p-3 text-right">{row['Class average'].toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </DataTable>
            </Card>
          )}
        </>
      )}

      {activeTab === 'results' && (
        <Card className={cardClass}>
          <h2 className="text-lg font-semibold text-[#0F172A]">My university results</h2>
          {results.length ? (
            <DataTable className="mt-4">
            <table className="w-full min-w-[650px] text-left text-[13px]">
              <thead className="bg-slate-50 text-[#64748B]">
                <tr>
                  <th className="p-3 font-medium">Session</th>
                  <th className="p-3 font-medium">Semester</th>
                  <th className="p-3 font-medium">Subject</th>
                  <th className="p-3 text-right font-medium">Marks</th>
                  <th className="p-3 font-medium">Grade</th>
                  <th className="p-3 font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr key={item.id} className="border-t border-[#E2E8F0]">
                    <td className="p-3">{item.exam_session}</td>
                    <td className="p-3">Semester {item.semester}</td>
                    <td className="p-3">{item.subject_code} · {item.subject_name}</td>
                    <td className="p-3 text-right">{item.total_marks ?? '—'}</td>
                    <td className="p-3">{item.grade || '—'}</td>
                    <td className="p-3">
                      <Badge tone={item.result_status === 'PASS' ? 'success' : item.result_status === 'FAIL' ? 'danger' : 'neutral'}>
                        {item.result_status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </DataTable>
          ) : <div className="mt-4"><EmptyState message="No university examination results have been published to your account yet." /></div>}
        </Card>
      )}

      {activeTab === 'arrears' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { label: 'Current', items: currentArrears, accent: 'border-t-rose-500', tone: 'danger', empty: 'No current-semester arrears.' },
            { label: 'Cleared', items: clearedArrears, accent: 'border-t-emerald-500', tone: 'success', empty: 'No cleared arrears are recorded yet.' },
            { label: 'Previous', items: previousArrears, accent: 'border-t-slate-400', tone: 'neutral', empty: 'No previous arrears.' },
          ].map((group) => (
            <Card key={group.label} className={`${cardClass} border-t-4 ${group.accent}`}>
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-[#0F172A]">{group.label} arrears</h2>
                <Badge tone={group.tone}>{group.items.length}</Badge>
              </div>
              {group.items.length ? (
                <ul className="divide-y divide-[#E5EAF1]">
                  {group.items.map((item) => (
                    <li key={`${item.source}-${item.id}`} className="flex flex-col gap-1 py-3 text-sm">
                      <span className="font-semibold text-[#0F172A]">{item.subject_code}</span>
                      <span className="text-[#64748B]">{item.subject_name}</span>
                      <span className="text-xs text-[#64748B]">Semester {item.semester_failed}</span>
                    </li>
                  ))}
                </ul>
              ) : <EmptyState message={group.empty} />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
