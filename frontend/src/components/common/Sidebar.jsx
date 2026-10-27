import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Award,
  CalendarCheck,
  AlertTriangle,
  FileText,
  UploadCloud,
  Sliders,
  User,
  GraduationCap,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ currentTab, onSelectTab }) {
  const { role } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      id: 'students',
      label: 'Student Directory',
      icon: Users,
      roles: ['admin', 'faculty'],
    },
    {
      id: 'marks',
      label: 'Marks & Internal Grading',
      icon: Award,
      roles: ['admin', 'faculty'],
    },
    {
      id: 'attendance',
      label: 'Attendance Tracker',
      icon: CalendarCheck,
      roles: ['admin', 'faculty'],
    },
    {
      id: 'risk',
      label: 'Academic Risk & AI Insights',
      icon: AlertTriangle,
      badge: 'ML Engine',
      badgeColor: 'bg-rose-100 text-rose-700',
      roles: ['admin', 'faculty', 'student'],
    },
    {
      id: 'results',
      label: 'University Marksheet',
      icon: FileText,
      badge: 'PDF',
      badgeColor: 'bg-blue-100 text-blue-700',
      roles: ['admin', 'faculty', 'student'],
    },
    {
      id: 'student-profile',
      label: 'My Academic Profile',
      icon: User,
      roles: ['student'],
    },
    {
      id: 'upload',
      label: 'CSV / Excel Upload Center',
      icon: UploadCloud,
      roles: ['admin', 'faculty'],
    },
    {
      id: 'settings',
      label: 'Grading Rules & System',
      icon: Sliders,
      roles: ['admin'],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role || 'student'));

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md shadow-black/20">
          <img
            src="/info-college-logo.png"
            alt="Info Institute of Engineering Logo"
            className="w-full h-full object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xs font-bold tracking-tight text-white leading-tight truncate" title="Info Institute of Engineering">
            Info Institute of Engg
          </h1>
          <p className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase truncate">
            Anna Univ • Autonomous
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <p className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Academic Modules
        </p>
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-blue-700 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* University Accreditation Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NAAC Accredited & ISO 9001</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Info Institute of Engg • TNEA Code: 2732
          </p>
        </div>
      </div>
    </aside>
  );
}
