import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function QuotationList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchList = () => {
    api('/quotations')
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => fetchList(), []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this quotation?')) return;
    setDeletingId(id);
    try {
      await api(`/quotations/${id}`, { method: 'DELETE' });
      setList((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const statusColor = (s) => {
    if (s === 'draft') return 'bg-slate-500/20 text-slate-400';
    if (s === 'sent') return 'bg-primary-500/20 text-primary-400';
    if (s === 'accepted') return 'bg-emerald-500/20 text-emerald-400';
    if (s === 'rejected') return 'bg-red-500/20 text-red-400';
    return 'bg-slate-500/20 text-slate-400';
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Quotations</h1>
        <Link to="/quotations/new" className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors">
          New Quotation
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No quotations yet. <Link to="/quotations/new" className="text-primary-400 hover:underline">Create your first quotation</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Number</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Client</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Valid Until</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-slate-500">Total</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((q) => (
                  <tr key={q.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/quotations/${q.id}`} className="font-medium text-primary-400 hover:underline">
                        {q.quotation_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{q.client_name}</td>
                    <td className="px-6 py-4 text-slate-400">{q.valid_until ? new Date(q.valid_until).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor(q.status)}`}>{q.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-white">₹{Number(q.total).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/quotations/${q.id}/edit`} className="text-primary-400 hover:underline text-sm mr-3">Edit</Link>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(q.id, e)}
                        disabled={deletingId === q.id}
                        className="text-red-400 hover:underline text-sm disabled:opacity-50"
                      >
                        {deletingId === q.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}