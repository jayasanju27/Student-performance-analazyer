import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Sliders,
  Award,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  BookOpen,
  Plus,
  Save
} from 'lucide-react';

export default function AdminSettingsView() {
  const [gradingRules, setGradingRules] = useState([]);
  const [departments, setDepartments] = useState([]);
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
    if (!window.confirm('Reset database with clean realistic demo data (24 students, departments, faculty, marks, results)?')) {
      return;
    }
    setResetting(true);
    try {
      await api.resetDemoData();
      setFeedbackMsg('Demo database reset successfully with realistic student records, results, and risk calculations!');
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
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              Institutional Configuration
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic Grading Scale & University System Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure letter grade cutoffs, grade points (GP), curriculum departments, and test demo data management.
          </p>
        </div>

        {/* Demo Data Reset Button */}
        <button
          onClick={handleResetDemoData}
          disabled={resetting}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Resetting Data...' : 'Reload / Reset Demo Data'}
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {feedbackMsg}
        </div>
      )}

      {/* Configurable Grading System Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Configurable Letter Grading System & Grade Points
            </h3>
            <p className="text-xs text-slate-500">
              Modifying percentage boundaries recalculates SGPA/CGPA across all student records.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Min Percentage (%)</th>
                <th className="py-3 px-4">Max Percentage (%)</th>
                <th className="py-3 px-4">Grade Point (0 - 10)</th>
                <th className="py-3 px-4">Academic Classification</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gradingRules.map((rule, idx) => (
                <tr key={rule.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-black text-blue-700 text-sm">
                    {rule.grade}
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      step="0.1"
                      value={rule.min_percentage}
                      onChange={(e) => handleRuleChange(idx, 'min_percentage', e.target.value)}
                      className="w-24 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-600/20"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      step="0.1"
                      value={rule.max_percentage}
                      onChange={(e) => handleRuleChange(idx, 'max_percentage', e.target.value)}
                      className="w-24 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-600/20"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      step="0.1"
                      value={rule.grade_point}
                      onChange={(e) => handleRuleChange(idx, 'grade_point', e.target.value)}
                      className="w-20 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-600/20"
                    />
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {rule.description || 'Standard'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSaveRule(rule)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 ml-auto"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Departments Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          University Academic Departments & Curriculum
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-xs">
                {d.code}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-2">{d.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{d.description}</p>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                <span><strong>{d.total_students}</strong> Enrolled Students</span>
                <span><strong>{d.total_subjects}</strong> Courses</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
