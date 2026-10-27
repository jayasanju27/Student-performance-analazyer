import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  User,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  CheckCircle2
} from 'lucide-react';

export default function LoginView() {
  const { login, quickSwitch, loading, authError } = useAuth();
  const [username, setUsername] = useState('admin@college.com');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch {
      // handled in context
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-950 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(10, 25, 47, 0.92) 0%, rgba(15, 35, 68, 0.88) 50%, rgba(10, 25, 47, 0.95) 100%), url('/campus-banner.jpg')`
      }}
    >
      {/* Decorative ambient lighting & college colors */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-10">
        {/* Left Side: Brand & Feature Highlights (5 cols) */}
        <div 
          className="lg:col-span-5 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10, 25, 47, 0.96) 0%, rgba(15, 30, 58, 0.96) 100%), url('/campus-banner.jpg')`
          }}
        >
          <div>
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-black/30 shrink-0 border border-white/30">
                <img 
                  src="/info-college-logo.png" 
                  alt="Info Institute of Engineering Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-tight">Info Institute of Engineering</h1>
                <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Autonomous • Anna Univ Affiliated</p>
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight leading-snug">
              Academic Performance & Result Analyzer
            </h2>
            <p className="text-slate-300 text-xs mt-3 leading-relaxed">
              Institutional governance system for student performance tracking, Anna University Autonomous grade cards,
              attendance analytics, and early academic risk detection.
            </p>

            <div className="mt-8 space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-role access for Admin, Faculty & Students</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated SGPA / CGPA credit point engine</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Predictive ML academic risk & advisory radar</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official PDF transcript generation with ReportLab</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">NH-209, Sathy Road, Kovilpalayam, Coimbatore - 641 107</p>
            <p>Approved by AICTE • Accredited by NAAC & ISO 9001:2015 • TNEA Code: 2732</p>
          </div>
        </div>

        {/* Right Side: Login Form & Quick Demo Buttons (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-slate-50/70">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Info Institute Portal Sign In</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your institutional email address or student Register Number.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {authError}
              </div>
            )}

            {/* Quick Demo Login Cards */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Demo Account Login:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => quickSwitch('admin')}
                  disabled={loading}
                  className="p-2.5 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition-all shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span className="text-[9px] font-bold uppercase bg-purple-100 text-purple-800 px-1 rounded">Dean</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1">Admin</p>
                  <p className="text-[10px] text-slate-400 truncate">admin@college.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickSwitch('faculty')}
                  disabled={loading}
                  className="p-2.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition-all shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-800 px-1 rounded">Faculty</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1">Professor</p>
                  <p className="text-[10px] text-slate-400 truncate">faculty@college.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickSwitch('student')}
                  disabled={loading}
                  className="p-2.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1 rounded">Reg No</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1">Student</p>
                  <p className="text-[10px] text-slate-400 truncate">REG2026CSE001</p>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-slate-50/50 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                Or sign in with credentials
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email or Register Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@college.com or REG2026CSE001"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Info Institute Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 text-center">
              <strong>Demo Passwords:</strong> Admin: <code className="font-mono font-bold">admin123</code> • Faculty: <code className="font-mono font-bold">faculty123</code> • Student: <code className="font-mono font-bold">student123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
