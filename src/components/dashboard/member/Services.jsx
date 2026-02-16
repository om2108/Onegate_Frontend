import React, { useEffect, useState } from "react";


function ServiceCard({ svc, onBook, onContact }) {
  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-5 flex flex-col">
      <div className="flex items-center gap-4">
        <img src={svc.avatar} alt={`${svc.name} avatar`} className="w-16 h-16 rounded-full ring-2 ring-indigo-100 object-cover" />
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            {svc.name}
            {svc.verified && <span title="Verified" className="text-indigo-600">✅</span>}
          </h3>
          <div className="text-sm text-slate-500">{svc.role}</div>
        </div>
        <div className="text-sm text-slate-700 font-semibold">₹{svc.price ?? "—"}</div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-xs text-amber-500" aria-hidden>★ {svc.rating ?? "—"}</div>
          <div className="text-xs text-slate-400">· {svc.available}</div>
        </div>
        <div className="text-xs text-slate-400">Contact: <span className="text-slate-700 font-medium">{svc.contact}</span></div>
      </div>

      <p className="mt-4 text-sm text-slate-600 flex-1">{svc.description}</p>

      <div className="mt-4 flex gap-3">
        <button onClick={() => onContact(svc)} className="flex-1 inline-flex justify-center items-center gap-2 rounded-lg px-3 py-2 border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">Contact</button>
        <button onClick={() => onBook(svc)} className="flex-1 inline-flex justify-center items-center gap-2 rounded-lg px-3 py-2 bg-indigo-600 text-white text-sm hover:bg-indigo-700">Book</button>
      </div>
    </article>
  );
}

function BookingModal({ open, onClose, service, onConfirm }) {
  const [form, setForm] = useState({ name: "", flat: "", time: "", notes: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setForm({ name: "", flat: "", time: "", notes: "" });
      setError("");
    }
  }, [open]);

  if (!open) return null;
  const handleChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    if (!form.name.trim()) { setError("Your name is required."); return; }
    if (!form.flat.trim()) { setError("Flat / Wing is required."); return; }
    onConfirm({ ...service, booking: form, bookedAt: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">🧾 Book Service</h3>
            <p className="text-sm text-slate-500 mt-1">{service?.name} — <span className="font-medium">{service?.role}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">✕</button>
        </div>

        <div className="mt-4 grid gap-3">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name" className="w-full px-3 py-2 border rounded-lg" />
          <input name="flat" value={form.flat} onChange={handleChange} placeholder="Flat No / Wing" className="w-full px-3 py-2 border rounded-lg" />
          <input name="time" value={form.time} onChange={handleChange} placeholder="Preferred Time (e.g. 10:00 AM, 23 Jun)" className="w-full px-3 py-2 border rounded-lg" />
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Additional notes (optional)" className="w-full px-3 py-2 border rounded-lg" rows="3" />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-3 mt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Confirm Booking</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Services({ initialServices }) {
  // Use API if available; using sample fallback when not
  const sample = [
    { id: 1, name: "Rohit Patil", role: "Plumber", avatar: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png", verified: true, rating: "5.0", available: "9AM - 6PM", contact: "+91 98765 43210", description: "Experienced plumber.", price: 400 },
    { id: 2, name: "Amit Sharma", role: "Electrician", avatar: "https://cdn-icons-png.flaticon.com/512/1055/1055644.png", verified: true, rating: "4.6", available: "10AM - 7PM", contact: "+91 98345 12345", description: "Certified electrician.", price: 500 },
  ];

  const [services, setServices] = useState(initialServices ?? sample);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = services.filter((s) => {
    const q = query.trim().toLowerCase();
    if (filter === "verified" && !s.verified) return false;
    if (!q) return true;
    return [s.name, s.role, s.description].some((f) => String(f).toLowerCase().includes(q));
  });

  const handleBook = (svc) => { setSelected(svc); setBookingOpen(true); };
  const handleConfirmBooking = (bookingInfo) => {
    setToast({ type: "success", message: `Booked ${bookingInfo.name} successfully` });
    setServices(prev => prev.map(p => p.id === bookingInfo.id ? { ...p, lastBooked: new Date().toISOString() } : p));
  };

  const handleContact = (svc) => {
    navigator.clipboard?.writeText(svc.contact).then(() => {
      setToast({ type: "info", message: `Contact ${svc.contact} copied to clipboard` });
    }).catch(() => setToast({ type: "error", message: `Could not copy contact` }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Society Services</h1>
          <p className="text-sm text-slate-500 mt-1">Verified local professionals & household services.</p>
        </div>

        <div className="flex gap-3 items-center">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, role or notes..." className="px-3 py-2 rounded-lg border border-slate-200 text-sm w-44" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">
            <option value="all">All</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </header>

      <main className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 p-8 bg-white rounded-2xl">No services found.</div>
        ) : (
          filtered.map((svc) => <ServiceCard key={svc.id} svc={svc} onBook={handleBook} onContact={handleContact} />)
        )}
      </main>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} service={selected} onConfirm={handleConfirmBooking} />

      {toast && (
        <div className={`fixed right-4 bottom-6 z-50 p-3 rounded-lg text-sm shadow-lg ${toast.type === "success" ? "bg-emerald-600 text-white" : toast.type === "error" ? "bg-red-600 text-white" : "bg-indigo-600 text-white"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
