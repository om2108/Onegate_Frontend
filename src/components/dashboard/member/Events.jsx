import React, { useEffect, useState } from "react";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../../api/event";

function EventCard({ item, onDetails }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-5">
        <h3 className="text-lg font-semibold text-indigo-600">{item.title}</h3>
        <p className="text-sm text-slate-600 mt-2">{item.description}</p>
        <div className="flex items-center justify-between gap-3 mt-4">
          {item.joinable && (
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
              Join
            </button>
          )}
          <button
            onClick={() => onDetails(item)}
            className="px-4 py-2 bg-slate-100 text-sm rounded-lg hover:bg-slate-200"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function EventModal({ open, onClose, event }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-indigo-600">
          {event?.title}
        </h3>
        <p className="text-sm text-slate-600 mt-3">{event?.description}</p>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // ✅ REAL SOCIETY ID (example)
        const societyId = "691581042f3a1d3d7fdf35fe";

        // ✅ roles taken from your logged in user
        // (you can also store roles in localStorage)
        const roles = ["OWNER", "SECRETARY"]; // change as per login

        const events = await getEvents(societyId, roles);

        if (!mounted) return;

        const arr = Array.isArray(events) ? events : [];
        const now = new Date();

        // ✅ backend uses "dateTime" not "date"
        setUpcoming(
          arr.filter((e) => !e.dateTime || new Date(e.dateTime) >= now),
        );
        setPast(arr.filter((e) => e.dateTime && new Date(e.dateTime) < now));
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load events.",
        );
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const openDetails = (ev) => {
    setActiveEvent(ev);
    setModalOpen(true);
  };

  const handleCreate = async (payload) => {
    try {
      const created = await createEvent(payload);
      setUpcoming((prev) => [created, ...prev]);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create event.",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete event?")) return;
    try {
      await deleteEvent(id);
      setUpcoming((prev) => prev.filter((e) => e.id !== id));
      setPast((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete event.",
      );
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const updated = await updateEvent(id, data);
      setUpcoming((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setPast((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update event.",
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-2xl font-semibold text-slate-900">Upcoming Events</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {upcoming.map((ev) => (
          <EventCard key={ev.id} item={ev} onDetails={openDetails} />
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-slate-900 mt-12">
        Past Events
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {past.map((ev) => (
          <EventCard key={ev.id} item={ev} onDetails={openDetails} />
        ))}
      </div>

      <EventModal
        open={modalOpen}
        event={activeEvent}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
