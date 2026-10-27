import React from 'react';
import CollegeLogo from '../common/CollegeLogo';
import { getCollegeConfig } from '../../config/collegeConfig';
import { ShieldAlert, LogOut, ArrowRight, Home, ShieldCheck, Lock } from 'lucide-react';

export default function AccessBarrier({
  targetRole = 'admin',
  currentRole = 'student',
  user,
  onNavigate,
  onLogout
}) {
  const config = getCollegeConfig();

  const roleTitles = {
    admin: 'University Administrator',
    faculty: 'Faculty Member',
    student: 'Enrolled Scholar'
  };

  const portalNames = {
    admin: 'Administrative Academic Control Center (/admin/dashboard)',
    faculty: 'Faculty Academic & Evaluation Portal (/faculty/dashboard)',
    student: 'Student Examination & Result Portal (/student/dashboard)'
  };

  const targetTitle = roleTitles[targetRole] || targetRole;
  const currentTitle = roleTitles[currentRole] || currentRole;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
      {/* Institutional Top Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CollegeLogo size={40} className="shrink-0" />
          <div>
            <h1 className="text-xs sm:text-sm font-serif font-bold text-[#0F2F57]">
              {config.collegeName}
            </h1>
            <p className="text-[10px] text-slate-500">
              Identity & Access Management Gateway • Controller of Examinations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="text-xs font-semibold text-[#0F2F57] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Return to Portal Sign In</span>
        </button>
      </header>

      {/* Main Access Barrier Modal / Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full bg-white border border-slate-300 rounded-xs shadow-md overflow-hidden">
          {/* Header Strip */}
          <div className="bg-[#0F2F57] text-white px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xs bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold tracking-wide">
                Role Clearance Required
              </h2>
              <p className="text-[11px] text-slate-200">
                Institutional Role-Based Access Control (RBAC) Enforcement
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                You are currently signed in with a verified session, but your account role does not have authorization to access the requested portal.
              </p>
            </div>

            {/* Verification Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-xs p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Requested Portal:</span>
                <span className="font-semibold text-slate-900 text-right">{portalNames[targetRole] || targetRole}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Required Authorization:</span>
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-xs uppercase tracking-wider text-[10px]">
                  {targetTitle} ({targetRole.toUpperCase()})
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Your Active Role:</span>
                <span className="font-bold text-[#0F2F57] bg-blue-50 px-2 py-0.5 border border-blue-200 rounded-xs uppercase tracking-wider text-[10px]">
                  {currentTitle} ({currentRole.toUpperCase()})
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Active Identity:</span>
                <span className="font-mono text-slate-800 text-[11px]">
                  {user?.register_number || user?.email || user?.full_name}
                </span>
              </div>
            </div>

            {/* Regulatory Note */}
            <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-2 bg-amber-50/50 p-2.5 border border-amber-200/60 rounded-xs">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                To uphold data isolation and exam integrity, access privileges are enforced by database verification. Access cannot be granted via URL modification or role switching.
              </span>
            </p>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => onNavigate(`/${currentRole}/dashboard`)}
                className="w-full py-2.5 px-4 bg-[#0F2F57] hover:bg-[#153e70] text-white text-xs font-bold rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Switch to My {currentTitle} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onLogout) onLogout();
                  onNavigate(`/${targetRole}/login`);
                }}
                className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xs border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span>Sign Out & Login as {targetTitle}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 bg-white border-t border-slate-200 text-center text-[11px] text-slate-500">
        {config.collegeName} • Autonomous • Affiliated to Anna University, Chennai • TNEA Code 2732
      </footer>
    </div>
  );
}
