import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, User, Wrench, ShieldAlert } from 'lucide-react';

export const Login = ({ onSwitchToRegister }) => {
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleKey) => {
    setError('');
    setLoading(true);
    try {
      await switchRole(roleKey);
    } catch (err) {
      setError(err.response?.data?.error || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            University Complaint System
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to access your role-specific grievance portal
          </p>
        </div>

        {/* Quick Demo Login Box (For supervisor review & defense) */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-4 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              ⚡ 1-Click FYP Demo Login
            </span>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
              Zero-friction
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-3">
            Click any role to test the complete end-to-end workflow:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition text-left"
            >
              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold leading-tight">Student Portal</p>
                <p className="text-[10px] text-slate-300">Alice (CS Dept)</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('it-staff')}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition text-left"
            >
              <Wrench className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div>
                <p className="font-semibold leading-tight">IT Staff Portal</p>
                <p className="text-[10px] text-slate-300">Marcus Vance</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('facility-staff')}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition text-left"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold leading-tight">Facility Staff</p>
                <p className="text-[10px] text-slate-300">Robert Chen</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition text-left"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold leading-tight">Admin Portal</p>
                <p className="text-[10px] text-slate-300">Dr. Sarah (Dean)</p>
              </div>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student1@ucms.edu or admin@ucms.edu"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New Student?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-bold text-indigo-600 hover:text-indigo-800 transition underline underline-offset-2"
              >
                Register a Student Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
