import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // VALIDATION FUNCTION
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Phone must be 10 digits';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ submit: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Quotation Manager</h1>
          <p className="text-slate-500 mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-4">
          {errors.submit && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{errors.submit}</div>}

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

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

          {/* PHONE */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="10-digit phone number"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
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

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <p className="mt-6 text-center text-slate-500 text-sm">
            Already have an account? <Link to="/login" className="text-primary-400 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}