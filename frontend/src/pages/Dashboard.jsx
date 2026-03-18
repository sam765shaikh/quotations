import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, draft: 0, sent: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/quotations')
      .then((list) => {
        const total = list.length;
        const draft = list.filter((q) => q.status === 'draft').length;
        const sent = list.filter((q) => q.status === 'sent').length;
        setStats({ total, draft, sent });
        setRecent(list.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s) => {
    if (s === 'draft') return 'bg-slate-500/20 text-slate-400';
    if (s === 'sent') return 'bg-primary-500/20 text-primary-400';
    if (s === 'accepted') return 'bg-emerald-500/20 text-emerald-400';
    if (s === 'rejected') return 'bg-red-500/20 text-red-400';
    return 'bg-slate-500/20 text-slate-400';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.name || user?.email}</p>
      </div>

      {loading ? (
        <div className="animate-pulse flex gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 flex-1 rounded-xl bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-slate-500 text-sm font-medium">Total Quotations</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-slate-500 text-sm font-medium">Drafts</p>
            <p className="text-3xl font-bold text-slate-300 mt-1">{stats.draft}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-slate-500 text-sm font-medium">Sent</p>
            <p className="text-3xl font-bold text-primary-400 mt-1">{stats.sent}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Quotations</h2>
          <Link to="/quotations/new" className="text-sm text-primary-400 hover:text-primary-300 font-medium">
            New Quotation
          </Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No quotations yet. <Link to="/quotations/new" className="text-primary-400 hover:underline">Create one</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recent.map((q) => (
              <Link key={q.id} to={`/quotations/${q.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition-colors">
                <div>
                  <p className="font-medium text-white">{q.quotation_number}</p>
                  <p className="text-sm text-slate-500">{q.client_name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor(q.status)}`}>{q.status}</span>
                  <span className="text-slate-400 font-medium">₹{Number(q.total).toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}