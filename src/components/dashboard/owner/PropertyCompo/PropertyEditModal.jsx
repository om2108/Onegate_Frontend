// src/components/dashboard/owner/modals/PropertyEditModal.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { updateProperty } from "../../../../api/property";
import { getAllSocieties } from "../../../../api/society";
import { AuthContext } from "../../../../context/AuthContext";
import useCloudinaryUpload from "../../../../hooks/useUploadImage"; // ⬅️ same hook
import { motion, AnimatePresence } from "framer-motion";

export default function PropertyEditModal({ property, onClose, onSuccess }) {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: property?.name || "",
    type: property?.type || "Apartment",
    status: property?.status || "Available",
    location: property?.location || "",
    price: property?.price || "",
    image: property?.image || "",
    societyId: property?.societyId || user?.societyId || "",
  });

  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // ⛓ cloudinary upload hook
  const {
    uploadImage,
    uploading,
    progress: uploadProgress,
  } = useCloudinaryUpload();

  // load societies
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllSocieties();
        setSocieties(res || []);
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load societies",
        );
      }
    })();
  }, []);

  // autofill location for apartments
  useEffect(() => {
    if (form.type === "Apartment" && form.societyId) {
      const s = societies.find((x) => (x.id || x._id) === form.societyId);
      if (s) {
        setForm((prev) => ({
          ...prev,
          location: `${s.name}${s.address ? `, ${s.address}` : ""}`,
        }));
      }
    } else if (form.type !== "Apartment") {
      setForm((prev) => ({ ...prev, location: "" }));
    }
  }, [form.societyId, form.type, societies]);

  // prevent background scroll while modal mounted
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

  // handle file upload with validation
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ 1 MB limit
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      alert("Please select an image smaller than 1MB");
      if (fileInputRef.current) fileInputRef.current.value = null;
      return;
    }

    // ✅ ensure it's actually an image
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      if (fileInputRef.current) fileInputRef.current.value = null;
      return;
    }

    setPreviewFile(URL.createObjectURL(file));

    const url = await uploadImage(file);
    if (url) {
      setForm((p) => ({ ...p, image: url }));
    } else {
      alert("Image upload failed.");
      setPreviewFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleRemoveImage = () => {
    setForm((p) => ({ ...p, image: "" }));
    setPreviewFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  // save updated property
  const handleSave = async () => {
    if (!form.name.trim())
      return alert(
        form.type === "Apartment"
          ? "Please enter flat or apartment number"
          : "Please enter property name",
      );
    if (form.type === "Apartment" && !form.societyId)
      return alert("Please select a society for Apartment");

    const propertyId = property._id || property.id;
    if (!propertyId) {
      alert("Invalid property selected. Please refresh and try again.");
      return;
    }

    setLoading(true);
    try {
      await updateProperty(propertyId, {
        ...form,
        price: Number(form.price) || 0,
      });
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update property",
      );
    } finally {
      setLoading(false);
    }
  };

  // framer-motion variants
  const backdrop = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modal = {
    hidden: { opacity: 0, y: 10, scale: 0.995 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={backdrop}
        transition={{ duration: 0.16 }}
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
          className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative z-10"
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

          <h3 className="text-2xl font-bold mb-6 text-center text-indigo-700">
            Edit Property
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.type === "Apartment"
                  ? "Flat No / Apartment No"
                  : "Property Name"}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={
                  form.type === "Apartment"
                    ? "Enter flat or apartment number"
                    : "Enter property name"
                }
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Bungalow">Bungalow</option>
              </select>
            </div>

            {/* Society */}
            {form.type === "Apartment" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Society
                </label>
                <select
                  value={form.societyId}
                  onChange={(e) =>
                    setForm({ ...form, societyId: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select a society</option>
                  {societies.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Location */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location {form.type === "Apartment" && "(auto-filled)"}
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                readOnly={form.type === "Apartment"}
                placeholder={
                  form.type === "Apartment"
                    ? "Auto-filled from selected society"
                    : "Enter property location"
                }
                className={`w-full border rounded-md px-3 py-2 ${
                  form.type === "Apartment"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-white text-black"
                }`}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Enter price"
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Image
            </label>
            <div className="flex items-start gap-4">
              <div className="w-56 h-40 bg-gray-100 border rounded-lg overflow-hidden flex items-center justify-center">
                <AnimatePresence>
                  {previewFile ? (
                    <motion.img
                      key={previewFile}
                      src={previewFile}
                      alt="preview"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="w-full h-full object-cover"
                    />
                  ) : form.image ? (
                    <motion.img
                      key={form.image}
                      src={form.image}
                      alt="uploaded"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <motion.span
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-500 text-sm"
                    >
                      No image
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="editImage"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700 inline-block"
                >
                  Choose Image
                </label>
                <input
                  id="editImage"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {(form.image || previewFile) && (
                  <motion.button
                    onClick={handleRemoveImage}
                    whileTap={{ scale: 0.96 }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </motion.button>
                )}
                {uploading && (
                  <div className="text-sm text-gray-600">
                    Uploading... {uploadProgress}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.96 }}
              className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSave}
              whileTap={{ scale: 0.98 }}
              disabled={loading || uploading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Update Property"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
