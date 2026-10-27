import React, { useState } from 'react';
import CollegeLogo from '../common/CollegeLogo';
import { getCollegeConfig } from '../../config/collegeConfig';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  Phone,
  Mail,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  User,
  ArrowRight,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function CollegeHeader({ onNavigate, activeSection }) {
  const config = getCollegeConfig();
  const { isAuthenticated, user, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'academics', label: 'Academics' },
    { id: 'departments', label: 'Departments' },
    { id: 'examinations', label: 'Examinations' },
    { id: 'results', label: 'Results' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate(id);
  };

  const getDashboardUrl = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'faculty') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 select-none">
      {/* 1. Top Institutional Utility Strip */}
      <div className="bg-[#0A192F] text-slate-300 text-[11px] py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Regulatory Accreditations */}
          <div className="flex items-center gap-3 text-center md:text-left flex-wrap justify-center">
            <span className="font-semibold text-slate-200">{config.approvals}</span>
            <span className="hidden lg:inline text-slate-600">•</span>
            <span className="hidden lg:inline text-slate-400">{config.collegeCode}</span>
            <span className="hidden xl:inline text-slate-600">•</span>
            <span className="hidden xl:inline text-slate-400">{config.aisheCode}</span>
          </div>

          {/* Contact Helpline & Understated Portal Links */}
          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Helpline: {config.phoneGeneral.split('/')[0].trim()}</span>
            </div>

            <div className="h-3 w-px bg-slate-700 hidden sm:block" />

            {/* Separate-Tab Public Portal Direct Links */}
            <div className="flex items-center gap-2 font-medium">
              <span className="text-slate-400 hidden md:inline">Portals:</span>
              <a
                href="/admin/login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white hover:underline transition-colors px-1 inline-flex items-center gap-0.5 cursor-pointer"
                title="Open Administration Portal"
              >
                Admin
              </a>
              <span className="text-slate-600">|</span>
              <a
                href="/faculty/login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white hover:underline transition-colors px-1 inline-flex items-center gap-0.5 cursor-pointer"
                title="Open Faculty Academic Portal"
              >
                Faculty
              </a>
              <span className="text-slate-600">|</span>
              <a
                href="/student/login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-white font-semibold hover:underline transition-colors px-1 inline-flex items-center gap-0.5 cursor-pointer"
                title="Open Student Result Portal"
              >
                Student
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Institutional Masthead Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        {/* Left: Official College Seal + Institutional Identity */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3.5 sm:gap-5 cursor-pointer group"
        >
          <CollegeLogo size={68} className="shrink-0" />
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {config.collegeNameRegional}
            </p>
            <h1 className="text-lg sm:text-2xl font-serif font-bold text-[#0F2F57] tracking-tight leading-tight group-hover:text-blue-900 transition-colors">
              {config.collegeName}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5 leading-snug">
              {config.affiliation} • {config.establishedYear ? `Established ${config.establishedYear}` : ''}
            </p>
          </div>
        </div>

        {/* Right: Integrated Academic Portal Quick Access Button */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <a
              href={getDashboardUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 bg-[#0F2F57] hover:bg-[#153e70] text-white rounded-sm text-xs font-semibold tracking-wide shadow-xs transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-blue-200" />
              <span>Open {role === 'admin' ? 'Admin' : role === 'faculty' ? 'Faculty' : 'Student'} Dashboard ↗</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </a>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0F2F57] hover:bg-[#153e70] text-white rounded-sm text-xs font-semibold tracking-wide shadow-xs transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-blue-200" />
                <span>Academic Portals</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              </button>

              {/* Portal Dropdown Menu (Opens in safe separate tabs) */}
              {portalDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-300 shadow-lg z-50 py-1 rounded-sm divide-y divide-slate-100">
                  <div className="px-3 py-2 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Open Portal
                  </div>
                  <a
                    href="/admin/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-xs text-slate-800 flex items-center gap-2.5 cursor-pointer block"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Administration Portal ↗</p>
                      <p className="text-[10px] text-slate-500">Dean, COE & Academic Registrar</p>
                    </div>
                  </a>
                  <a
                    href="/faculty/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-xs text-slate-800 flex items-center gap-2.5 cursor-pointer block"
                  >
                    <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Faculty Academic Portal ↗</p>
                      <p className="text-[10px] text-slate-500">Professors & Evaluators</p>
                    </div>
                  </a>
                  <a
                    href="/student/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-xs text-slate-800 flex items-center gap-2.5 cursor-pointer block"
                  >
                    <User className="w-4 h-4 text-[#1E40AF] shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Student Result Portal ↗</p>
                      <p className="text-[10px] text-slate-500">Marks, Attendance & Transcripts</p>
                    </div>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-sm"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. Primary Institutional Navigation Bar (Navy Blue) */}
      <nav className="bg-[#0F2F57] text-white border-t border-[#1E40AF]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2.5 text-xs font-medium tracking-wide transition-colors cursor-pointer border-b-2 ${
                    isActive
                      ? 'border-white text-white font-semibold bg-[#153e70]'
                      : 'border-transparent text-slate-200 hover:text-white hover:bg-[#153e70]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Right: Quick Notice Flash indicator */}
          <div className="hidden xl:flex items-center text-[11px] text-blue-200 gap-1.5 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-medium text-slate-200">Official Portal Active:</span>
            <span>Nov/Dec 2026 Results Declared</span>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A192F] border-t border-slate-800 px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3 py-2 text-xs rounded-sm ${
                  activeSection === link.id
                    ? 'bg-blue-900 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 border-t border-slate-800 mt-2 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
                Academic Portals
              </p>
              <a
                href="/admin/login"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 block"
              >
                Administration Portal ↗
              </a>
              <a
                href="/faculty/login"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 block"
              >
                Faculty Portal ↗
              </a>
              <a
                href="/student/login"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-left px-3 py-2 text-xs text-blue-300 font-semibold hover:bg-slate-800 block"
              >
                Student Portal ↗
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
