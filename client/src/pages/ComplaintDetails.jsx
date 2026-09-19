import React, { useState, useEffect } from 'react';
import { complaintAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TimelineStepper } from '../components/TimelineStepper';
import { 
  ArrowLeft, 
  Send, 
  FileText, 
  Download, 
  Clock, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Star, 
  History, 
  MessageSquare,
  Building2,
  RefreshCw
} from 'lucide-react';

export const ComplaintDetails = ({ complaintId, onBack }) => {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Discussion thread input
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Status update modal / form
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Feedback form (Student only)
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Active tab in details view: 'thread' | 'audit'
  const [detailTab, setDetailTab] = useState('thread');

  const fetchDetails = async () => {
    try {
      const res = await complaintAPI.getById(complaintId);
      setData(res.data);
      setNewStatus(res.data.complaint.status);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [complaintId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSendingComment(true);
    try {
      await complaintAPI.addComment(complaintId, { message: commentText.trim() });
      setCommentText('');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message.');
    } finally {
      setSendingComment(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    if (newStatus === 'RESOLVED' && !resolutionNotes.trim()) {
      alert('Please provide formal resolution remarks before resolving the ticket.');
      return;
    }

    setUpdatingStatus(true);
    try {
      await complaintAPI.updateStatus(complaintId, {
        status: newStatus,
        resolution_notes: resolutionNotes.trim() || undefined
      });
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update ticket status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleClaimTicket = async () => {
    try {
      await complaintAPI.assignStaff(complaintId, { staff_id: user.id });
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign ticket.');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await complaintAPI.submitFeedback(complaintId, {
        rating,
        comment: feedbackComment.trim()
      });
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit satisfaction feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl text-center border border-slate-200">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500">Loading complaint record...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 space-y-4">
        <p className="text-sm font-bold text-rose-600">{error || 'Ticket not found'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>
      </div>
    );
  }

  const { complaint, attachments, comments, auditLogs } = data;
  const isComplainant = user && user.id === complaint.student_id;
  const canManageStatus = role === 'admin' || (role === 'staff' && user.department_id === complaint.department_id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDetails}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            title="Refresh details"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
            {complaint.ticket_number}
          </span>
        </div>
      </div>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        {/* Ticket Header & Status Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {complaint.category}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {complaint.department_name} ({complaint.department_code})
              </span>
              <PriorityBadge priority={complaint.priority} />
              {complaint.is_anonymous === 1 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  🔒 Anonymous Complainant
                </span>
              )}
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {complaint.title}
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
            <StatusBadge status={complaint.status} />
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Filed {new Date(complaint.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* SLA Status Banner */}
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
          complaint.status === 'ESCALATED' 
            ? 'bg-rose-50 border border-rose-200 text-rose-800' 
            : complaint.status === 'RESOLVED'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            {complaint.status === 'ESCALATED' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : complaint.status === 'RESOLVED' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {complaint.status === 'ESCALATED'
                  ? 'SLA Window Breached: Ticket Escalated to University Admin'
                  : complaint.status === 'RESOLVED'
                  ? 'Ticket Resolved within Institutional SLA'
                  : 'SLA Window Active (48 Hours)'}
              </p>
              <p className="text-[11px] opacity-80">
                SLA Deadline: {new Date(complaint.sla_due_at).toLocaleString()}
              </p>
            </div>
          </div>
          {complaint.assigned_staff_name ? (
            <div className="text-right text-[11px]">
              <span className="font-bold">Assigned Staff:</span> {complaint.assigned_staff_name}
            </div>
          ) : (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              Unassigned
            </span>
          )}
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <TimelineStepper
            status={complaint.status}
            isEscalated={complaint.is_escalated === 1}
            createdAt={complaint.created_at}
            resolvedAt={complaint.resolved_at}
          />
        </div>

        {/* Grievance Description & Complainant Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Detailed Problem Description
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {complaint.description}
              </div>
            </div>

            {/* Attachments Section */}
            {attachments && attachments.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Attachments & Supporting Proof ({attachments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((att) => {
                    const fileUrl = (typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:5000' : '') + att.file_path;
                    return (
                      <a
                        key={att.id}
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white text-xs group transition"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate group-hover:text-indigo-600">
                            {att.file_name}
                          </span>
                        </div>
                        <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resolution Notes Block (if resolved) */}
            {complaint.resolution_notes && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Official Departmental Resolution
                </h3>
                <p className="text-xs text-emerald-900 mt-1 whitespace-pre-line">
                  {complaint.resolution_notes}
                </p>
                <p className="text-[10px] text-emerald-600 mt-2 font-medium">
                  Resolved on: {new Date(complaint.resolved_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Info & Complainant Details */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Complainant Details
              </h3>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Name</p>
                <p className="font-bold text-slate-800">{complaint.student_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Registration No</p>
                <p className="font-mono text-slate-700">{complaint.student_reg_no || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Contact Email</p>
                <p className="text-slate-700 truncate">{complaint.student_email}</p>
              </div>
            </div>

            {/* Staff / Admin Actions Card */}
            {canManageStatus && (
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-3">
                <h3 className="font-bold text-indigo-900 uppercase tracking-wider text-[11px]">
                  Staff Department Controls
                </h3>

                {!complaint.assigned_staff_id && (
                  <button
                    onClick={handleClaimTicket}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition"
                  >
                    Claim & Assign to Myself
                  </button>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Update Status:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="ESCALATED">ESCALATED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                {newStatus === 'RESOLVED' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Resolution Remarks (Required) *:
                    </label>
                    <textarea
                      rows={3}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Explain action taken to resolve the student's issue..."
                      className="w-full p-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                )}

                <button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {updatingStatus ? 'Updating...' : 'Save Status Update'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Student Satisfaction Rating Box (Visible if Resolved) */}
        {['RESOLVED', 'CLOSED'].includes(complaint.status) && (
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              Student Satisfaction Survey (Objective O6)
            </h3>

            {complaint.feedback_rating ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= complaint.feedback_rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="font-bold text-xs text-amber-900 ml-2">
                    {complaint.feedback_rating} out of 5 Stars
                  </span>
                </div>
                {complaint.feedback_comment && (
                  <p className="text-xs text-slate-700 italic mt-1">
                    "{complaint.feedback_comment}"
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Feedback recorded on {new Date(complaint.feedback_created_at || complaint.updated_at).toLocaleDateString()}
                </p>
              </div>
            ) : isComplainant ? (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <p className="text-xs text-slate-700">
                  Please rate how effectively your grievance was handled by the department:
                </p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} / 5 Stars</span>
                </div>
                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share comments on the speed and clarity of the resolution (Optional)..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-sm"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Satisfaction Rating'}
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Awaiting student satisfaction survey response.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tabs: Discussion Thread vs Immutable Audit Trail */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 px-4">
          <button
            onClick={() => setDetailTab('thread')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              detailTab === 'thread'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discussion & Clarification Thread ({comments.length})</span>
          </button>
          <button
            onClick={() => setDetailTab('audit')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              detailTab === 'audit'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Immutable Audit Log ({auditLogs.length})</span>
          </button>
        </div>

        <div className="p-6">
          {detailTab === 'thread' ? (
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No messages yet. Use this thread to communicate between student and staff.
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((msg) => {
                    const isMe = user && user.id === msg.user_id;
                    const isStaffRole = msg.author_role === 'staff' || msg.author_role === 'admin';

                    return (
                      <div
                        key={msg.id}
                        className={`p-3.5 rounded-xl text-xs space-y-1 ${
                          isMe
                            ? 'bg-indigo-50 border border-indigo-100 ml-6'
                            : isStaffRole
                            ? 'bg-blue-50/80 border border-blue-200 mr-6'
                            : 'bg-slate-50 border border-slate-200 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            {msg.author_name}
                            <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold ${
                              isStaffRole ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {msg.author_role}
                            </span>
                          </span>
                          <span className="text-slate-400">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Message Input Box */}
              <form onSubmit={handlePostComment} className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type a message or request clarification..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={sendingComment}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            /* Audit Log View (Proposal Objective O4) */
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-medium">
                🛡️ <strong>Immutable Audit Trail</strong>: Every lifecycle event, automated SLA escalation, and status change is cryptographically recorded with authoritative timestamps.
              </div>
              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Old Value ➔ New Value</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-3 font-bold text-indigo-700 whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="p-3 text-slate-700 whitespace-nowrap">
                          {log.performed_by_name || 'System Automated'}
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">
                          {log.old_value && <span>{log.old_value} ➔ </span>}
                          <span className="font-bold text-slate-800">{log.new_value || '-'}</span>
                        </td>
                        <td className="p-3 text-slate-600 text-[11px]">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
