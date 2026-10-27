import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import DashboardView from './components/views/DashboardView';
import StudentsView from './components/views/StudentsView';
import MarksheetView from './components/views/MarksheetView';
import RiskAnalysisView from './components/views/RiskAnalysisView';
import FacultyPortalView from './components/views/FacultyPortalView';
import UploadView from './components/views/UploadView';
import AdminSettingsView from './components/views/AdminSettingsView';
import StudentProfileView from './components/views/StudentProfileView';
import LoginView from './components/views/LoginView';

function MainApp() {
  const { isAuthenticated, role, user } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [targetStudentForMarksheet, setTargetStudentForMarksheet] = useState({ id: 1, sem: 3 });

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleGlobalSearch = (term) => {
    setGlobalSearch(term);
    if (term.trim() && currentTab !== 'students') {
      setCurrentTab('students');
    }
  };

  const handleSelectStudentForMarksheet = (studentId, semester) => {
    setTargetStudentForMarksheet({ id: studentId, sem: semester || 3 });
    setCurrentTab('results');
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'students':
        if (role === 'student') return <StudentProfileView onSelectStudentForMarksheet={handleSelectStudentForMarksheet} />;
        return (
          <StudentsView
            globalSearch={globalSearch}
            onSelectStudentForMarksheet={handleSelectStudentForMarksheet}
          />
        );
      case 'marks':
      case 'attendance':
        if (role === 'student') return <StudentProfileView onSelectStudentForMarksheet={handleSelectStudentForMarksheet} />;
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
        if (role === 'student') return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
        return <UploadView />;
      case 'settings':
        if (role !== 'admin') return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
        return <AdminSettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50/80 text-slate-900 bg-campus-pattern">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onSearchChange={handleGlobalSearch} searchTerm={globalSearch} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
