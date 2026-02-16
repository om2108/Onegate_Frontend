// src/components/dashboard/owner/PropertyCompo/AddPropertyModal.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { addProperty } from "../../../../api/property";
import { getAllSocieties, createSociety } from "../../../../api/society";
import { AuthContext } from "../../../../context/AuthContext";
import useCloudinaryUpload from "../../../../hooks/useUploadImage"; // ⬅️ use same hook as ProfileModal
import { motion, AnimatePresence } from "framer-motion";

export default function AddPropertyModal({ onClose, onSuccess }) {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    type: "Apartment",
    status: "Available",
    location: "",
    price: "",
    image: "",
    societyId: user?.societyId || "",
  });

  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [addingSociety, setAddingSociety] = useState(false);
  const [newSociety, setNewSociety] = useState({ name: "", address: "" });

  // 🔗 cloudinary upload hook (same as profile)
  const {
    uploadImage,
    uploading,
    progress: uploadProgress,
  } = useCloudinaryUpload();

  // load societies
  useEffect(() => {
    (async () => {
      try {
        const s = await getAllSocieties();
        setSocieties(s || []);
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load societies",
        );
      }
    })();
  }, []);

  // autofill location for apartment
  useEffect(() => {
    if (form.type === "Apartment" && form.societyId && !addingSociety) {
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
  }, [form.societyId, form.type, societies, addingSociety]);

  // prevent background scroll while open (modal is mounted)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // upload file with size & type validation
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

  // add new society
  const handleAddSociety = async () => {
    if (!newSociety.name.trim()) {
      alert("Please enter society name");
      return;
    }
    try {
      const added = await createSociety(newSociety);
      setSocieties((prev) => [...prev, added]);
      setForm((prev) => ({ ...prev, societyId: added._id || added.id }));
      setAddingSociety(false);
      setNewSociety({ name: "", address: "" });
    } catch (err) {
      alert(
        err?.response?.data?.message || err?.message || "Failed to add society",
      );
    }
  };

  // save property
  const handleSave = async () => {
    if (!form.name.trim())
      return alert(
        form.type === "Apartment"
          ? "Please enter flat or apartment number"
          : "Please enter property name",
      );
    if (form.type === "Apartment" && !form.societyId)
      return alert("Please select a society for Apartment");

    setLoading(true);
    try {
      await addProperty({
        name: form.name.trim(),
        type: form.type,
        status: form.status,
        location: form.location,
        price: Number(form.price) || 0,
        image: form.image,
        societyId: form.type === "Apartment" ? form.societyId : null,
      });

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save property",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- framer-motion variants ---------- */
  const backdrop = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modal = {
    hidden: { opacity: 0, y: 12, scale: 0.995 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };
  const formGroup = {
    hidden: { opacity: 0, y: 6 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03 } }),
  };
  const collapse = {
    collapsed: { height: 0, opacity: 0, overflow: "hidden" },
    open: { height: "auto", opacity: 1, overflow: "hidden" },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center"
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
          className="relative bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl z-10"
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

          <motion.h3
            className="text-2xl font-bold mb-6 text-center text-indigo-700"
            variants={formGroup}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            Add New Property
          </motion.h3>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
          >
            {/* name */}
            <motion.div variants={formGroup} custom={1}>
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
            </motion.div>

            {/* type */}
            <motion.div variants={formGroup} custom={2}>
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
            </motion.div>

            {/* society (if apartment) */}
            {form.type === "Apartment" && (
              <motion.div
                className="md:col-span-2"
                variants={formGroup}
                custom={3}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Society
                </label>

                <div className="flex gap-2 items-start">
                  <select
                    value={addingSociety ? "add-new" : form.societyId}
                    onChange={(e) => {
                      if (e.target.value === "add-new") {
                        setAddingSociety(true);
                        setForm({ ...form, societyId: "" });
                      } else {
                        setAddingSociety(false);
                        setForm({ ...form, societyId: e.target.value });
                      }
                    }}
                    className="flex-1 border rounded-md px-3 py-2"
                  >
                    <option value="">Select a society</option>
                    {societies.map((s) => (
                      <option key={s._id || s.id} value={s._id || s.id}>
                        {s.name}
                      </option>
                    ))}
                    <option value="add-new">➕ Add New Society</option>
                  </select>
                </div>

                {/* collapse: add new society form */}
                <AnimatePresence initial={false}>
                  {addingSociety && (
                    <motion.div
                      variants={collapse}
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="border p-3 rounded-md bg-gray-50 mt-3"
                    >
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="Society Name"
                          value={newSociety.name}
                          onChange={(e) =>
                            setNewSociety({
                              ...newSociety,
                              name: e.target.value,
                            })
                          }
                          className="border rounded-md px-3 py-2"
                        />
                        <input
                          type="text"
                          placeholder="Society Address (optional)"
                          value={newSociety.address}
                          onChange={(e) =>
                            setNewSociety({
                              ...newSociety,
                              address: e.target.value,
                            })
                          }
                          className="border rounded-md px-3 py-2"
                        />
                        <div className="flex justify-end gap-2">
                          <motion.button
                            onClick={() => setAddingSociety(false)}
                            whileTap={{ scale: 0.96 }}
                            className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            onClick={handleAddSociety}
                            whileTap={{ scale: 0.96 }}
                            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Save
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* location */}
            <motion.div
              className="md:col-span-2"
              variants={formGroup}
              custom={4}
            >
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
            </motion.div>

            {/* price */}
            <motion.div variants={formGroup} custom={5}>
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
            </motion.div>

            {/* status */}
            <motion.div variants={formGroup} custom={6}>
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
            </motion.div>
          </motion.div>

          {/* image upload */}
          <motion.div
            className="mt-4"
            variants={formGroup}
            initial="hidden"
            animate="visible"
            custom={7}
          >
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
                  htmlFor="propertyImage"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700 inline-block"
                >
                  Choose Image
                </label>
                <input
                  id="propertyImage"
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
          </motion.div>

          {/* actions */}
          <motion.div
            className="mt-6 flex justify-end gap-3"
            variants={formGroup}
            custom={8}
          >
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
              {loading ? "Saving..." : "Add Property"}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
