import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { NewComplaint } from './pages/NewComplaint';
import { ComplaintDetails } from './pages/ComplaintDetails';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { DepartmentManagePage } from './pages/DepartmentManagePage';

const AppContent = () => {
  const { isAuthenticated, role, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Set default tab on role changes
  useEffect(() => {
    if (role === 'student') {
      setActiveTab('dashboard');
    } else if (role === 'staff') {
      setActiveTab('staff-inbox');
    } else if (role === 'admin') {
      setActiveTab('admin-tickets');
    }
    setSelectedComplaintId(null);
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Initializing UCMS Platform...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedComplaintId(null);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedComplaintId ? (
          <ComplaintDetails
            complaintId={selectedComplaintId}
            onBack={() => setSelectedComplaintId(null)}
          />
        ) : (
          <>
            {/* Student Views */}
            {role === 'student' && (
              <>
                {activeTab === 'dashboard' && (
                  <StudentDashboard
                    onSelectComplaint={(id) => setSelectedComplaintId(id)}
                    onNewComplaint={() => setActiveTab('new-complaint')}
                  />
                )}
                {activeTab === 'new-complaint' && (
                  <NewComplaint
                    onCancel={() => setActiveTab('dashboard')}
                    onSuccess={(ticket) => {
                      setSelectedComplaintId(ticket.id);
                    }}
                  />
                )}
              </>
            )}

            {/* Staff Views */}
            {role === 'staff' && (
              <>
                {activeTab === 'staff-inbox' && (
                  <StaffDashboard
                    onSelectComplaint={(id) => setSelectedComplaintId(id)}
                  />
                )}
                {activeTab === 'analytics' && <AnalyticsPage />}
              </>
            )}

            {/* Admin Views */}
            {role === 'admin' && (
              <>
                {activeTab === 'admin-tickets' && (
                  <AdminDashboard
                    onSelectComplaint={(id) => setSelectedComplaintId(id)}
                  />
                )}
                {activeTab === 'analytics' && <AnalyticsPage />}
                {activeTab === 'departments' && <DepartmentManagePage />}
                {activeTab === 'audit-logs' && <AuditLogsPage />}
              </>
            )}
          </>
        )}
      </main>

      {/* University Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">
              University Complaint Management & Resolution System (UCMS)
            </p>
            <p className="text-[11px] text-slate-400">
              Final Year Project Proposal Implementation | Computer Science & Software Engineering
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Role-Based Access Control</span>
            <span>•</span>
            <span>48h SLA Engine</span>
            <span>•</span>
            <span>Immutable Audit Trail</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
