import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { History, Search, ShieldCheck, Filter, RefreshCw } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAuditLogs({ limit: 100 });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      const matchTicket = log.ticket_number?.toLowerCase().includes(term);
      const matchActor = log.performed_by_name?.toLowerCase().includes(term);
      const matchDetails = log.details?.toLowerCase().includes(term);
      return matchTicket || matchActor || matchDetails;
    }
    return true;
  });

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'AUTO_ESCALATED_SLA':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'STATUS_UPDATED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TICKET_CREATED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'STAFF_ASSIGNED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'FEEDBACK_SUBMITTED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Institutional Governance & Compliance (Objective O4)</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight">System-Wide Immutable Audit Trail</h1>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Every ticket creation, status progression, staff delegation, automated SLA escalation trigger, and student feedback submission is permanently preserved with tamper-evident actor timestamps.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search audit records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white"
          >
            <option value="">All Actions</option>
            <option value="TICKET_CREATED">TICKET_CREATED</option>
            <option value="STAFF_ASSIGNED">STAFF_ASSIGNED</option>
            <option value="STATUS_UPDATED">STATUS_UPDATED</option>
            <option value="AUTO_ESCALATED_SLA">AUTO_ESCALATED_SLA</option>
            <option value="ADMIN_REASSIGNED">ADMIN_REASSIGNED</option>
            <option value="FEEDBACK_SUBMITTED">FEEDBACK_SUBMITTED</option>
            <option value="COMMENT_ADDED">COMMENT_ADDED</option>
          </select>

          <button
            onClick={fetchLogs}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Ticket #</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Actor (Role)</th>
                <th className="p-3.5">State Transition</th>
                <th className="p-3.5">Audit Narrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Querying audit repository...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {log.ticket_number}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-700">
                      {log.performed_by_name ? (
                        <div>
                          <p className="font-semibold text-slate-900">{log.performed_by_name}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{log.performed_by_role}</p>
                        </div>
                      ) : (
                        <span className="text-rose-700 font-bold">⚡ SLA Escalation Daemon</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {log.old_value && <span className="text-slate-400">{log.old_value} ➔ </span>}
                      <span className="font-bold text-slate-800">{log.new_value || '-'}</span>
                    </td>
                    <td className="p-3.5 text-slate-600 text-[11px] max-w-sm">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
