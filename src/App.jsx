import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import InstitutionalLogin from './components/auth/InstitutionalLogin';
import ChangePasswordModal from './components/auth/ChangePasswordModal';
import PortalHeader from './components/portal/PortalHeader';
import PortalSidebar from './components/portal/PortalSidebar';
import AccessBarrier from './components/portal/AccessBarrier';
import CollegeLogo from './components/common/CollegeLogo';
import { ArrowLeft } from 'lucide-react';

// Academic ERP Modules
import DashboardView from './components/views/DashboardView';
import StudentsView from './components/views/StudentsView';
import MarksheetView from './components/views/MarksheetView';
import RiskAnalysisView from './components/views/RiskAnalysisView';
import FacultyPortalView from './components/views/FacultyPortalView';
import UploadView from './components/views/UploadView';
import AdminSettingsView from './components/views/AdminSettingsView';
import StudentProfileView from './components/views/StudentProfileView';
import StudentPortalView from './components/views/StudentPortalView';
import IAAssessmentView from './components/views/IAAssessmentView';
import UniversityPdfExtractorView from './components/views/UniversityPdfExtractorView';
import ArrearsTrackerView from './components/views/ArrearsTrackerView';
import ReportsView from './components/views/ReportsView';

function parseRouteFromLocation() {
  const path = window.location.pathname.toLowerCase();
  if (path === '/' || path === '/login' || path === '/admin/login' || path === '/faculty/login' || path === '/student/login') return 'login';
  if (path === '/admin/dashboard') return 'admin-dashboard';
  if (path === '/faculty/dashboard') return 'faculty-dashboard';
  if (path === '/student/dashboard') return 'student-dashboard';
  if (path.startsWith('/portal')) return 'portal';
  return 'login';
}

function getQueryTab() {
  const params = new URLSearchParams(window.location.search);
  return params.get('tab') || null;
}

function MainApp() {
  const { isAuthenticated, role, user, logout } = useAuth();

  const [currentRoute, setCurrentRoute] = useState(parseRouteFromLocation);

  const [currentPortalTab, setCurrentPortalTab] = useState(() => {
    const qTab = getQueryTab();
    if (qTab) return qTab;
    if (role === 'student') return 'dashboard';
    return 'dashboard';
  });

  const [globalSearch, setGlobalSearch] = useState('');
  const [targetStudentForMarksheet, setTargetStudentForMarksheet] = useState({ id: 1, sem: 3 });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminSidebarCollapsed, setAdminSidebarCollapsed] = useState(false);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);

  useEffect(() => {
    setPasswordChangeOpen(Boolean(role !== 'student' && user?.must_change_password));
  }, [role, user?.id, user?.must_change_password]);

  useEffect(() => {
    const loginPaths = ['/', '/login', '/admin/login', '/faculty/login', '/student/login'];
    if (currentRoute === 'login' && !loginPaths.includes(window.location.pathname.toLowerCase())) {
      window.history.replaceState({}, '', '/login');
    }
  }, [currentRoute]);

  // Dynamically update document title based on route & institutional branding
  useEffect(() => {
    const titles = {
        'login': 'Sign In | AcademIQ',
      'admin-login': 'Administrator Login | AcademIQ',
      'faculty-login': 'Faculty Login | AcademIQ',
      'student-login': 'Student Login | AcademIQ',
      'admin-dashboard': 'Administrative Dashboard | AcademIQ',
      'faculty-dashboard': 'Faculty Dashboard | AcademIQ',
      'student-dashboard': 'Student Portal | AcademIQ',
      'portal': 'Academic Portal | AcademIQ'
    };
    document.title = titles[currentRoute] || 'AcademIQ | Academic Performance Analyzer';
  }, [currentRoute]);

  // Adjust default tab when role updates
  useEffect(() => {
    const qTab = getQueryTab();
    if (qTab) {
      setCurrentPortalTab(qTab);
    } else if (role === 'student' && currentPortalTab === 'student-profile') {
      setCurrentPortalTab('dashboard');
    }
  }, [role]);

  // Handle convenience /portal route redirection
  useEffect(() => {
    if (currentRoute === 'portal') {
      if (!isAuthenticated) {
        setCurrentRoute('student-login');
        window.history.replaceState({}, '', '/student/login');
      } else {
        const targetRoute = `${role}-dashboard`;
        setCurrentRoute(targetRoute);
        window.history.replaceState({}, '', `/${role}/dashboard`);
      }
    }
  }, [currentRoute, isAuthenticated, role]);

  // Sync URL changes with Browser History (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRouteFromLocation();
      setCurrentRoute(route);
      const qTab = getQueryTab();
      if (qTab) {
        setCurrentPortalTab(qTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (destination) => {
    if (destination.startsWith('/admin/login') || destination.startsWith('/faculty/login') ||
        destination.startsWith('/student/login') || destination === '/login' ||
        destination === '/' || destination === 'home') {
      setCurrentRoute('login');
      window.history.pushState({}, '', '/login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (destination.startsWith('/admin/dashboard')) {
      setCurrentRoute('admin-dashboard');
      const qTab = new URLSearchParams(destination.split('?')[1] || '').get('tab');
      if (qTab) setCurrentPortalTab(qTab);
      window.history.pushState({}, '', destination);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (destination.startsWith('/faculty/dashboard')) {
      setCurrentRoute('faculty-dashboard');
      const qTab = new URLSearchParams(destination.split('?')[1] || '').get('tab');
      if (qTab) setCurrentPortalTab(qTab);
      window.history.pushState({}, '', destination);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (destination.startsWith('/student/dashboard')) {
      setCurrentRoute('student-dashboard');
      const qTab = new URLSearchParams(destination.split('?')[1] || '').get('tab');
      if (qTab) setCurrentPortalTab(qTab);
      window.history.pushState({}, '', destination);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (destination.startsWith('/portal')) {
      if (!isAuthenticated) {
        setCurrentRoute('login');
        window.history.pushState({}, '', '/login');
      } else {
        const dest = `/${role}/dashboard`;
        setCurrentRoute(`${role}-dashboard`);
        window.history.pushState({}, '', dest);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentRoute('login');
      window.history.pushState({}, '', '/login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectPortalTab = (tabId) => {
    setCurrentPortalTab(tabId);
    setMobileSidebarOpen(false);
    const basePath = window.location.pathname;
    if (basePath.includes('/dashboard')) {
      window.history.pushState({}, '', `${basePath}?tab=${tabId}`);
    }
  };

  const handleGlobalSearch = (term) => {
    setGlobalSearch(term);
    if (term.trim() && currentPortalTab !== 'students') {
      handleSelectPortalTab('students');
    }
  };

  const handleSelectStudentForMarksheet = (studentId, semester) => {
    setTargetStudentForMarksheet({ id: studentId, sem: semester || 3 });
    handleSelectPortalTab('results');
  };

  // Render Role-Authorized Portal View Component
  const renderPortalView = () => {
    if (role === 'student') {
      return <StudentPortalView activeTab={currentPortalTab} />;
    }
    switch (currentPortalTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => handleSelectPortalTab(tab)} />;
      case 'students':
        if (role === 'student') {
          return <StudentProfileView onSelectStudentForMarksheet={handleSelectStudentForMarksheet} />;
        }
        return (
          <StudentsView
            globalSearch={globalSearch}
            onSelectStudentForMarksheet={handleSelectStudentForMarksheet}
          />
        );
      case 'ia-assessment':
        return <IAAssessmentView />;
      case 'pdf-extractor':
        if (role === 'student') return <StudentProfileView onSelectStudentForMarksheet={handleSelectStudentForMarksheet} />;
        return <UniversityPdfExtractorView />;
      case 'arrears':
        return <ArrearsTrackerView />;
      case 'reports':
        if (role === 'student') return <StudentProfileView onSelectStudentForMarksheet={handleSelectStudentForMarksheet} />;
        return <ReportsView />;
      case 'marks':
      case 'attendance':
        if (role === 'student') {
          return <StudentProfileView onSelectStudentForMarksheet={handleSelectStudentForMarksheet} />;
        }
        return <FacultyPortalView />;
      case 'risk':
        return <RiskAnalysisView onSelectStudentForMarksheet={handleSelectStudentForMarksheet} />;
      case 'results':
        return (
          <MarksheetView
            defaultStudentId={role === 'student' ? user?.student_id : targetStudentForMarksheet.id}
            defaultSemester={targetStudentForMarksheet.sem}
          />
        );
      case 'student-profile':
        return <StudentProfileView onSelectStudentForMarksheet={handleSelectStudentForMarksheet} />;
      case 'upload':
        if (role === 'student') return <StudentProfileView onSelectStudentForMarksheet={handleSelectStudentForMarksheet} />;
        return <UploadView />;
      case 'settings':
        if (role !== 'admin') {
          return <DashboardView onNavigate={(tab) => handleSelectPortalTab(tab)} />;
        }
        return <AdminSettingsView />;
      default:
        return role === 'student' ? (
          <StudentProfileView onSelectStudentForMarksheet={handleSelectStudentForMarksheet} />
        ) : (
          <DashboardView onNavigate={(tab) => handleSelectPortalTab(tab)} />
        );
    }
  };

  // Dedicated Portal Layout Builder
  const renderAuthorizedPortal = (portalRoleName) => {
    if (portalRoleName === 'student') {
      const studentTabs = [
        { id: 'dashboard', label: 'My Overview' },
        { id: 'ia-assessment', label: 'My Internal Marks' },
        { id: 'results', label: 'My University Results' },
        { id: 'arrears', label: 'My Arrears' },
      ];
      return (
        <div className="portal-shell portal-student min-h-screen bg-[#F4F7FB] text-[#0F172A]" data-portal-role="student">
          <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white">
            <div className="student-topbar flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigateTo('/login');
                  }}
                  title="Back to login"
                  aria-label="Back to login"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <CollegeLogo size={40} className="rounded-lg bg-white p-1" />
                <div className="shrink-0">
                  <p className="text-base font-semibold text-white">AcademIQ</p>
                  <p className="text-sm text-slate-200">Student portal</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 sm:gap-3">
                <span className="hidden text-sm font-medium text-white sm:block">{user?.full_name}</span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigateTo('/login');
                  }}
                  className="rounded-lg border border-white/40 bg-white px-3 py-2 text-sm font-semibold text-[#13315C] hover:bg-slate-100 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
            <nav aria-label="Student portal" className="flex gap-1 overflow-x-auto border-t border-[#E2E8F0] px-4 sm:px-6 lg:px-8">
              {studentTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-current={currentPortalTab === tab.id ? 'page' : undefined}
                  onClick={() => handleSelectPortalTab(tab.id)}
                  className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    currentPortalTab === tab.id
                      ? 'border-[#1E3A5F] text-[#1E3A5F]'
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </header>
          <main className="mx-auto w-full max-w-[1280px] p-4 sm:p-6 lg:p-8">
            {renderPortalView()}
          </main>
          {passwordChangeOpen && (
            <ChangePasswordModal
              mandatory={Boolean(role !== 'student' && user?.must_change_password)}
              onClose={() => setPasswordChangeOpen(false)}
              onLogout={() => {
                logout();
                navigateTo('/login');
              }}
            />
          )}
          <footer className="mt-auto border-t border-[#DBE3EC] bg-white px-6 py-4 text-center text-sm text-slate-600">
            AcademIQ · Info Institute of Engineering
          </footer>
        </div>
      );
    }
    return (
      <div className={`portal-shell portal-admin min-h-screen flex bg-[#F4F7FB] text-slate-900 font-sans ${adminSidebarCollapsed && role === 'admin' ? 'sidebar-collapsed' : ''}`} data-portal-role={portalRoleName}>
        {/* Left: Role-Specific Institutional Sidebar */}
        <PortalSidebar
          currentTab={currentPortalTab}
          onSelectTab={handleSelectPortalTab}
          isOpen={mobileSidebarOpen}
          collapsed={adminSidebarCollapsed}
          onToggleCollapse={() => setAdminSidebarCollapsed((collapsed) => !collapsed)}
          onSignOut={() => {
            logout();
            navigateTo('/login');
          }}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Right: Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          <PortalHeader
            pageTitle={currentPortalTab === 'ia-assessment' ? 'IA Analyzer'
              : currentPortalTab === 'pdf-extractor' ? 'University Results'
                : currentPortalTab === 'student-profile' ? 'Student Profile'
                  : currentPortalTab.charAt(0).toUpperCase() + currentPortalTab.slice(1).replace('-', ' ')}
            onSearchChange={handleGlobalSearch}
            searchTerm={globalSearch}
            onMenuClick={() => setMobileSidebarOpen(true)}
            onChangePassword={() => setPasswordChangeOpen(true)}
            onBack={() => {
              logout();
              navigateTo('/login');
            }}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderPortalView()}
          </main>
          {passwordChangeOpen && (
            <ChangePasswordModal
              mandatory={Boolean(role !== 'student' && user?.must_change_password)}
              onClose={() => setPasswordChangeOpen(false)}
              onLogout={() => {
                logout();
                navigateTo('/login');
              }}
            />
          )}
          <footer className="mt-auto border-t border-[#DBE3EC] bg-white px-6 py-4 text-center text-sm text-slate-600">
            AcademIQ · Info Institute of Engineering
          </footer>
        </div>
      </div>
    );
  };

  // 1. Administration Portal Login Page (/admin/login)
  if (currentRoute === 'login' || currentRoute === 'admin-login' || currentRoute === 'faculty-login' || currentRoute === 'student-login') {
    return (
      <InstitutionalLogin
        portalRole="select"
        onNavigate={navigateTo}
      />
    );
  }

  // 4. Administration Dashboard Route (/admin/dashboard)
  if (currentRoute === 'admin-dashboard') {
    if (!isAuthenticated) {
      return (
        <InstitutionalLogin
          portalRole="select"
          onNavigate={navigateTo}
        />
      );
    }
    if (role !== 'admin') {
      return (
        <AccessBarrier
          targetRole="admin"
          currentRole={role}
          user={user}
          onNavigate={navigateTo}
          onLogout={logout}
        />
      );
    }
    return renderAuthorizedPortal('admin');
  }

  // 5. Faculty Dashboard Route (/faculty/dashboard)
  if (currentRoute === 'faculty-dashboard') {
    if (!isAuthenticated) {
      return (
        <InstitutionalLogin
          portalRole="select"
          onNavigate={navigateTo}
        />
      );
    }
    if (role !== 'faculty') {
      return (
        <AccessBarrier
          targetRole="faculty"
          currentRole={role}
          user={user}
          onNavigate={navigateTo}
          onLogout={logout}
        />
      );
    }
    return renderAuthorizedPortal('faculty');
  }

  // 6. Student Dashboard Route (/student/dashboard)
  if (currentRoute === 'student-dashboard') {
    if (!isAuthenticated) {
      return (
        <InstitutionalLogin
          portalRole="select"
          onNavigate={navigateTo}
        />
      );
    }
    if (role !== 'student') {
      return (
        <AccessBarrier
          targetRole="student"
          currentRole={role}
          user={user}
          onNavigate={navigateTo}
          onLogout={logout}
        />
      );
    }
    return renderAuthorizedPortal('student');
  }

  // 7. Legacy /portal fallback (if authenticated)
  if (currentRoute === 'portal' && isAuthenticated) {
    return renderAuthorizedPortal(role);
  }

  return <InstitutionalLogin portalRole="select" onNavigate={navigateTo} />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
