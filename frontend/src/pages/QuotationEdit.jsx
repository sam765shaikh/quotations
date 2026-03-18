import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';

const emptyItem = () => ({ product_name: '', description: '', quantity: 1, unit_price: 0, total_price: 0 });

export default function QuotationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    api(`/quotations/${id}`)
      .then((q) => {
        setForm({
          client_name: q.client_name || '',
          client_email: q.client_email || '',
          client_phone: q.client_phone || '',
          valid_until: q.valid_until ? q.valid_until.slice(0, 10) : '',
          notes: q.notes || '',
          tax_rate: q.tax_rate ?? 0,
          status: q.status || 'draft',
          items: (q.items && q.items.length)
            ? q.items.map((i) => ({
                product_name: i.product_name,
                description: i.description || '',
                quantity: i.quantity,
                unit_price: i.unit_price,
                total_price: (i.quantity || 0) * (i.unit_price || 0),
              }))
            : [emptyItem()],
        });
      })
      .catch(() => navigate('/quotations'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      const qty = Number(field === 'quantity' ? value : items[index].quantity) || 0;
      const unit = Number(field === 'unit_price' ? value : items[index].unit_price) || 0;
      items[index].total_price = qty * unit;
    }
    setForm((f) => ({ ...f, items }));
  };

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));

  const removeItem = (index) => {
    if (form.items.length <= 1) return;
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  };

  if (loading || !form) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-800 rounded" />
          <div className="h-64 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  const subtotal = form.items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0);
  const taxRate = Number(form.tax_rate) || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        client_name: form.client_name,
        client_email: form.client_email || undefined,
        client_phone: form.client_phone || undefined,
        valid_until: form.valid_until || undefined,
        notes: form.notes || undefined,
        tax_rate: form.tax_rate,
        status: form.status,
        items: form.items.map((i) => ({
          product_name: i.product_name || 'Product',
          description: i.description || undefined,
          quantity: Number(i.quantity) || 1,
          unit_price: Number(i.unit_price) || 0,
        })),
      };
      await api(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      navigate(`/quotations/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-8">Edit Quotation</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <div className="p-4 rounded-lg bg-red-500/10 text-red-400">{error}</div>}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Client Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Client Name *</label>
              <input value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
              <input type="email" value={form.client_email} onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Phone</label>
              <input value={form.client_phone} onChange={(e) => setForm((f) => ({ ...f, client_phone: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Valid Until</label>
              <input type="date" value={form.valid_until} onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Products / Items</h2>
            <button type="button" onClick={addItem} className="text-sm text-primary-400 hover:text-primary-300 font-medium">+ Add product</button>
          </div>
          <div className="space-y-4">
            {form.items.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5">
                    <input placeholder="Product name" value={item.product_name} onChange={(e) => updateItem(index, 'product_name', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="md:col-span-4">
                    <input placeholder="Description (optional)" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="md:col-span-1">
                    <input type="number" min={1} placeholder="Qty" value={item.quantity || ''} onChange={(e) => updateItem(index, 'quantity', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="md:col-span-1">
                    <input type="number" min={0} step={0.01} placeholder="Price" value={item.unit_price || ''} onChange={(e) => updateItem(index, 'unit_price', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="md:col-span-1 flex items-center justify-end">
                    <span className="text-slate-400 text-sm font-medium">₹{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toFixed(2)}</span>
                  </div>
                  <div className="md:col-span-1 flex items-center justify-end">
                    <button type="button" onClick={() => removeItem(index)} disabled={form.items.length <= 1} className="text-red-400 hover:text-red-300 text-sm disabled:opacity-40">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end">
            <div className="w-64 space-y-2 text-right">
              <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-400 items-center">
                <span>Tax (%)</span>
                <input type="number" min={0} max={100} step={0.01} value={form.tax_rate} onChange={(e) => setForm((f) => ({ ...f, tax_rate: e.target.value }))} className="w-20 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-sm text-right" />
              </div>
              <div className="flex justify-between text-slate-400"><span>Tax amount</span><span>₹{taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-slate-700"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Update Quotation'}</button>
          <button type="button" onClick={() => navigate(`/quotations/${id}`)} className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium">Cancel</button>
        </div>
      </form>
    </div>
  );
}