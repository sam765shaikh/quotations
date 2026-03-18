import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "india",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const isExpired = (date) => {
  return new Date(date) < new Date();
};

//  Empty Item Template
const emptyItem = () => ({
  product_name: "",
  description: "",
  quantity: 1,
  unit_price: 0,
});

export default function QuotationCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    company: "",
    valid_until: "",
    notes: "",
    tax_rate: 0,
    items: [emptyItem()], // default 1 item
  });

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, items });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, emptyItem()] });
  const removeItem = (index) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  // CALCULATIONS
  const subtotal = form.items.reduce(
    (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0),
    0
  );

  const taxAmount = (subtotal * (Number(form.tax_rate) || 0)) / 100;
  const total = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      items: form.items.map((i) => ({
        product_name: i.product_name || "Product",
        description: i.description || "",
        quantity: Number(i.quantity) || 1,
        unit_price: Number(i.unit_price) || 0,
      })),
    };

    const res = await api("/quotations", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    navigate(`/quotations/${res.id}`);
  };

  return (
    <div className="p-8 max-w-5xl text-white">
      <h1 className="text-2xl mb-6">Create Quotation</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* CLIENT INFO */}
        <div className="bg-slate-900 p-4 rounded space-y-3">
          <input
            placeholder="Company Name"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full p-2 bg-slate-800 rounded"
            required
          />
          <input
            placeholder="Client Name"
            value={form.client_name}
            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
            className="w-full p-2 bg-slate-800 rounded"
            required
          />
          <input
            placeholder="Email"
            value={form.client_email}
            onChange={(e) => setForm({ ...form, client_email: e.target.value })}
            className="w-full p-2 bg-slate-800 rounded"
          />
          <input
            placeholder="Phone"
            value={form.client_phone}
            onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
            className="w-full p-2 bg-slate-800 rounded"
          />
          <input
            type="date"
            value={form.valid_until}
            onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
            className="w-full p-2 bg-slate-800 rounded"
          />
          {form.valid_until && (
            <div className="text-sm text-slate-400 mt-1">
              Valid Until: {formatDate(form.valid_until)}{" "}
              {isExpired(form.valid_until) ? (
                <span className="text-red-400">(Expired)</span>
              ) : (
                <span className="text-green-400">(Active)</span>
              )}
            </div>
          )}
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full p-2 bg-slate-800 rounded"
          />
        </div>

        {/* ITEMS TABLE */}
        <div className="bg-slate-900 p-4 rounded">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Items</h2>
            <button type="button" onClick={addItem} className="text-blue-400 hover:text-blue-300">
              + Add Item
            </button>
          </div>

          {/* HEADER */}
          <div className="grid grid-cols-12 gap-2 border border-slate-700 bg-slate-800 p-3 font-semibold text-center rounded-t">
            <div className="col-span-4">Item</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-3">Price</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-1">X</div>
          </div>

          {/* BODY */}
          {form.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 border border-slate-700 p-2 items-center"
            >
              <div className="col-span-4">
                <input
                  placeholder="Item name"
                  value={item.product_name}
                  onChange={(e) => updateItem(index, "product_name", e.target.value)}
                  className="w-full p-2 bg-slate-800 rounded"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  className="w-full p-2 bg-slate-800 text-center rounded"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                  className="w-full p-2 bg-slate-800 text-center rounded"
                />
              </div>
              <div className="col-span-2 text-center font-medium">
                ₹{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toFixed(2)}
              </div>
              <div className="col-span-1 text-center">
                <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300">
                  ❌
                </button>
              </div>
            </div>
          ))}

          {/* TOTAL */}
          <div className="mt-6 text-right space-y-2">
            <div className="text-slate-300">Subtotal: ₹{subtotal.toFixed(2)}</div>

            <div className="flex justify-end gap-2 items-center">
              <span>GST (%)</span>
              <input
                type="number"
                value={form.tax_rate}
                onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
                className="w-20 p-1 bg-slate-800 text-right rounded"
              />
            </div>

            <div className="text-slate-300">GST: ₹{taxAmount.toFixed(2)}</div>

            <div className="text-2xl font-bold">Total: ₹{total.toFixed(2)}</div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex gap-3">
          <button type="submit" className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium">
            Create Quotation
          </button>
        </div>
      </form>
    </div>
  );
}