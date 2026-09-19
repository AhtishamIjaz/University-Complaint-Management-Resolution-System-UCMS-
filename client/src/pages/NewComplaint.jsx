import React, { useState, useEffect } from 'react';
import { complaintAPI, departmentAPI } from '../services/api';
import { 
  Building2, 
  ArrowLeft, 
  Upload, 
  FileText, 
  ShieldAlert, 
  CheckCircle, 
  X, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const NewComplaint = ({ onCancel, onSuccess }) => {
  const [departments, setDepartments] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IT Services');
  const [departmentId, setDepartmentId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Category to Department mapping
  const CATEGORY_MAP = {
    'IT Services': 'ITS',
    'Facility Maintenance': 'FCM',
    'Academic Affairs': 'AAE',
    'Finance & Fees': 'FIN',
    'Harassment & Disciplinary': 'SAW',
    'Hostel & Accommodation': 'FCM',
    'Other': 'SAW'
  };

  useEffect(() => {
    departmentAPI.getAll().then(res => {
      const depts = res.data.departments || [];
      setDepartments(depts);
      // Auto match initial category
      const match = depts.find(d => d.code === CATEGORY_MAP['IT Services']);
      if (match) setDepartmentId(match.id);
    }).catch(err => console.error('Failed to load depts:', err));
  }, []);

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setCategory(cat);
    const targetCode = CATEGORY_MAP[cat];
    if (targetCode && departments.length > 0) {
      const matched = departments.find(d => d.code === targetCode);
      if (matched) {
        setDepartmentId(matched.id);
      }
    }
    // If harassment, recommend anonymous toggle
    if (cat === 'Harassment & Disciplinary') {
      setIsAnonymous(true);
      setPriority('URGENT');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (files.length + selected.length > 5) {
        setError('Maximum 5 attachments allowed per ticket.');
        return;
      }
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !departmentId) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('department_id', departmentId);
      formData.append('priority', priority);
      formData.append('description', description.trim());
      formData.append('is_anonymous', isAnonymous ? '1' : '0');

      for (const file of files) {
        formData.append('attachments', file);
      }

      const res = await complaintAPI.create(formData);
      onSuccess(res.data.complaint);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit grievance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
          SLA Window: 48 Hours Automated Escalation
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Submit an Institutional Grievance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your complaint will be automatically routed to the responsible university department with an active 48-hour SLA resolution timer.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Complaint Title / Summary *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wi-Fi disconnection during CS lab practicals / Fee payment deduction error"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Category & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="IT Services">IT Services & Technical Infrastructure</option>
                <option value="Facility Maintenance">Facility & Hostel Maintenance</option>
                <option value="Academic Affairs">Academic Affairs & Grading Disputes</option>
                <option value="Finance & Fees">Finance, Accounts & Fee Challans</option>
                <option value="Harassment & Disciplinary">Harassment, Bullying & Student Conduct</option>
                <option value="Hostel & Accommodation">Hostel & Accommodation</option>
                <option value="Other">General Administration / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Department *
              </label>
              <select
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select Responsible Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Urgency / Priority Level *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'LOW', label: 'Low', desc: 'General queries / Minor' },
                { id: 'MEDIUM', label: 'Medium', desc: 'Standard turnaround' },
                { id: 'HIGH', label: 'High', desc: 'Impacting coursework' },
                { id: 'URGENT', label: 'Urgent', desc: 'Critical / Safety / SLA 24h' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    priority === p.id
                      ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className={`text-xs font-bold ${priority === p.id ? 'text-indigo-700' : 'text-slate-800'}`}>
                    {p.label}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description *
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail. Include dates, exact locations (e.g. Room #, Lab #), course codes, or reference numbers..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Supporting Proof / Documents (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-400 transition bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-600 font-medium">
                Drag and drop files here, or{' '}
                <label className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer underline">
                  browse files
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Accepted formats: PNG, JPG, PDF, DOCX (Up to 5 files, max 10MB each)
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anonymous Option (Proposal 5.1 Goal: Safety for Sensitive Complaints) */}
          <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="anonCheck"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
              >
              </input>
              <div>
                <label htmlFor="anonCheck" className="text-xs font-bold text-purple-900 cursor-pointer flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>File this complaint anonymously</span>
                </label>
                <p className="text-[11px] text-purple-700 mt-0.5 leading-relaxed">
                  Recommended for harassment, bullying, or sensitive disciplinary grievances. Your name and registration number will be completely masked from departmental staff views and public audit logs to prevent retaliation.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Grievance to Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
