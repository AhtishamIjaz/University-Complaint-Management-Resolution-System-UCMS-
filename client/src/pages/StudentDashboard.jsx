import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  ChevronRight, 
  Shield, 
  Star,
  RefreshCw
} from 'lucide-react';

export const StudentDashboard = ({ onSelectComplaint, onNewComplaint }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintAPI.getAll({
        status: statusFilter || undefined,
        search: search || undefined
      });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  // Metrics
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'PENDING').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const escalated = complaints.filter(c => c.status === 'ESCALATED').length;
  const resolved = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 mb-2">
            Student Grievance Portal
          </span>
          <h1 className="text-2xl font-black tracking-tight">My Complaint Tracker</h1>
          <p className="text-xs text-indigo-100 mt-1 max-w-xl">
            Monitor real-time progress, communicate directly with assigned departmental staff, and verify resolution compliance under institutional SLAs.
          </p>
        </div>
        <button
          onClick={onNewComplaint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 shadow-md transition shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          <span>Submit New Complaint</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Filed</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</p>
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
            placeholder="Search by ticket # or title..."
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

      {/* Complaints List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-12 rounded-xl text-center text-slate-400 border border-slate-200">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading your grievances...
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center text-slate-500 border border-slate-200">
            <p className="font-bold text-slate-700 text-base">No complaints found</p>
            <p className="text-xs text-slate-400 mt-1">
              {statusFilter ? 'Try clearing the filter' : "You haven't filed any complaints yet."}
            </p>
            <button
              onClick={onNewComplaint}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              <PlusCircle className="w-4 h-4" />
              File First Complaint
            </button>
          </div>
        ) : (
          complaints.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectComplaint(item.id)}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {item.ticket_number}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {item.department_name}
                  </span>
                  <PriorityBadge priority={item.priority} />
                  {item.is_anonymous === 1 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      <Shield className="w-3 h-3" /> Anonymous
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
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Filed {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    {item.comment_count || 0} messages
                  </span>
                  {item.feedback_rating && (
                    <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {item.feedback_rating} / 5
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Track & View Details</span>
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
