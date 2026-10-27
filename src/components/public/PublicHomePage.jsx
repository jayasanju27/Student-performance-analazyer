import React, { useState } from 'react';
import CollegeLogo from '../common/CollegeLogo';
import { getCollegeConfig } from '../../config/collegeConfig';
import campusHeroImg from '../../assets/campus_hero.jpg';
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  User,
  ArrowRight,
  Calendar,
  Bell,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  Phone,
  Mail,
  MapPin,
  Building,
  Award,
  Users,
  Search,
  BookMarked,
  Printer,
  X
} from 'lucide-react';

export default function PublicHomePage({ onNavigate, activeSection }) {
  const config = getCollegeConfig();
  const [selectedNoticeTab, setSelectedNoticeTab] = useState('All');
  const [searchNotice, setSearchNotice] = useState('');
  const [selectedNoticeForModal, setSelectedNoticeForModal] = useState(null);
  const [showAllDepartments, setShowAllDepartments] = useState(false);

  const handleDownloadCircular = (notice) => {
    const content = `========================================================================
INFO INSTITUTE OF ENGINEERING (AUTONOMOUS)
Approved by AICTE, New Delhi & Permanently Affiliated to Anna University
NH-209, Sathy Road, Kovilpalayam, Coimbatore - 641 107
OFFICE OF THE CONTROLLER OF EXAMINATIONS
========================================================================
Circular Ref. No: ${notice.refNo}
Date of Release:  ${notice.date}
Category:         ${notice.category}

SUBJECT: ${notice.title}

DETAILS & STATUTORY ADVISORY:
${notice.summary}

ADDITIONAL INSTRUCTIONS:
1. All Heads of Departments, Faculty, and candidates are requested to note the above notification.
2. For marksheet verification or grievances, please log in to the respective Academic Portal.
3. This circular is issued under the authority of the Controller of Examinations and Dean of Academic Affairs.

By Order,
Dr. M. Senthil Kumar, Ph.D.
Controller of Examinations
INFO Institute of Engineering, Coimbatore
========================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IIE_Circular_${notice.refNo.replace(/\//g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [customHeroImg, setCustomHeroImg] = useState(() => {
    return localStorage.getItem('iie_custom_hero_image') || null;
  });

  const handleHeroImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        setCustomHeroImg(dataUrl);
        localStorage.setItem('iie_custom_hero_image', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredNotices = config.notices.filter((n) => {
    const matchesTab = selectedNoticeTab === 'All' || n.category === selectedNoticeTab;
    const matchesSearch =
      searchNotice === '' ||
      n.title.toLowerCase().includes(searchNotice.toLowerCase()) ||
      n.refNo.toLowerCase().includes(searchNotice.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const visibleDepartments = showAllDepartments ? config.departments : config.departments.slice(0, 3);

  return (
    <div className="w-full bg-slate-50 text-slate-800 font-sans">
      {/* 1. Official Announcement Ticker */}
      <div className="bg-[#0F2F57] text-white border-b border-[#1E40AF]/40 py-2 px-4 sm:px-8 text-xs select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 bg-red-600 text-white font-bold text-[10px] uppercase rounded-xs tracking-wider animate-pulse">
              ANNOUNCEMENT
            </span>
            <span className="font-semibold text-slate-200 hidden sm:inline">Notice:</span>
          </div>

          <div className="flex-1 overflow-hidden whitespace-nowrap text-[11px] sm:text-xs text-slate-200">
            <span className="inline-block">
              {config.notices[0]?.title} • Ref: {config.notices[0]?.refNo} • Published on {config.notices[0]?.date}. Official marksheet verification and result download active on Student Portal.
            </span>
          </div>

          <button
            onClick={() => onNavigate('/student/login')}
            className="shrink-0 text-[11px] font-semibold text-blue-200 hover:text-white underline hidden md:inline cursor-pointer"
          >
            Check Result →
          </button>
        </div>
      </div>

      {/* 2. Campus Hero Banner & Academic Welcome */}
      <section id="home" className="relative bg-[#0A192F] text-white overflow-hidden border-b border-slate-300 min-h-[520px] lg:min-h-[580px] flex items-center">
        {/* Actual College Building Photograph */}
        <div className="absolute inset-0 z-0">
          <img
            src={customHeroImg || campusHeroImg}
            alt="INFO Institute of Engineering Coimbatore - Main Academic Building"
            className="w-full h-full object-cover object-[center_35%] filter brightness-[0.88] contrast-[1.05]"
          />
          {/* Subtle readable dark scrim - keeps the building clearly visible while ensuring text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F]/92 via-[#0A192F]/65 to-[#0A192F]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/90 via-transparent to-black/25" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20 lg:py-24 w-full">
          <div className="max-w-3xl space-y-5">
            {/* Regulatory Seal Badge & Verified Campus Location */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs border border-white/20 text-slate-200 text-xs font-semibold rounded-xs">
                <Award className="w-3.5 h-3.5 text-blue-300" />
                <span>{config.approvals}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-xs border border-white/15 text-slate-300 text-[10px] rounded-xs">
                <Building className="w-3 h-3 text-blue-300" />
                <span>Campus: NH-209 Kovilpalayam, Coimbatore</span>
                <label className="ml-2 text-blue-300 hover:text-white cursor-pointer underline text-[10px]">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    className="hidden"
                  />
                </label>
                {customHeroImg && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomHeroImg(null);
                      localStorage.removeItem('iie_custom_hero_image');
                    }}
                    className="ml-1 text-red-300 hover:text-white"
                  >
                    ✕ Reset
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              {config.collegeName}
            </h1>

            <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed max-w-2xl">
              {config.welcomeMessage}
            </p>

            {/* Quick Action Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="/student/login"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#1E40AF] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xs tracking-wider uppercase transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Check Semester Results ↗</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => onNavigate('#services')}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-semibold rounded-xs tracking-wide transition-colors cursor-pointer"
              >
                Academic Services ↓
              </button>

              <button
                onClick={() => onNavigate('#about')}
                className="px-4 py-3 bg-transparent hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                About Institution ↓
              </button>
            </div>

            {/* Institutional Meta Strip */}
            <div className="pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">TNEA Code</p>
                <p className="font-bold text-white mt-0.5">2732</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Affiliation</p>
                <p className="font-bold text-white mt-0.5">Anna University</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Academic Session</p>
                <p className="font-bold text-white mt-0.5">{config.academicYear}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Grading Model</p>
                <p className="font-bold text-white mt-0.5">CBCS 10-Point Scale</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 About INFO Institute of Engineering & Verified Campus Infrastructure */}
      <section id="about" className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left 6 cols: Institutional Profile */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F2F57] bg-slate-100 px-3 py-1 border border-slate-200 rounded-xs">
                INSTITUTIONAL PROFILE • ESTABLISHED 2007
              </span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#0F2F57] tracking-tight leading-tight">
                About INFO Institute of Engineering
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                INFO Institute of Engineering (IIE) is an autonomous engineering institution situated on the national highway NH-209 (Sathy Road), Kovilpalayam, Coimbatore. Established in 2007 by the INFO Educational Trust, the college is approved by the All India Council for Technical Education (AICTE), New Delhi, and permanently affiliated with Anna University, Chennai.
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                Accredited by NAAC with prestigious standing and certified under ISO 9001:2015, the institution has earned a sterling reputation for rigorous academic standards, continuous evaluation models, research innovation, and exceptional placement records in premier technological enterprises.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-slate-50 p-3 border border-slate-200 rounded-xs">
                  <p className="font-bold text-[#0F2F57] text-sm">Autonomous</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Choice Based Credit System (CBCS) curriculum under Anna University regulations.</p>
                </div>
                <div className="bg-slate-50 p-3 border border-slate-200 rounded-xs">
                  <p className="font-bold text-[#0F2F57] text-sm">TNEA Code 2732</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Tamil Nadu Engineering Admissions single-window counselling code.</p>
                </div>
                <div className="bg-slate-50 p-3 border border-slate-200 rounded-xs">
                  <p className="font-bold text-[#0F2F57] text-sm">NAAC & ISO</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Accredited by National Assessment & Accreditation Council & ISO 9001:2015.</p>
                </div>
                <div className="bg-slate-50 p-3 border border-slate-200 rounded-xs">
                  <p className="font-bold text-[#0F2F57] text-sm">AICTE Approved</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">All undergraduate and postgraduate programmes approved by AICTE, New Delhi.</p>
                </div>
              </div>
            </div>

            {/* Right 6 cols: Genuine Campus Infrastructure Gallery from infoengg.com */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F2F57]">
                    Campus Infrastructure Gallery
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official photographs from INFO Institute of Engineering campus gallery
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-xs">
                  NH-209 Coimbatore
                </span>
              </div>

              {/* Verified Campus Photos Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-xs overflow-hidden bg-slate-50 group">
                  <div className="h-32 sm:h-36 overflow-hidden">
                    <img
                      src="/building-3.jpg"
                      alt="Campus Main Entrance Arch"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 bg-white border-t border-slate-200">
                    <p className="font-semibold text-[11px] text-slate-800">Grand Entrance Arch</p>
                    <p className="text-[10px] text-slate-500">NH-209 Highway Campus Gateway</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xs overflow-hidden bg-slate-50 group">
                  <div className="h-32 sm:h-36 overflow-hidden">
                    <img
                      src="/building-11.jpg"
                      alt="Departmental Block with INFO sign"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 bg-white border-t border-slate-200">
                    <p className="font-semibold text-[11px] text-slate-800">E-Block & Department Wing</p>
                    <p className="text-[10px] text-slate-500">Electronics & Computing Block</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xs overflow-hidden bg-slate-50 group">
                  <div className="h-32 sm:h-36 overflow-hidden">
                    <img
                      src="/building-6.jpg"
                      alt="Central Academic Quadrangle"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 bg-white border-t border-slate-200">
                    <p className="font-semibold text-[11px] text-slate-800">Central Quadrangle</p>
                    <p className="text-[10px] text-slate-500">Academic Wing & Open Courtyard</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xs overflow-hidden bg-slate-50 group">
                  <div className="h-32 sm:h-36 overflow-hidden">
                    <img
                      src="/building-14.jpg"
                      alt="Transit Fleet and Campus Boulevard"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 bg-white border-t border-slate-200">
                    <p className="font-semibold text-[11px] text-slate-800">Campus Boulevard & Fleet</p>
                    <p className="text-[10px] text-slate-500">Coimbatore District Transit Network</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.7 Clean Academic Services Section */}
      <section id="services" className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F2F57] bg-slate-100 px-3 py-1 border border-slate-200 rounded-xs">
              OFFICE OF ACADEMIC AFFAIRS
            </span>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#0F2F57] mt-2 tracking-tight">
              Academic Services & Digital Desks
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Direct institutional access to student self-service portals, faculty academic instruction, continuous evaluations, university grading, and examination schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1: Examination Results */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xs hover:border-[#0F2F57] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-blue-50 border border-blue-200 text-[#1E40AF] rounded-xs flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-blue-900 transition-colors">
                  Examination Results & Marksheets
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Controller of Examinations verified semester grade cards, subject-wise credits, internal marks, and cumulative CGPA.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onNavigate('#results')}
                  className="text-xs font-semibold text-[#0F2F57] hover:underline cursor-pointer"
                >
                  View Details Below ↓
                </button>
                <a
                  href="/student/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#1E40AF] hover:underline inline-flex items-center gap-1"
                >
                  <span>Student Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Service 2: Student Portal */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xs hover:border-[#0F2F57] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-blue-50 border border-blue-200 text-[#1E40AF] rounded-xs flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-blue-900 transition-colors">
                  Student Academic Portal
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Personal scholar dashboard with attendance monitoring (75% rule), IA-1 & IA-2 assessments, standing arrears, and printable marksheets.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">Route: /student/login</span>
                <a
                  href="/student/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#1E40AF] hover:bg-blue-800 text-white text-xs font-bold rounded-xs transition-colors inline-flex items-center gap-1"
                >
                  <span>Launch Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Service 3: Faculty Portal */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xs hover:border-[#0F2F57] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-slate-100 border border-slate-300 text-[#0F2F57] rounded-xs flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-[#0F2F57] transition-colors">
                  Faculty Academic Portal
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Assigned class rosters, Continuous Assessment (CIA) marks entry, lecture attendance recording, and academic support alerts.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">Route: /faculty/login</span>
                <a
                  href="/faculty/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#0F2F57] hover:bg-[#153e70] text-white text-xs font-bold rounded-xs transition-colors inline-flex items-center gap-1"
                >
                  <span>Launch Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Service 4: Academic Calendar */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xs hover:border-[#0F2F57] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-slate-100 border border-slate-300 text-[#0F2F57] rounded-xs flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-[#0F2F57] transition-colors">
                  Academic Calendar & Schedule
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Approved session schedules, working day counts, CIA assessment timetables, practical test periods, and semester exam commencement.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{config.academicYear}</span>
                <button
                  type="button"
                  onClick={() => onNavigate('#academics')}
                  className="text-xs font-bold text-[#0F2F57] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>View Milestones ↓</span>
                </button>
              </div>
            </div>

            {/* Service 5: Circulars & Notices */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xs hover:border-[#0F2F57] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-slate-100 border border-slate-300 text-[#0F2F57] rounded-xs flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-[#0F2F57] transition-colors">
                  Official Notices & Circulars
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Official university notifications, examination memos, revaluation windows, and statutory academic council advisories.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Published: COE Office</span>
                <button
                  type="button"
                  onClick={() => onNavigate('#notices')}
                  className="text-xs font-bold text-[#0F2F57] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Browse Circulars ↓</span>
                </button>
              </div>
            </div>

            {/* Service 6: Administration Portal */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xs hover:border-[#0F2F57] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-slate-100 border border-slate-300 text-[#0F2F57] rounded-xs flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-[#0F2F57] transition-colors">
                  Administration ERP Portal
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Authorized access for Dean, Controller of Examinations & Academic Registrar for student/faculty masters, grading models, and reports.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">Route: /admin/login</span>
                <a
                  href="/admin/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#0F2F57] hover:bg-[#153e70] text-white text-xs font-bold rounded-xs transition-colors inline-flex items-center gap-1"
                >
                  <span>Admin Login</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Clearly Visible “Academic Portal Login” Section */}
      <section id="portals" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F2F57] bg-white px-3 py-1 border border-slate-200 rounded-xs">
              SECURE INSTITUTIONAL AUTHENTICATION
            </span>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#0F2F57] mt-3 tracking-tight">
              Academic ERP & Examination Portals
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Authorized university entry points for institutional administration, faculty academic evaluation, and student result analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gateway 1: Administration Portal */}
            <div className="bg-white border border-slate-300 rounded-xs p-6 shadow-xs hover:border-[#0F2F57] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-slate-100 border border-slate-200 text-[#0F2F57] rounded-xs flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-serif font-bold text-base text-slate-900">Administration Portal</h3>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xs">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Dean, Controller of Examinations & Academic Registrar
                </p>
                <ul className="space-y-1.5 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Student & Faculty master management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Department, subject & credit catalog</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>CBCS grading scale configuration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>University PDF & CSV mark ingestion hub</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Audit history and institutional reports</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 mb-2">Access: Administrator email</p>
                <a
                  href="/admin/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#0F2F57] hover:bg-[#153e70] text-white text-xs font-bold rounded-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Sign In as Administrator ↗</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Gateway 2: Faculty Portal */}
            <div className="bg-white border border-slate-300 rounded-xs p-6 shadow-xs hover:border-[#0F2F57] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-slate-100 border border-slate-200 text-[#0F2F57] rounded-xs flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-serif font-bold text-base text-slate-900">Faculty Academic Portal</h3>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xs">
                    Faculty
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Professors, Course Instructors & Department Faculty
                </p>
                <ul className="space-y-1.5 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Assigned courses & lecture rosters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Continuous Assessment (IA-1 & IA-2) entry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Lecture attendance logging & shortage alert</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Students requiring academic support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Class progression and arrear records</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 mb-2">Access: Employee code or email</p>
                <a
                  href="/faculty/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#0F2F57] hover:bg-[#153e70] text-white text-xs font-bold rounded-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Sign In as Faculty ↗</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Gateway 3: Student Portal */}
            <div className="bg-white border-2 border-[#1E40AF] rounded-xs p-6 shadow-xs hover:border-[#1E40AF] transition-all flex flex-col justify-between group relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-[#1E40AF] text-white text-[10px] font-bold uppercase tracking-wider rounded-xs">
                PRIMARY PORTAL
              </div>

              <div>
                <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-[#1E40AF] rounded-xs flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-serif font-bold text-base text-slate-900">Student Result Portal</h3>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-blue-100 text-[#1E40AF] border border-blue-200 rounded-xs">
                    Student
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Undergraduate & Postgraduate Enrolled Scholars
                </p>
                <ul className="space-y-1.5 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
                    <span>Personal scholar record & Roll Number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
                    <span>Official semester results & grade statements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
                    <span>Subject-wise internal (CIA) & external marks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
                    <span>Semester SGPA, CGPA & academic progress</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
                    <span>Download & print official university marksheets</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-[11px] text-[#1E40AF] font-medium mb-2">Access: Roll No</p>
                <a
                  href="/student/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#1E40AF] hover:bg-blue-800 text-white text-xs font-bold rounded-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Sign In to Student Portal ↗</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Result & Academic Performance Analyzer Spotlight */}
      <section id="results" className="py-12 sm:py-16 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left 7 cols: Academic Result System Overview */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F2F57]">
                CORE ACADEMIC PERFORMANCE SYSTEM
              </span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#0F2F57] tracking-tight leading-tight">
                Institutional Result Evaluation & Academic Analytics
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The institution follows an autonomous Choice Based Credit System (CBCS) with a continuous, dual-component evaluation model ensuring high academic transparency, rigorous internal assessments, and automated university result publication.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 border border-slate-200 rounded-xs">
                  <h4 className="font-bold text-xs text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Continuous Internal Assessment (CIA) - 30%
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Evaluated via two centralized assessment tests (IA-1 & IA-2, max 50 marks each), converted systematically to 30 marks.
                  </p>
                </div>

                <div className="bg-white p-4 border border-slate-200 rounded-xs">
                  <h4 className="font-bold text-xs text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0F2F57]" />
                    End-Semester Examination (ESE) - 70%
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Centrally administered theory and laboratory university examinations with a minimum 40% cutoff in external paper.
                  </p>
                </div>

                <div className="bg-white p-4 border border-slate-200 rounded-xs">
                  <h4 className="font-bold text-xs text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    10-Point CBCS Grading Scale
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Grades O (10.0), A+ (9.0), A (8.0), B+ (7.0), B (6.0), C (5.0), and F (0.0) calculated strictly using credit weights.
                  </p>
                </div>

                <div className="bg-white p-4 border border-slate-200 rounded-xs">
                  <h4 className="font-bold text-xs text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    75% Mandatory Attendance Rule
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Attendance under 75% incurs exam debarment unless condoned by the Academic Council on medical grounds.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/student/login')}
                  className="px-4 py-2.5 bg-[#0F2F57] hover:bg-[#153e70] text-white text-xs font-semibold rounded-xs tracking-wide transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Access Student Marksheet Generator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right 5 cols: Official Marksheet Preview Card */}
            <div className="lg:col-span-5 bg-white border border-slate-300 p-6 shadow-sm rounded-xs space-y-4">
              <div className="text-center pb-3 border-b border-slate-200">
                <CollegeLogo size={44} className="mx-auto mb-1.5" />
                <h3 className="font-serif font-bold text-sm text-[#0F2F57] uppercase tracking-wide">
                  Official Statement of Marks & Grades
                </h3>
                <p className="text-[10px] text-slate-500">Autonomous Degree Transcript Sample Preview</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xs text-[11px] space-y-1 font-mono border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Register No:</span>
                  <span className="font-bold text-slate-900">REG2026CSE001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Candidate:</span>
                  <span className="font-bold text-slate-900">Aditya Verma</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Program:</span>
                  <span className="font-semibold text-slate-800">B.Tech Computer Science (Sem 3)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">SGPA / CGPA:</span>
                  <span className="font-bold text-emerald-700">8.95 / 8.82</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Result Status:</span>
                  <span className="font-bold text-emerald-700">PASS (FIRST CLASS WITH DISTINCTION)</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 space-y-1 leading-relaxed">
                <p>• Features secure Controller of Examinations watermark.</p>
                <p>• Formatted for official university printing and vector PDF export.</p>
                <p>• Only published and council-verified results appear on marksheets.</p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/student/login')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xs border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View My Full Statement →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Important Announcements & Examination Notifications */}
      <section id="notices" className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F2F57]">
                OFFICE OF THE REGISTRAR & COE
              </span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#0F2F57] mt-1 tracking-tight">
                Notices, Circulars & Examination Memos
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Official notifications released by the academic council and controller of examinations.
              </p>
            </div>

            {/* Notice Category Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['All', 'Results', 'Examinations', 'Academic', 'Compliance'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedNoticeTab(cat)}
                  className={`px-3 py-1.5 text-xs rounded-xs font-medium border transition-colors cursor-pointer ${
                    selectedNoticeTab === cat
                      ? 'bg-[#0F2F57] text-white border-[#0F2F57]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Official Notices Table */}
          <div className="border border-slate-300 rounded-xs overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0F2F57] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 border-r border-[#153e70] w-32">Date</th>
                  <th className="py-3 px-4 border-r border-[#153e70] w-40">Ref Number</th>
                  <th className="py-3 px-4 border-r border-[#153e70]">Subject / Notification Details</th>
                  <th className="py-3 px-3 text-center border-r border-[#153e70] w-28">Category</th>
                  <th className="py-3 px-4 text-center w-36">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredNotices.map((n, idx) => (
                  <tr key={n.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600 border-r border-slate-200">
                      {n.date}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 border-r border-slate-200">
                      {n.refNo}
                    </td>
                    <td className="py-3.5 px-4 border-r border-slate-200">
                      <div className="flex items-start gap-2">
                        {n.isNew && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-[9px] font-bold uppercase rounded-xs shrink-0 mt-0.5">
                            NEW
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 leading-snug">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.summary}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center border-r border-slate-200">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-xs border border-slate-200">
                        {n.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedNoticeForModal(n)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-[#0F2F57] hover:text-blue-800 hover:bg-blue-50 border border-slate-300 rounded-xs transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{n.downloadText}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Academic Departments & Programs */}
      <section id="departments" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F2F57]">
              SCHOOL OF ENGINEERING & TECHNOLOGY
            </span>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#0F2F57] mt-1 tracking-tight">
              Academic Departments & Degrees
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Undergraduate and postgraduate programs conducted under autonomous university regulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleDepartments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white border border-slate-300 rounded-xs p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                    <span className="font-mono font-bold text-xs bg-blue-50 text-[#0F2F57] px-2 py-1 border border-blue-200 rounded-xs">
                      Dept Code: {dept.code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">{dept.degree}</span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-slate-900 leading-snug mb-2">
                    {dept.name}
                  </h3>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {dept.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Approved Intake:</span>
                      <span className="font-semibold text-slate-800">{dept.intake} Students</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-semibold text-slate-800">{dept.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => onNavigate('/student/login')}
                    className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xs transition-colors cursor-pointer"
                  >
                    View Curriculum & Students →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {config.departments.length > 3 && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowAllDepartments((prev) => !prev)}
                className="px-4 py-2.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xs transition-colors cursor-pointer"
              >
                {showAllDepartments ? 'Show Less' : 'More Options'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 7. Academic Calendar & Key Dates + Statutory Student Links */}
      <section id="academics" className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left 7 cols: Academic Calendar Schedule */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F2F57]">
                  SCHEDULE OF EVENTS
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0F2F57] mt-1 tracking-tight">
                  Academic Calendar ({config.academicYear})
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Key milestones approved by the Academic Council for Odd Semester examinations.
                </p>
              </div>

              <div className="border border-slate-300 rounded-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#0F2F57] text-white text-[11px] font-bold uppercase">
                      <th className="py-2.5 px-4 border-r border-[#153e70]">Academic Event / Milestone</th>
                      <th className="py-2.5 px-4 border-r border-[#153e70] w-48">Scheduled Date</th>
                      <th className="py-2.5 px-3 text-center w-28">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {config.calendarSchedule.map((ev, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="py-2.5 px-4 font-medium text-slate-900 border-r border-slate-200">
                          {ev.event}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-700 border-r border-slate-200">
                          {ev.date}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                              ev.status === 'Completed'
                                ? 'bg-slate-100 text-slate-600'
                                : ev.status === 'Ongoing'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-[#0F2F57]'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 5 cols: Useful Student Links & Regulatory Cells */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F2F57]">
                  STUDENT SERVICES
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0F2F57] mt-1 tracking-tight">
                  Useful Academic & Statutory Links
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Access official regulations, grievance mechanisms and government depository cells.
                </p>
              </div>

              <div className="space-y-2.5">
                {config.studentLinks.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xs transition-colors flex items-start gap-3 cursor-pointer group"
                    onClick={() => {
                      if (item.title.includes('Controller of Examinations')) onNavigate('#examinations');
                      else if (item.title.includes('Curriculum')) onNavigate('#academics');
                      else alert(`Official Statutory Portal: ${item.title}\n\nCompliance records are maintained in the administrative cell.`);
                    }}
                  >
                    <BookMarked className="w-4 h-4 text-[#0F2F57] shrink-0 mt-0.5 group-hover:text-blue-700" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 self-center" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Office of Controller of Examinations (COE) Guidelines */}
      <section id="examinations" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-white border border-slate-300 rounded-xs p-6 sm:p-10 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4 mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F2F57]">
                  OFFICE OF THE CONTROLLER OF EXAMINATIONS
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0F2F57] mt-1 tracking-tight">
                  Autonomous University Examination Regulations
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controller of Examinations: {config.coeName} • {config.phoneExamCell}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/student/login')}
                  className="px-4 py-2 bg-[#0F2F57] hover:bg-[#153e70] text-white text-xs font-semibold rounded-xs tracking-wide transition-colors cursor-pointer"
                >
                  Verify Result Card
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">1. Passing Minimum</h4>
                <p className="leading-relaxed">
                  A candidate must secure a minimum of 40% in End-Semester Examination and 50% in aggregate (Internal + External combined) to be declared 'PASS' in each theory subject.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">2. Revaluation & Retotaling</h4>
                <p className="leading-relaxed">
                  Candidates seeking revaluation must submit the online request within 15 days from official result declaration. Answer script photocopy request is mandatory before revaluation.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">3. Arrear & Supplementary Exams</h4>
                <p className="leading-relaxed">
                  Standing arrears can be cleared during the subsequent semester examinations. Arrear results are incorporated into the cumulative CGPA engine upon clearance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Contact Us & Campus Directory */}
      <section id="contact" className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F2F57]">
              CAMPUS DIRECTORY
            </span>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#0F2F57] mt-1 tracking-tight">
              Administrative Office & Contact Information
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Reach out to university administrative blocks, examination desks, and grievance cells.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Building className="w-4 h-4 text-[#0F2F57]" />
                <span>Office of the Registrar</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Administrative Block, Ground Floor, Academic Corridor
              </p>
              <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-600">
                <p><strong>Phone:</strong> {config.phoneGeneral}</p>
                <p><strong>Email:</strong> {config.emailGeneral}</p>
                <p><strong>Hours:</strong> {config.officeHours}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Award className="w-4 h-4 text-[#0F2F57]" />
                <span>Controller of Examinations (COE)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Examination Wing, First Floor, Central Evaluation Center
              </p>
              <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-600">
                <p><strong>Helpline:</strong> {config.phoneExamCell}</p>
                <p><strong>Email:</strong> {config.emailExamCell}</p>
                <p><strong>Queries:</strong> 10:00 AM – 3:30 PM (Working days)</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Users className="w-4 h-4 text-[#0F2F57]" />
                <span>Student Welfare & Anti-Ragging</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Dean of Student Affairs Office, Student Amenities Center
              </p>
              <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-600">
                <p><strong>Emergency:</strong> +91 1800-180-5522 (National Toll Free)</p>
                <p><strong>Internal Desk:</strong> Ext. 312</p>
                <p><strong>Email:</strong> studentwelfare@college.edu.in</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Circular & Notification Viewer Modal */}
      {selectedNoticeForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-fadeIn">
          <div className="bg-white border border-slate-300 rounded-xs shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Institutional Crest & Header */}
            <div className="bg-[#0F2F57] text-white p-4 sm:p-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <CollegeLogo size={42} className="shrink-0" />
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base leading-tight">
                    {config.collegeName}
                  </h3>
                  <p className="text-[10px] text-blue-200 mt-0.5">
                    Autonomous • Affiliated to Anna University, Chennai • Coimbatore - 641 107
                  </p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-300 font-semibold mt-0.5">
                    OFFICE OF THE CONTROLLER OF EXAMINATIONS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNoticeForModal(null)}
                className="p-1 rounded-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close Notification"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-serif leading-relaxed text-slate-800 bg-slate-50/50">
              {/* Reference and Date Strip */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 text-xs font-mono font-semibold text-slate-600 gap-2">
                <div>Ref. No: <span className="text-[#0F2F57]">{selectedNoticeForModal.refNo}</span></div>
                <div>Dated: <span className="text-slate-800">{selectedNoticeForModal.date}</span></div>
                <div className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-xs text-[10px] font-sans">
                  {selectedNoticeForModal.category}
                </div>
              </div>

              {/* Subject */}
              <div className="bg-white p-3.5 border border-slate-200 rounded-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-sans">
                  SUBJECT
                </span>
                <p className="font-bold text-sm text-[#0F2F57] mt-0.5 font-sans leading-snug">
                  {selectedNoticeForModal.title}
                </p>
              </div>

              {/* Text / Summary */}
              <div className="bg-white p-4 border border-slate-200 rounded-xs space-y-3 font-sans text-xs text-slate-700 leading-relaxed">
                <p className="font-semibold text-slate-900">
                  STATUTORY NOTIFICATION & CIRCULAR:
                </p>
                <p>
                  {selectedNoticeForModal.summary}
                </p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <p>1. All Heads of Departments, Faculty, and candidates are requested to adhere to the aforementioned timeline.</p>
                  <p>2. For online marksheet lookup or grade review, kindly authenticate through the authorized Academic Portals.</p>
                  <p>3. Hard copies of the endorsed circular are dispatched to departmental notice boards.</p>
                </div>
              </div>

              {/* Official Signatory Box */}
              <div className="pt-4 flex items-end justify-between font-sans text-xs">
                <div className="text-[10px] text-slate-500">
                  <p>Verified by Examination Cell</p>
                  <p>Coimbatore - 641 107</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0F2F57]">Dr. M. Senthil Kumar, Ph.D.</p>
                  <p className="text-[11px] text-slate-600">Controller of Examinations</p>
                  <p className="text-[10px] text-slate-500">INFO Institute of Engineering</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 select-none">
              <span className="text-[11px] text-slate-500">
                Official Digital Copy • Verified Institutional Circular
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xs border border-slate-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Memo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadCircular(selectedNoticeForModal)}
                  className="px-3.5 py-1.5 bg-[#0F2F57] hover:bg-[#153e70] text-white text-xs font-bold rounded-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Circular (.txt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNoticeForModal(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
