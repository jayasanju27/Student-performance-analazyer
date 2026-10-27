import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Search, 
  LogOut, 
  UserCircle, 
  ShieldCheck, 
  BookOpen, 
  Bell, 
  RefreshCw 
} from 'lucide-react';

export default function Navbar({ onSearchChange, searchTerm }) {
  const { user, role, logout, quickSwitch, loading } = useAuth();

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            University Admin
          </span>
        );
      case 'faculty':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            Faculty Member
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            Student ({user?.register_number || 'Undergraduate'})
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs">
      {/* Left: Quick Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student by name, register number or subject..."
            value={searchTerm || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>
      </div>

      {/* Center: Quick Demo Switcher */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 mx-4">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2">
          Demo Switch:
        </span>
        <button
          onClick={() => quickSwitch('admin')}
          disabled={loading}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
            role === 'admin'
              ? 'bg-white text-purple-700 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Admin
        </button>
        <button
          onClick={() => quickSwitch('faculty')}
          disabled={loading}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
            role === 'faculty'
              ? 'bg-white text-amber-700 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Faculty
        </button>
        <button
          onClick={() => quickSwitch('student')}
          disabled={loading}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
            role === 'student'
              ? 'bg-white text-emerald-700 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Student
        </button>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-3">
        {getRoleBadge()}

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.full_name || 'Academic User'}
            </p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>

          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-blue-100">
            {user?.full_name ? user.full_name.charAt(0) : 'U'}
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
