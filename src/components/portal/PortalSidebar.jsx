import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCollegeConfig } from '../../config/collegeConfig';
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  Award,
  FileText,
  Sliders,
  RotateCcw,
  ChevronRight,
  FileSpreadsheet,
  X,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import CollegeLogo from '../common/CollegeLogo';

export default function PortalSidebar({ currentTab, onSelectTab, isOpen, onClose, collapsed, onToggleCollapse, onSignOut }) {
  const { role, user, logout } = useAuth();
  const config = getCollegeConfig();

  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { group: 'Overview', id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { group: 'Analysis', id: 'ia-assessment', label: 'IA Analyzer', icon: Award },
        { group: 'Analysis', id: 'pdf-extractor', label: 'University Results', icon: FileText },
        { group: 'Records', id: 'students', label: 'Students', icon: Users },
        { group: 'Reports', id: 'reports', label: 'Reports', icon: FileSpreadsheet },
        { group: 'Reports', id: 'settings', label: 'Settings', icon: Sliders },
      ];
    }

    if (role === 'faculty') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'ia-assessment', label: 'IA Analyzer', icon: Award },
        { id: 'pdf-extractor', label: 'University Results', icon: FileText },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
      ];
    }

    // Default: Student Portal
    return [
      { id: 'dashboard', label: 'My Overview', icon: LayoutDashboard },
      { id: 'ia-assessment', label: 'My Internal Marks', icon: Award },
      { id: 'results', label: 'My University Results', icon: FileText },
      { id: 'arrears', label: 'My Arrears', icon: RotateCcw },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
    {isOpen && (
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
      />
    )}
    <aside className={`portal-sidebar fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-200 bg-gradient-to-b from-[#0B2545] to-[#13315C] text-white transition-all duration-200 md:sticky md:top-0 md:z-20 md:min-h-screen md:translate-x-0 ${collapsed && role === 'admin' ? 'is-collapsed md:w-[76px]' : 'md:w-60'} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Institutional Crest & Portal Header */}
      <div className="border-b border-white/15 p-4">
        <div className="flex items-center gap-2.5">
          {role === 'faculty' && (
            <button
              type="button"
              onClick={onSignOut || logout}
              title="Back to login"
              aria-label="Back to login"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <CollegeLogo size={40} className="rounded-lg bg-white p-1" />
          <div className={`overflow-hidden ${collapsed && role === 'admin' ? 'md:hidden' : ''}`}>
            <h1 className="truncate text-base font-extrabold tracking-tight text-white">
              AcademIQ
            </h1>
            <p className="truncate text-[10px] text-slate-200">{role === 'admin' ? 'Administration portal' : 'Academic performance insights'}</p>
          </div>
          {role === 'admin' && (
            <button type="button" onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="ml-auto hidden rounded-lg p-2 text-slate-200 hover:bg-white/10 md:inline-flex">
              {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close navigation" className="ml-auto rounded-lg p-2 text-slate-200 hover:bg-white/10 md:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={`mt-2.5 flex items-center justify-between ${collapsed && role === 'admin' ? 'md:hidden' : ''}`}>
          <span className="rounded-md border border-white/25 bg-white/10 px-2 py-1 text-xs font-semibold text-white">
            {role === 'admin' ? 'Administration cell' : role === 'faculty' ? 'Faculty portal' : 'Student portal'}
          </span>
          <span className="text-[10px] font-mono text-slate-200">
            {role === 'student'
              ? user?.register_number || 'Register number'
              : role === 'faculty'
                ? 'Faculty'
                : role?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Navigation Modules List */}
      <nav className="flex-1 overflow-y-auto p-3">
        {role !== 'admin' && <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">{role === 'faculty' ? 'Workspace' : 'Academic Modules'}</div>}

        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <React.Fragment key={item.id}>
              {role === 'admin' && (index === 0 || navItems[index - 1].group !== item.group) && (
                <p className={`px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300 ${collapsed ? 'md:hidden' : ''}`}>{item.group}</p>
              )}
              <button
                aria-current={isActive ? 'page' : undefined}
                aria-label={collapsed && role === 'admin' ? item.label : undefined}
                title={collapsed && role === 'admin' ? item.label : undefined}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors cursor-pointer ${
                  isActive ? 'bg-white/15 text-white font-semibold' : 'text-slate-200 hover:text-white hover:bg-white/10'
                } ${collapsed && role === 'admin' ? 'md:justify-center md:px-2' : ''}`}
                onClick={() => { onSelectTab(item.id); onClose?.(); }}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-[#5DDBD8]' : 'text-slate-300'}`} />
                  <span className={collapsed && role === 'admin' ? 'md:hidden' : 'truncate'}>{item.label}</span>
                </div>
                {isActive && <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#0E9AA7]" />}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Institutional Session Info Footer */}
      <div className="border-t border-white/15 p-3 text-[11px] text-slate-200">
        {role === 'admin' ? (
          <div className={`flex items-center gap-3 ${collapsed ? 'md:justify-center' : ''}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">{user?.full_name?.charAt(0) || 'A'}</span>
            <div className={`min-w-0 flex-1 ${collapsed ? 'md:hidden' : ''}`}>
              <p className="truncate text-sm font-semibold text-white">{user?.full_name || 'Administrator'}</p>
              <p className="truncate text-xs text-slate-300">{config.academicYear}</p>
            </div>
            <button type="button" onClick={onSignOut || logout} title="Sign out" aria-label="Sign out" className={`rounded-lg p-2 text-slate-200 hover:bg-white/10 hover:text-white ${collapsed ? 'md:hidden' : ''}`}>
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="font-semibold text-white">{config.academicYear}</p>
            <p className="text-[10px] text-slate-300">Verified database authorization active.</p>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
