import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import adminApi from '../services/adminApi';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdminAuthenticated =
    typeof window !== 'undefined' && window.localStorage.getItem('isAdminAuthenticated') === 'true';

  if (isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const emailMatches = form.email.trim().toLowerCase() === ADMIN_EMAIL;
      const passwordMatches = form.password === ADMIN_PASSWORD;

      if (!emailMatches || !passwordMatches) {
        setError('Invalid admin credentials');
        return;
      }

      adminApi.setAdminKey(adminApi.getDefaultKey());
      window.localStorage.setItem('isAdminAuthenticated', 'true');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError('Unable to start admin session. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck size={32} />
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-600 font-semibold">NutriFlow</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">Admin Access</h1>
              <p className="text-gray-600">Securely manage users and their nutrition plans</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-emerald-500" />
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="admin@gmail.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-emerald-500" />
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="Enter admin password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Securing session...
                </>
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500">
            Access restricted to NutriFlow administrators only
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

