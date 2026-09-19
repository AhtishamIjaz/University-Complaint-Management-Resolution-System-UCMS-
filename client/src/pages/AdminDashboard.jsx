import React, { useState, useEffect } from 'react';
import { complaintAPI, adminAPI, departmentAPI } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  Building2, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  Layers,
  ArrowRightLeft,
  X,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard = ({ onSelectComplaint }) => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  
  // Escalation trigger state
  const [escalating, setEscalating] = useState(false);
  const [escalateMessage, setEscalateMessage] = useState('');

  // Reassign modal state
  const [reassignModalTicket, setReassignModalTicket] = useState(null);
  const [newDeptId, setNewDeptId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassigning, setReassigning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, deptRes] = await Promise.all([
        complaintAPI.getAll({
          department_id: deptFilter || undefined,
          status: statusFilter || undefined,
          search: search || undefined
        }),
        departmentAPI.getAll()
      ]);
      setComplaints(compRes.data.complaints || []);
      setDepartments(deptRes.data.departments || []);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [deptFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleTriggerEscalation = async () => {
    setEscalating(true);
    setEscalateMessage('');
    try {
      const res = await adminAPI.triggerEscalation();
      setEscalateMessage(res.data.message);
      fetchData();
    } catch (err) {
      setEscalateMessage('Failed to trigger SLA check: ' + (err.response?.data?.error || err.message));
    } finally {
      setEscalating(false);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!newDeptId) return;

    setReassigning(true);
    try {
      await adminAPI.reassign(reassignModalTicket.id, {
        department_id: newDeptId,
        reason: reassignReason.trim()
      });
      setReassignModalTicket(null);
      setReassignReason('');
      fetchData();
    } catch (err) {
      alert('Failed to reassign ticket: ' + (err.response?.data?.error || err.message));
    } finally {
      setReassigning(false);
    }
  };

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'PENDING').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const escalated = complaints.filter(c => c.status === 'ESCALATED').length;
  const resolved = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  return (
    <div className="space-y-6">
      {/* Admin Header with SLA Engine Control */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            🏛️ Central Administration Portal
          </span>
          <h1 className="text-2xl font-black tracking-tight">University Grievance Master Oversight</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time monitoring across all 5 academic and operational departments. Enforce accountability, reroute misplaced complaints, and audit automated SLA escalations.
          </p>
        </div>

        {/* SLA Escalation Trigger Button (Proposal Objective O5) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
          <button
            onClick={handleTriggerEscalation}
            disabled={escalating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${escalating ? 'animate-spin' : ''}`} />
            <span>{escalating ? 'Running SLA Engine...' : '⚡ Trigger SLA Check Now'}</span>
          </button>
        </div>
      </div>

      {escalateMessage && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>{escalateMessage}</span>
          </div>
          <button onClick={() => setEscalateMessage('')} className="text-indigo-400 hover:text-indigo-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Complaints</p>
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
            placeholder="Search tickets across university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ESCALATED">SLA Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <button
            onClick={fetchData}
            title="Refresh"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Master Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Ticket #</th>
                <th className="p-3.5">Complaint Title</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Complainant</th>
                <th className="p-3.5">Staff Assigned</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    Loading master complaints list...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    No complaints matching current filters.
                  </td>
                </tr>
              ) : (
                complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {item.ticket_number}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                        {item.department_code}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-600">
                      {item.is_anonymous === 1 ? (
                        <span className="text-purple-700 font-semibold text-[11px]">🔒 {item.student_name}</span>
                      ) : (
                        item.student_name
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-600">
                      {item.assigned_staff_name || (
                        <span className="text-amber-600 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() => {
                          setReassignModalTicket(item);
                          setNewDeptId(item.department_id);
                        }}
                        title="Reroute Department"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelectComplaint(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reroute Department Modal */}
      {reassignModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Reroute Complaint Ticket
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {reassignModalTicket.ticket_number}
                </p>
              </div>
              <button
                onClick={() => setReassignModalTicket(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Department:
                </label>
                <select
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reassignment Reason (Logged to Audit Log) *:
                </label>
                <textarea
                  required
                  rows={3}
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Misrouted category; falls under facilities jurisdiction..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignModalTicket(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassigning}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {reassigning ? 'Rerouting...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
