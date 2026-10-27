import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Search,
  LogOut,
  BookOpen,
  KeyRound,
} from 'lucide-react';

export default function PortalHeader({ pageTitle, onSearchChange, searchTerm, onMenuClick, onChangePassword, onBack }) {
  const { user, role, logout } = useAuth();
  const displayName = role === 'faculty'
    ? (user?.full_name && !user.full_name.includes('Rajesh Sharma') ? user.full_name : 'Faculty')
    : (user?.full_name || 'Academic Scholar');

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-3 py-3 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
        {role === 'faculty' && (
          <button
            type="button"
            onClick={onBack || (() => {
              logout();
              window.location.href = '/login';
            })}
            title="Back to login"
            aria-label="Back to login"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-[#13315C] transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-[#13315C]" />
          </button>
        )}
        <button type="button" onClick={onMenuClick} aria-label="Open navigation" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>
        <h1 className="hidden shrink-0 text-2xl font-semibold text-[#0B2545] lg:block">{pageTitle}</h1>
        <div className="relative w-full max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              role === 'faculty'
                ? 'Search students...'
                : role === 'student'
                ? 'Search course code, title, or semester...'
                : 'Search student by name, register number or subject...'
            }
            value={searchTerm || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {role === 'faculty' && (
          <span className="hidden items-center gap-1.5 rounded-lg border border-[#D5E2EA] bg-[#E7F5F5] px-2.5 py-1 text-sm font-semibold text-[#13315C] xl:inline-flex">
            <BookOpen className="h-[18px] w-[18px] text-[#0E9AA7]" />
            Faculty
          </span>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onChangePassword}
            aria-label="Change password"
            className="portal-change-password inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-[#13315C] hover:bg-slate-50"
          >
            <KeyRound className="h-[18px] w-[18px]" />
            <span>Change password</span>
          </button>
          {role !== 'admin' && <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {displayName}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              {user?.register_number || user?.email}
            </p>
          </div>}

          <div aria-label={displayName} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E7F5F5] text-sm font-bold text-[#13315C]">
            {displayName.charAt(0)}
          </div>

          {role !== 'admin' && <button
            type="button"
            onClick={logout}
            title="Sign out"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#13315C] px-3 text-sm font-semibold text-white hover:bg-[#0B2545]"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>}
        </div>
      </div>
    </header>
  );
}
