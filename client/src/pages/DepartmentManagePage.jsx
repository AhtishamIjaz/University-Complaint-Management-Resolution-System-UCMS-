import React, { useState, useEffect } from 'react';
import { departmentAPI, adminAPI } from '../services/api';
import { Building2, Users, PlusCircle, Mail, UserPlus, X, Check, Shield } from 'lucide-react';

export const DepartmentManagePage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Department Modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', email: '' });
  const [deptSubmitting, setDeptSubmitting] = useState(false);

  // New Staff Modal
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', department_id: '', phone: '' });
  const [staffSubmitting, setStaffSubmitting] = useState(false);

  // Selected Department for Staff List
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptStaff, setDeptStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentAPI.getAll();
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setDeptSubmitting(true);
    try {
      await departmentAPI.create(deptForm);
      setShowDeptModal(false);
      setDeptForm({ name: '', code: '', description: '', email: '' });
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create department');
    } finally {
      setDeptSubmitting(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffSubmitting(true);
    try {
      await adminAPI.createUser({
        ...staffForm,
        role: 'staff'
      });
      setShowStaffModal(false);
      setStaffForm({ name: '', email: '', password: '', department_id: '', phone: '' });
      alert('Staff member created successfully!');
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create staff account');
    } finally {
      setStaffSubmitting(false);
    }
  };

  const handleViewStaff = async (dept) => {
    setSelectedDept(dept);
    setLoadingStaff(true);
    try {
      const res = await departmentAPI.getStaff(dept.id);
      setDeptStaff(res.data.staff || []);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Departments & Administrative Staff
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize university faculties, maintain resolution queues, and provision staff roles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeptModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            <PlusCircle className="w-4 h-4" /> Add Department
          </button>
          <button
            onClick={() => setShowStaffModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md transition"
          >
            <UserPlus className="w-4 h-4" /> Onboard Staff User
          </button>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {dept.code}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {dept.staff_count || 0} Staff
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {dept.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {dept.description || 'General administrative division'}
              </p>
              {dept.email && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {dept.email}
                </p>
              )}
            </div>

            {/* Department mini metrics */}
            <div className="pt-3 border-t border-slate-100">
              <div className="grid grid-cols-4 gap-1 text-center text-xs mb-3">
                <div className="bg-slate-50 p-1.5 rounded-lg">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                  <p className="font-black text-slate-800">{dept.total_complaints || 0}</p>
                </div>
                <div className="bg-amber-50 p-1.5 rounded-lg">
                  <p className="text-[10px] text-amber-600 font-bold uppercase">Pending</p>
                  <p className="font-black text-amber-700">{dept.pending_count || 0}</p>
                </div>
                <div className="bg-rose-50 p-1.5 rounded-lg">
                  <p className="text-[10px] text-rose-600 font-bold uppercase">SLA</p>
                  <p className="font-black text-rose-700">{dept.escalated_count || 0}</p>
                </div>
                <div className="bg-emerald-50 p-1.5 rounded-lg">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Solved</p>
                  <p className="font-black text-emerald-700">{dept.resolved_count || 0}</p>
                </div>
              </div>

              <button
                onClick={() => handleViewStaff(dept)}
                className="w-full py-2 text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                View Department Staff ({dept.staff_count || 0})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Staff View Modal */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedDept.name} — Staff Members
                </h3>
                <p className="text-xs text-slate-500">Authorized personnel handling department queue</p>
              </div>
              <button onClick={() => setSelectedDept(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingStaff ? (
              <p className="text-xs text-slate-400 text-center py-6">Loading department staff...</p>
            ) : deptStaff.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No staff members currently assigned to this department.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {deptStaff.map((st) => (
                  <div key={st.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{st.name}</p>
                      <p className="text-slate-500 text-[11px]">{st.email}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase">
                      Staff Officer
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedDept(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add University Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student Health & Counseling"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SHC"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="shc@ucms.edu"
                  value={deptForm.email}
                  onChange={(e) => setDeptForm({ ...deptForm, email: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Mandate and scope of complaints handled..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deptSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {deptSubmitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Onboard Department Staff</h3>
              <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department *</label>
                <select
                  required
                  value={staffForm.department_id}
                  onChange={(e) => setStaffForm({ ...staffForm, department_id: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Staff Email *</label>
                <input
                  type="email"
                  required
                  placeholder="s.jenkins@ucms.edu"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={staffSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {staffSubmitting ? 'Creating...' : 'Register Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
