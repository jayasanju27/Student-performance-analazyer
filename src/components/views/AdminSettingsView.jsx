import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { getCollegeConfig, saveCollegeConfig } from '../../config/collegeConfig';
import {
  Sliders,
  Award,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  BookOpen,
  Plus,
  Save,
  ShieldCheck,
  Building,
  History,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export default function AdminSettingsView() {
  const [activeTab, setActiveTab] = useState('college-info');
  const [collegeConfig, setCollegeConfig] = useState(getCollegeConfig());
  const [gradingRules, setGradingRules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [rulesRes, deptsRes] = await Promise.all([
        api.getGradingRules(),
        api.getDepartments(),
      ]);
      setGradingRules(rulesRes);
      setDepartments(deptsRes);

      try {
        const logs = await api.getAuditLogs(30);
        setAuditLogs(logs || []);
      } catch {
        // Optional audit logs fallback
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setCollegeConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCollegeConfig = (e) => {
    e.preventDefault();
    saveCollegeConfig(collegeConfig);
    setFeedbackMsg('Institutional details and accreditation settings saved successfully!');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleSaveThresholds = (event) => {
    event.preventDefault();
    saveCollegeConfig(collegeConfig);
    setFeedbackMsg('Academic thresholds saved for this browser.');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleRuleChange = (index, field, value) => {
    const updated = [...gradingRules];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setGradingRules(updated);
  };

  const handleSaveRule = async (rule) => {
    try {
      await api.updateGradingRule(rule.id, {
        min_percentage: rule.min_percentage,
        max_percentage: rule.max_percentage,
        grade_point: rule.grade_point,
        description: rule.description,
      });
      setFeedbackMsg(`Grading rule '${rule.grade}' updated successfully!`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      alert('Error updating rule: ' + err.message);
    }
  };

  const handleResetDemoData = async () => {
    if (
      !window.confirm(
        'Replace the current demo database with sample data for 60 students, five current-semester subjects per department, and three examination sessions?'
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      await api.resetDemoData();
      setFeedbackMsg(
        'Sample data loaded: 60 students, five current-semester subjects per department, and three examination sessions.'
      );
      loadSettings();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      alert('Failed to reset demo data: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formal Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xs border border-slate-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-purple-700" />
              Administrative Governance
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#0F2F57] tracking-tight">
            Institutional Configuration & Academic Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage official college identity, grading scales, CBCS regulations, and database audit logs.
          </p>
        </div>

        {/* Demo Data Reset Button */}
        <button
          onClick={handleResetDemoData}
          disabled={resetting}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 disabled:opacity-50 rounded-xs text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Loading sample data...' : 'Load sample data'}
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-300">
        <button
          onClick={() => setActiveTab('college-info')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'college-info'
              ? 'border-[#0F2F57] text-[#0F2F57]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Institutional Identity & Contacts
        </button>
        <button
          onClick={() => setActiveTab('grading')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'grading'
              ? 'border-[#0F2F57] text-[#0F2F57]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Grading Rules & Grade Points (GP)
        </button>
        <button
          onClick={() => setActiveTab('thresholds')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'thresholds'
              ? 'border-[#0F2F57] text-[#0F2F57]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Academic Thresholds
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'audit'
              ? 'border-[#0F2F57] text-[#0F2F57]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Institutional Audit History
        </button>
      </div>

      {/* Tab 1: College Information Configuration */}
      {activeTab === 'college-info' && (
        <form onSubmit={handleSaveCollegeConfig} className="bg-white border border-slate-300 rounded-xs p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0F2F57]" />
                Institutional Identification & Accreditation Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Details configured here appear in the portal and generated marksheets.
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F2F57] hover:bg-[#153e70] text-white text-xs font-bold rounded-xs tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Institutional Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                College Name (Full English)
              </label>
              <input
                type="text"
                required
                value={collegeConfig.collegeName}
                onChange={(e) => handleConfigChange('collegeName', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F2F57]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Regional language subtitle
              </label>
              <input
                type="text"
                value={collegeConfig.collegeNameRegional}
                onChange={(e) => handleConfigChange('collegeNameRegional', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F2F57]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                University Affiliation
              </label>
              <input
                type="text"
                required
                value={collegeConfig.affiliation}
                onChange={(e) => handleConfigChange('affiliation', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F2F57]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Accreditations & Regulatory Approvals
              </label>
              <input
                type="text"
                required
                value={collegeConfig.approvals}
                onChange={(e) => handleConfigChange('approvals', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F2F57]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                College Code & AISHE Identifiers
              </label>
              <input
                type="text"
                value={collegeConfig.collegeCode}
                onChange={(e) => handleConfigChange('collegeCode', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F2F57]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Current Academic Session
              </label>
              <input
                type="text"
                value={collegeConfig.academicYear}
                onChange={(e) => handleConfigChange('academicYear', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F2F57]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Campus Postal Address
              </label>
              <input
                type="text"
                value={collegeConfig.campusAddress}
                onChange={(e) => handleConfigChange('campusAddress', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F2F57]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Administrative Telephone / Helpline
              </label>
              <input
                type="text"
                value={collegeConfig.phoneGeneral}
                onChange={(e) => handleConfigChange('phoneGeneral', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F2F57]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Controller of Examinations (COE) Helpline
              </label>
              <input
                type="text"
                value={collegeConfig.phoneExamCell}
                onChange={(e) => handleConfigChange('phoneExamCell', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F2F57]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Official Registrar Email
              </label>
              <input
                type="email"
                value={collegeConfig.emailGeneral}
                onChange={(e) => handleConfigChange('emailGeneral', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F2F57]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                COE Examination Cell Email
              </label>
              <input
                type="email"
                value={collegeConfig.emailExamCell}
                onChange={(e) => handleConfigChange('emailExamCell', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F2F57]"
              />
            </div>
          </div>
        </form>
      )}

      {activeTab === 'thresholds' && (
        <form onSubmit={handleSaveThresholds} className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Academic thresholds</h3>
            <p className="mt-1 text-sm text-slate-600">Configure the values used by IA progress labels and academic attention indicators.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { field: 'improvementThresholdPct', label: 'Improvement threshold (%)', min: 1, max: 100 },
              { field: 'declineThresholdPct', label: 'Decline threshold (%)', min: 1, max: 100 },
              { field: 'passMarkPct', label: 'Pass mark (%)', min: 1, max: 100 },
              { field: 'highRiskArrearCount', label: 'High-risk arrear count', min: 1, max: 20 },
            ].map((item) => (
              <label key={item.field} className="space-y-1.5 text-sm font-medium text-slate-700">
                <span>{item.label}</span>
                <input
                  type="number"
                  required
                  min={item.min}
                  max={item.max}
                  value={collegeConfig[item.field]}
                  onChange={(event) => handleConfigChange(item.field, Number(event.target.value))}
                  className="block min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-[#1E3A5F] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]"
                />
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <button type="submit" className="rounded-lg bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#16304F]">
              Save thresholds
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Configurable Grading System Table */}
      {activeTab === 'grading' && (
        <div className="bg-white rounded-xs border border-slate-300 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#0F2F57]" />
              Configurable Letter Grading System & Grade Points (GP)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Modifying percentage boundaries recalculates SGPA/CGPA across all student records in the persistent database.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-4">Letter Grade</th>
                  <th className="py-2.5 px-4">Min Percentage (%)</th>
                  <th className="py-2.5 px-4">Max Percentage (%)</th>
                  <th className="py-2.5 px-4">Grade Point (0 - 10)</th>
                  <th className="py-2.5 px-4">Academic Classification</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {gradingRules.map((rule, idx) => (
                  <tr key={rule.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-3 px-4 font-mono font-bold text-[#0F2F57] text-sm">
                      {rule.grade}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.1"
                        value={rule.min_percentage}
                        onChange={(e) => handleRuleChange(idx, 'min_percentage', e.target.value)}
                        className="w-24 px-2.5 py-1.5 text-xs border border-slate-300 rounded-xs text-slate-800 font-bold focus:ring-1 focus:ring-[#0F2F57]"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.1"
                        value={rule.max_percentage}
                        onChange={(e) => handleRuleChange(idx, 'max_percentage', e.target.value)}
                        className="w-24 px-2.5 py-1.5 text-xs border border-slate-300 rounded-xs text-slate-800 font-bold focus:ring-1 focus:ring-[#0F2F57]"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.1"
                        value={rule.grade_point}
                        onChange={(e) => handleRuleChange(idx, 'grade_point', e.target.value)}
                        className="w-20 px-2.5 py-1.5 text-xs border border-slate-300 rounded-xs text-slate-800 font-bold focus:ring-1 focus:ring-[#0F2F57]"
                      />
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {rule.description}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSaveRule(rule)}
                        className="px-3 py-1.5 bg-[#0F2F57] hover:bg-[#153e70] text-white rounded-xs text-[11px] font-semibold transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        <span>Update Rule</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Institutional Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xs border border-slate-300 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-[#0F2F57]" />
              System Security & Administrative Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of verified user logins, result publications, and database modifications.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-4 w-40">Timestamp</th>
                  <th className="py-2.5 px-4 w-32">Action</th>
                  <th className="py-2.5 px-4 w-48">Actor / User</th>
                  <th className="py-2.5 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log, idx) => (
                    <tr key={log.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                        {log.created_at || 'Recently'}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono text-[10px] font-bold rounded-xs border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {log.user_email || 'System'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
