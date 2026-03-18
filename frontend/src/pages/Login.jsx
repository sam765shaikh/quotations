import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // VALIDATION FUNCTION
  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ submit: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Quotation Manager</h1>
          <p className="text-slate-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-4">
          {errors.submit && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{errors.submit}</div>}

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-6 text-center text-slate-500 text-sm">
            Don't have an account? <Link to="/register" className="text-primary-400 hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}