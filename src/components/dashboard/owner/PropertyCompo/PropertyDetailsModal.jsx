// src/components/dashboard/owner/PropertyCompo/PropertyDetailsModal.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Try to import getSociety if available; fallback to getAllSocieties
import { getAllSocieties as apiGetSociety } from "../../../../api/society";

/**
 * PropertyDetailsModal
 * - Shows property details + society details (if property.societyId present)
 * - Animations via framer-motion (keeps your previous behaviour)
 */
export default function PropertyDetailsModal({ property, onClose }) {
  if (!property) return null;

  const [society, setSociety] = useState(null);
  const [societyLoading, setSocietyLoading] = useState(false);
  const [societyErr, setSocietyErr] = useState("");

  // fetch society details (tries getSociety; if not available, falls back to getAllSocieties)
  useEffect(() => {
    let mounted = true;
    const fetchSociety = async () => {
      if (!property?.societyId) return setSociety(null);

      setSocietyLoading(true);
      setSocietyErr("");
      try {
        // Try direct getSociety API if exported
        if (typeof apiGetSociety === "function") {
          const s = await apiGetSociety(property.societyId);
          if (!mounted) return;
          setSociety(s || null);
          return;
        }

        // Fallback: load all societies and find the matching one
        const all = await getAllSocieties();
        if (!mounted) return;
        const found = Array.isArray(all)
          ? all.find(
              (x) => String(x._id || x.id) === String(property.societyId),
            )
          : null;
        setSociety(found || null);
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load society details",
        );
        if (!mounted) return;
        setSocietyErr("Could not load society details.");
        setSociety(null);
      } finally {
        if (mounted) setSocietyLoading(false);
      }
    };

    fetchSociety();
    return () => {
      mounted = false;
    };
  }, [property?.societyId]);

  // prevent background scroll while modal open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const backdrop = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modal = {
    hidden: { opacity: 0, y: 12, scale: 0.995 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <AnimatePresence>
      <motion.div
        key={property._id || property.id}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={backdrop}
        transition={{ duration: 0.18 }}
        aria-modal="true"
        role="dialog"
      >
        {/* clickable backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 relative z-10"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={modal}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-600 text-xl"
            aria-label="Close"
          >
            ✕
          </button>

          <h3 className="text-xl font-semibold mb-4">{property.name}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden mb-3">
                <AnimatePresence>
                  <motion.img
                    key={property.image || "no-image"}
                    src={property.image || "/default-avatar.png"}
                    alt={property.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.22 }}
                  />
                </AnimatePresence>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <div>
                  <strong>Type:</strong> {property.type}
                </div>
                <div>
                  <strong>Status:</strong> {property.status}
                </div>
                <div>
                  <strong>Price:</strong> {property.price}
                </div>
                <div>
                  <strong>Society ID:</strong> {property.societyId || "—"}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 text-gray-700">
                <strong>Location</strong>
                <div className="mt-1 text-sm text-gray-600">
                  {property.location || "—"}
                </div>
              </div>

              {/* Society details area */}
              <div className="mb-2 text-gray-700">
                <strong>Society</strong>
                <div className="mt-2">
                  {societyLoading ? (
                    <div className="text-sm text-gray-500">
                      Loading society details…
                    </div>
                  ) : societyErr ? (
                    <div className="text-sm text-rose-600">{societyErr}</div>
                  ) : society ? (
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="font-medium text-gray-800">
                        {society.name}
                      </div>
                      {society.address && <div>{society.address}</div>}
                      {society.contactPhone && (
                        <div>Phone: {society.contactPhone}</div>
                      )}
                      {society.contactEmail && (
                        <div>Email: {society.contactEmail}</div>
                      )}
                      {/* show additional fields if available */}
                      {society.managerName && (
                        <div>Manager: {society.managerName}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No society information available.
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-2 text-gray-700">
                <strong>Created</strong>
                <div className="mt-1 text-sm text-gray-600">
                  {property.createdAt
                    ? new Date(property.createdAt).toLocaleString()
                    : "—"}
                </div>
              </div>

              <div className="mt-4">
                <strong className="text-gray-700">Description</strong>
                <div className="mt-1 text-sm text-gray-600">
                  {property.description || "No description provided."}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
