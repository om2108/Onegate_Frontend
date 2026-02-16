import React, { useEffect, useState, useMemo } from "react";
import societyApi from "../../../api/society";
import { useAuth } from "../../../context/AuthContext";

function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-4 sm:p-5 flex flex-col gap-1">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="text-2xl sm:text-3xl font-semibold text-slate-900">
        {value}
      </div>
      {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
    </div>
  );
}

function TableRow({ item, onPay }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
        {item.month}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-slate-900">
        ₹{item.amount}
      </td>
      <td className="px-4 py-3 text-sm">
        {item.paid ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Paid
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
            Pending
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{item.dueDate}</td>
      <td className="px-4 py-3 text-sm">
        <button
          onClick={() => onPay(item)}
          disabled={item.paid}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${item.paid ? "bg-slate-200 text-slate-600 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
        >
          {item.paid ? "Paid" : "Pay Now"}
        </button>
      </td>
    </tr>
  );
}

function PaymentModal({ open, onClose, item, onConfirm }) {
  const [form, setForm] = useState({ name: "", card: "", expiry: "", cvv: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setForm({ name: "", card: "", expiry: "", cvv: "" });
      setError("");
    }
  }, [open]);

  if (!open) return null;
  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Card holder name is required";
    const cc = form.card.replace(/\s+/g, "");
    if (!/^\d{12,19}$/.test(cc)) return "Card number must be 12–19 digits";
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) return "Expiry must be MM/YY";
    if (!/^\d{3,4}$/.test(form.cvv)) return "CVV must be 3 or 4 digits";
    return "";
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    onConfirm(item);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            💳 Pay Maintenance
          </h3>
          <button
            onClick={onClose}
            className="inline-flex p-2 rounded-md text-slate-500"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 text-sm text-slate-600">
          {item ? (
            <p>
              Paying{" "}
              <span className="font-medium text-slate-800">{item.month}</span> —{" "}
              <span className="font-semibold text-slate-900">
                ₹{item.amount}
              </span>
            </p>
          ) : (
            <p>Selected invoice</p>
          )}
        </div>

        <div className="mt-4 grid gap-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Card Holder Name"
          />
          <input
            name="card"
            value={form.card}
            onChange={handleChange}
            inputMode="numeric"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Card Number (digits only)"
          />
          <div className="flex gap-3">
            <input
              name="expiry"
              value={form.expiry}
              onChange={handleChange}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="MM/YY"
            />
            <input
              name="cvv"
              value={form.cvv}
              onChange={handleChange}
              inputMode="numeric"
              className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="CVV"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="mt-3 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Maintenance({ initialData }) {
  const { user } = useAuth() ?? {};
  const societyId = user?.societyId;

  const [rows, setRows] = useState(initialData ?? []);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!societyId) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const { summary, permissionDenied } =
          await societyApi.getMaintenanceForUser(societyId);
        if (!mounted) return;
        if (!permissionDenied && Array.isArray(summary?.invoices)) {
          setRows(summary.invoices);
        } else if (!permissionDenied && summary) {
          // fallback if backend returns different shape
          setRows(summary.invoices ?? []);
        }
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load maintenance data.",
        );
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [societyId]);

  const totals = useMemo(() => {
    const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
    const paid = rows
      .filter((r) => r.paid)
      .reduce((s, r) => s + Number(r.amount || 0), 0);
    const pending = total - paid;
    const lastPayment =
      [...rows]
        .filter((r) => r.paid)
        .slice(-1)
        .pop()?.dueDate ?? "—";
    return { total, paid, pending, lastPayment };
  }, [rows]);

  const openPayment = (item) => {
    setActiveItem(item);
    setModalOpen(true);
  };
  const confirmPayment = async (item) => {
    // TODO: call real payments API. For now optimistic update:
    setRows((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, paid: true } : r)),
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Maintenance Overview
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Invoices, status and quick payments
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <button className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm shadow-sm">
            Export
          </button>
          <button className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm shadow-sm hover:bg-indigo-700">
            New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Maintenance"
          value={`₹${totals.total}`}
          subtitle={`${rows.length} invoices`}
        />
        <SummaryCard title="Paid" value={`₹${totals.paid}`} />
        <SummaryCard title="Pending" value={`₹${totals.pending}`} />
        <SummaryCard title="Last Payment" value={totals.lastPayment} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y table-fixed">
            <thead className="bg-indigo-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white">
                  Month
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y">
              {rows.map((r) => (
                <TableRow key={r.id} item={r} onPay={openPayment} />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-6 text-center text-sm text-slate-500"
                  >
                    {loading ? "Loading..." : "No invoices found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 text-sm text-slate-500">
          Tip: On small screens the table horizontally scrolls.
        </div>
      </div>

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={activeItem}
        onConfirm={confirmPayment}
      />
    </div>
  );
}
