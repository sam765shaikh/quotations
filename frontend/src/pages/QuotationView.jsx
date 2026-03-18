
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";

export default function QuotationView() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);

  useEffect(() => {
    api(`/quotations/${id}`).then(setQuotation);
  }, [id]);

  if (!quotation) return <div className="p-8 text-white">Loading...</div>;

  const subtotal = quotation.items.reduce(
    (sum, i) => sum + i.quantity * i.unit_price,
    0
  );

  const taxAmount = (subtotal * quotation.tax_rate) / 100;
  const total = subtotal + taxAmount;

  return (
    <div className="p-8 text-white">

      {/* BUTTONS */}
      <div className="flex gap-3 mb-6">

        {/* PRINT */}
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-green-600 rounded"
        >
          Print
        </button>

        {/* EMAIL */}
        <button
          onClick={() => {
            const subject = `Quotation`;
            const body = `Hello ${quotation.client_name}, your quotation total is ₹${total}`;
            window.open(
              `mailto:${quotation.client_email}?subject=${subject}&body=${body}`
            );
          }}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          Email
        </button>

        {/* WHATSAPP */}
        <button
          onClick={() => {
            const msg = `Hello ${quotation.client_name}, your quotation total is ₹${total}`;
            window.open(
              `https://wa.me/91${quotation.client_phone}?text=${encodeURIComponent(msg)}`
            );
          }}
          className="px-4 py-2 bg-green-500 rounded"
        >
          WhatsApp
        </button>

        {/* STATUS */}
        <button
          onClick={async () => {
            await api(`/quotations/${quotation.id}`, {
              method: "PUT",
              body: JSON.stringify({ status: "sent" }),
            });
            window.location.reload();
          }}
          className="px-4 py-2 bg-yellow-600 rounded"
        >
          Mark Sent
        </button>
      </div>

      {/* INVOICE PRINT AREA */}
      <div id="invoice-print" className="bg-slate-900 p-6 rounded">

        <h1 className="text-2xl font-bold mb-4">Quotation</h1>

        {/* CLIENT */}
        <div className="mb-4">
          <p><b>Name:</b> {quotation.client_name}</p>
          <p><b>Email:</b> {quotation.client_email}</p>
          <p><b>Phone:</b> {quotation.client_phone}</p>
          <p><b>Valid Until:</b> {quotation.valid_until}</p>
          <p><b>Status:</b> {quotation.status}</p>
        </div>

        {/* TABLE */}
        <table className="w-full border border-slate-700 mb-4">
          <thead>
            <tr className="bg-slate-800">
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item, i) => (
              <tr key={i}>
                <td className="p-2 border">{item.product_name}</td>
                <td className="p-2 border">{item.quantity}</td>
                <td className="p-2 border">₹{item.unit_price}</td>
                <td className="p-2 border">
                  ₹{(item.quantity * item.unit_price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTAL */}
        <div className="text-right space-y-2">
          <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
          <div>GST ({quotation.tax_rate}%): ₹{taxAmount.toFixed(2)}</div>
          <div className="text-xl font-bold">
            Total: ₹{total.toFixed(2)}
          </div>
        </div>

      </div>
    </div>
  );
}
