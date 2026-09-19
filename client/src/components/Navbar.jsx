import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  ShieldAlert, 
  FileText, 
  PlusCircle, 
  BarChart3, 
  History, 
  Users, 
  LogOut, 
  Layers, 
  AlertOctagon,
  UserCheck
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, role, logout, switchRole } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Quick Demo Switcher Bar for FYP Defense / Demonstration */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-semibold uppercase tracking-wider text-[10px]">FYP Presentation Mode</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">1-Click Role Switcher:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            onClick={() => switchRole('student')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
              role === 'student' ? 'bg-indigo-600 text-white font-bold shadow' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            👨‍🎓 Student (Alice)
          </button>
          <button
            onClick={() => switchRole('it-staff')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
              role === 'staff' && user?.department_code === 'ITS' ? 'bg-indigo-600 text-white font-bold shadow' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            🛠️ IT Staff (Marcus)
          </button>
          <button
            onClick={() => switchRole('facility-staff')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
              role === 'staff' && user?.department_code === 'FCM' ? 'bg-indigo-600 text-white font-bold shadow' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            🏢 Facility Staff (Robert)
          </button>
          <button
            onClick={() => switchRole('admin')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
              role === 'admin' ? 'bg-amber-600 text-white font-bold shadow' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            🏛️ Admin (Dean)
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">UCMS</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  {role === 'admin' ? 'Admin Portal' : role === 'staff' ? `${user?.department_code || 'Staff'} Portal` : 'Student Portal'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none hidden sm:block">
                University Complaint Management & Resolution System
              </p>
            </div>
          </div>

          {/* Role Navigation Items */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {role === 'student' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>My Complaints</span>
                </button>
                <button
                  onClick={() => setActiveTab('new-complaint')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'new-complaint' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>File Complaint</span>
                </button>
              </>
            )}

            {role === 'staff' && (
              <>
                <button
                  onClick={() => setActiveTab('staff-inbox')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'staff-inbox' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Department Inbox</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Department Metrics</span>
                </button>
              </>
            )}

            {role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('admin-tickets')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'admin-tickets' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>All Tickets</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('departments')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'departments' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Departments & Staff</span>
                </button>
                <button
                  onClick={() => setActiveTab('audit-logs')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'audit-logs' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Audit Trail</span>
                </button>
              </>
            )}

            {/* User Profile & Logout */}
            <div className="flex items-center pl-3 border-l border-slate-200 ml-2 gap-2">
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {role === 'student' ? user?.student_id || 'Student' : user?.email}
                </p>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
