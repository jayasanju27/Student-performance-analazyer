import React from 'react';
import CollegeLogo from '../common/CollegeLogo';
import { getCollegeConfig } from '../../config/collegeConfig';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export default function CollegeFooter({ onNavigate }) {
  const config = getCollegeConfig();

  const handlePortalLink = (portalPath) => {
    if (onNavigate) onNavigate(portalPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0A192F] text-slate-300 border-t-4 border-[#0F2F57] text-xs select-none">
      {/* Upper Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Col 1: Institutional Identity & Address (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <CollegeLogo size={52} variant="light" className="shrink-0" />
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-white leading-snug">
                {config.collegeName}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {config.affiliation}
              </p>
            </div>
          </div>

          <p className="text-slate-400 leading-relaxed text-[11px]">
            An autonomous engineering institution committed to rigorous academic evaluation, continuous student assessment, and research-led technical education.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                {config.campusAddress}, {config.city}, {config.state} - {config.pincode}, {config.country}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>General: {config.phoneGeneral}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Registrar: {config.emailGeneral}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{config.officeHours}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Academic & Examination Cell (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-800">
            Examinations & COE
          </h3>
          <ul className="space-y-2 text-slate-400 text-[11px]">
            <li>
              <button
                onClick={() => onNavigate && onNavigate('examinations')}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                <span>Office of Controller of Examinations</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('results')}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                <span>Semester Examination Results</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('notices')}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                <span>Revaluation & Retotaling Rules</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('academics')}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                <span>Grading Scale & CBCS Regulations</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate && onNavigate('notices')}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                <span>Standing Arrears Policy</span>
              </button>
            </li>
          </ul>

          <div className="pt-2 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300">Examination Helpdesk:</p>
            <p>{config.phoneExamCell}</p>
            <p>Email: {config.emailExamCell}</p>
          </div>
        </div>

        {/* Col 3: Statutory & Institutional Disclosures (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-800">
            Statutory & Quality Cells
          </h3>
          <ul className="space-y-2 text-slate-400 text-[11px]">
            <li className="flex items-center gap-1.5 hover:text-white cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
              <span>AICTE Mandatory Disclosure (Form 1)</span>
            </li>
            <li className="flex items-center gap-1.5 hover:text-white cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
              <span>National Institutional Ranking (NIRF)</span>
            </li>
            <li className="flex items-center gap-1.5 hover:text-white cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
              <span>NAAC Self Study Report & Grade Card</span>
            </li>
            <li className="flex items-center gap-1.5 hover:text-white cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
              <span>Anti-Ragging Committee & Affidavit</span>
            </li>
            <li className="flex items-center gap-1.5 hover:text-white cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
              <span>Internal Complaints Committee (ICC)</span>
            </li>
            <li className="flex items-center gap-1.5 hover:text-white cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
              <span>Right to Information (RTI Act) Cell</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Academic Portals Access (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-800">
            Academic Portals
          </h3>
          <div className="space-y-2">
            <a
              href="/admin/login"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-sm text-[11px] text-slate-300 hover:text-white transition-colors block cursor-pointer"
            >
              <p className="font-semibold text-white">Administration Portal ↗</p>
              <p className="text-[10px] text-slate-500">Dean, COE & Registrar</p>
            </a>

            <a
              href="/faculty/login"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-sm text-[11px] text-slate-300 hover:text-white transition-colors block cursor-pointer"
            >
              <p className="font-semibold text-white">Faculty Portal ↗</p>
              <p className="text-[10px] text-slate-500">Marks, IA & Attendance</p>
            </a>

            <a
              href="/student/login"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-blue-900/60 rounded-sm text-[11px] text-blue-300 hover:text-white transition-colors block cursor-pointer"
            >
              <p className="font-semibold text-white">Student Portal ↗</p>
              <p className="text-[10px] text-blue-400">Results & Marksheets</p>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="bg-[#071324] border-t border-slate-800/80 py-4 px-4 sm:px-8 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} {config.collegeName}. All Rights Reserved. • Integrated Academic Management & Result Analyzer
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Website Policy</span>
            <span>•</span>
            <span>Privacy & Data Protection</span>
            <span>•</span>
            <span>Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
