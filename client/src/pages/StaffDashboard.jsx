import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  Building2, 
  Search, 
  Filter, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Shield, 
  Star,
  RefreshCw
} from 'lucide-react';

export const StaffDashboard = ({ onSelectComplaint }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedOnly, setAssignedOnly] = useState(false);
  const [search, setSearch] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintAPI.getAll({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: search || undefined
      });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Failed to load department tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const filteredComplaints = complaints.filter(c => {
    if (assignedOnly && c.assigned_staff_id !== user?.id) return false;
    return true;
  });

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'PENDING').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const escalated = complaints.filter(c => c.status === 'ESCALATED').length;
  const resolved = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
  const myAssigned = complaints.filter(c => c.assigned_staff_id === user?.id).length;

  return (
    <div className="space-y-6">
      {/* Department Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            {user?.department_name || 'Department Inbox'} ({user?.department_code})
          </span>
          <h1 className="text-2xl font-black tracking-tight">Department Resolution Queue</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Logged in as <strong>{user?.name}</strong>. Manage assigned tickets, investigate student grievances, update resolution statuses, and prevent SLA violations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAssignedOnly(!assignedOnly)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              assignedOnly
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Assigned to Me ({myAssigned})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Queue</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Action</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">SLA Escalated</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{escalated}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{resolved}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search tickets by title, student, or #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['', 'PENDING', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === '' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
          <button
            onClick={fetchComplaints}
            title="Refresh"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ticket Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-12 rounded-xl text-center text-slate-400 border border-slate-200">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading department complaints...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center text-slate-500 border border-slate-200">
            <p className="font-bold text-slate-700 text-base">No matching complaints in department queue</p>
            <p className="text-xs text-slate-400 mt-1">
              All tickets for this filter criteria have been addressed.
            </p>
          </div>
        ) : (
          filteredComplaints.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectComplaint(item.id)}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {item.ticket_number}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                  <PriorityBadge priority={item.priority} />
                  {item.is_anonymous === 1 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      🔒 Anonymous
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} />
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                {item.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-4">
                  <span>
                    Complainant: <strong className="text-slate-700">{item.student_name}</strong>
                  </span>
                  <span>
                    Assigned: <strong className={item.assigned_staff_name ? 'text-slate-700' : 'text-amber-600'}>
                      {item.assigned_staff_name || 'Unassigned'}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    SLA Due: {new Date(item.sla_due_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Open Ticket & Take Action</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
