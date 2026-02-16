// src/components/profile/ProfileModal.jsx
import React, { useEffect, useRef, useState, useContext } from "react";
import { getProfile, updateProfile } from "../../api/profile";
import { getUserById } from "../../api/user"; // ⬅️ NEW
import useCloudinaryUpload from "../../hooks/useUploadImage";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaCamera,
  FaPen,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../context/AuthContext"; // ⬅️ NEW
import { validateAadhaar } from "../../util/aadhaarValidator";

import { extractTextFromImage } from "../../util/ocr";

const calculateProfileCompletion = (profile, documents) => {
  const fields = [
    profile?.fullName,
    profile?.phone,
    profile?.address,
    profile?.image,
    documents?.aadhaar,
    documents?.pan,
    documents?.passportPhoto,
  ];

  const completed = fields.filter((f) => f && String(f).trim() !== "").length;

  return Math.round((completed / fields.length) * 100);
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function ProfileModal({ isOpen, onClose }) {
  const { user } = useContext(AuthContext); // ⬅️ to know current user id
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [editing, setEditing] = useState({});
  const [draft, setDraft] = useState({});

  const [savingField, setSavingField] = useState("");

  const [preview, setPreview] = useState(null);
  const [uploadingFor, setUploadingFor] = useState("");
  const [documents, setDocuments] = useState({
    aadhaar: "",
    pan: "",
    passportPhoto: "",
  });
  const completionPercent = calculateProfileCompletion(profile, documents);
  const isProfileComplete = completionPercent === 100;

  const fileInputRef = useRef(null);
  const firstInputRef = useRef(null);
  const { uploadImage, uploading, progress } = useCloudinaryUpload();

  const [userEmail, setUserEmail] = useState(""); // ⬅️ email from /users API

  // 🔑 helper: always send full PROFILE data (no email)

  const buildPayload = (overrides = {}) => {
    const base = {
      fullName: draft.fullName ?? profile?.fullName ?? "",
      phone: draft.phone ?? profile?.phone ?? "",
      address: draft.address ?? profile?.address ?? "",
      image: profile?.image ?? "",
      aadhaar: documents.aadhaar || profile?.aadhaar || "",
      pan: documents.pan || profile?.pan || "",
      passportPhoto: documents.passportPhoto || profile?.passportPhoto || "",
    };

    return { ...base, ...overrides };
  };

  // Prevent background scroll when modal open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Load profile + user email when opening
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const [profileRes, userRes] = await Promise.all([
          getProfile(),
          user?.id || user?._id
            ? getUserById(user.id || user._id)
            : Promise.resolve(null),
        ]);

        if (!mounted) return;

        const safeProfile = profileRes || {};
        setProfile(safeProfile);
        setDocuments({
          aadhaar: safeProfile?.aadhaar || "",
          pan: safeProfile?.pan || "",
          passportPhoto: safeProfile?.passportPhoto || "",
        });

        setDraft({
          fullName: safeProfile?.fullName || "",
          phone: safeProfile?.phone || "",
          address: safeProfile?.address || "",
        });

        setUserEmail(userRes?.email || user?.email || "");
        setEditing({});
        setPreview(null);
      } catch (e) {
        alert(
          e?.response?.data?.message ||
            e?.message ||
            "Could not save. Please try again.",
        );
        if (mounted) setErr("Failed to load profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isOpen, user]);

  // Focus first input when opening
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        if (firstInputRef.current) firstInputRef.current.focus();
      }, 170);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const toggleEdit = (field, on = undefined) => {
    setEditing((prev) => ({ ...prev, [field]: on ?? !prev[field] }));
    if (on === false && profile) {
      setDraft((p) => ({ ...p, [field]: profile[field] || "" }));
    }
    if (on === true) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  };

  // Update one field in UI, but send full profile object to backend (no email)
  const saveField = async (field) => {
    if (!profile) return;

    const newVal = draft[field] ?? "";

    // VALIDATION HERE
    const errorMessage = validateField(field, newVal);
    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    if ((profile[field] || "") === (newVal || "")) {
      toggleEdit(field, false);
      return;
    }

    try {
      setSavingField(field);

      const payload = buildPayload({ [field]: newVal });

      const updated = await updateProfile(payload);

      setProfile(updated);

      // ✅ CRITICAL: sync draft with fresh DB values
      setDraft({
        fullName: updated.fullName || "",
        phone: updated.phone || "",
        address: updated.address || "",
      });

      toggleEdit(field, false);
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Could not save. Please try again.",
      );
    } finally {
      setSavingField("");
    }
  };

  // Avatar upload – also only profile fields
  const onAvatarPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);

    try {
      const url = await uploadImage(file);
      if (url) {
        const payload = buildPayload({ image: url });
        const updated = await updateProfile(payload);
        setProfile(updated);
      }
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload image.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onDocumentPick = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      alert("Only JPG, JPEG, PNG formats allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("File must be less than 2MB");
      return;
    }

    setUploadingFor(field);

    try {
      const url = await uploadImage(file);

      // OCR VALIDATION
      if (field === "aadhaar" || field === "pan") {
        const ocrResult = await extractTextFromImage(url);

        if (!ocrResult || !ocrResult.text) {
          alert("❌ Unable to read text, upload a clearer image");
          return;
        }

        // -------- Aadhaar Handling --------
        if (field === "aadhaar") {
          const aadhaarMatch = ocrResult.text.match(
            /\b\d{4}\s?\d{4}\s?\d{4}\b/,
          );

          if (!aadhaarMatch) {
            alert("❌ Aadhaar number not detected. Upload a clearer picture.");
            return;
          }

          const aadhaarNumber = aadhaarMatch[0].replace(/\s+/g, "");

          // CHECKSUM VALIDATION (fake detection)
          if (!validateAadhaar(aadhaarNumber)) {
            alert(
              "❌ Invalid Aadhaar (checksum failed). Possibly fake or incorrect.",
            );
            return;
          }
        }

        // -------- PAN Handling --------
        if (field === "pan") {
          const panMatch = ocrResult.text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);

          if (!panMatch) {
            alert("❌ Invalid PAN format. Please upload a proper PAN card.");
            return;
          }
        }
      }

      // SAVE VALID DOCUMENT IN DB
      const payload = buildPayload({ [field]: url });
      const updated = await updateProfile(payload);
      setProfile(updated);
      setDocuments((d) => ({ ...d, [field]: url }));
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload document",
      );
    } finally {
      setUploadingFor("");
    }
  };

  // Validation for Full Name, Phone, Address
  const validateField = (field, value) => {
    switch (field) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 3)
          return "Full name must be at least 3 characters";
        if (!/^[a-zA-Z ]+$/.test(value))
          return "Name must contain only letters";
        return "";

      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^[0-9]{10}$/.test(value))
          return "Enter a valid 10-digit phone number";
        return "";

      case "address":
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 10)
          return "Address must be at least 10 characters";
        return "";

      default:
        return "";
    }
  };

  const safe = (v) => (v && String(v).trim() ? v : "—");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={{ duration: 0.18 }}
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden="true"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Profile"
            className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-y-auto max-h-[90vh] z-10"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalVariants}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {/* top accent */}
            <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500" />

            {/* Header + avatar */}
            <div className="relative pt-6 pb-6 px-6 bg-white">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-500 hover:text-rose-600 text-xl"
                aria-label="Close"
              >
                ✕
              </button>

              <h2 className="text-center text-xl sm:text-2xl font-semibold text-gray-900">
                Profile
              </h2>

              <div className="mt-6 flex justify-center">
                <div className="relative">
                  <img
                    src={
                      preview ||
                      profile?.image ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt="Avatar"
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow"
                  />
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-1 right-1 grid place-items-center w-9 h-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow"
                    title="Change photo"
                  >
                    <FaCamera size={14} />
                  </label>
                  <input
                    id="profileImage"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onAvatarPick}
                    className="hidden"
                  />
                </div>
              </div>

              {uploadingAvatar && (
                <p className="mt-3 text-center text-xs text-blue-600 font-semibold">
                  Uploading photo… {Math.round(progress)}%
                </p>
              )}
            </div>
            {/* Profile Completion */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Profile Completion</span>
                <span>{completionPercent}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    completionPercent === 100 ? "bg-green-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              {completionPercent < 100 && (
                <p className="mt-1 text-xs text-amber-600 font-medium">
                  ⚠ Complete your profile to request property
                </p>
              )}
            </div>

            {/* Body */}
            <div className="px-6 pb-6">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mx-auto" />
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : err ? (
                <div className="text-center text-rose-600">{err}</div>
              ) : (
                <>
                  <EditableInfoRow
                    icon={<FaUser className="text-blue-600" />}
                    label="Full Name"
                    value={profile?.fullName}
                    draft={draft.fullName}
                    editing={!!editing.fullName}
                    onEdit={() => toggleEdit("fullName", true)}
                    onCancel={() => toggleEdit("fullName", false)}
                    onChange={(v) => setDraft((d) => ({ ...d, fullName: v }))}
                    onSave={() => saveField("fullName")}
                    saving={savingField === "fullName"}
                    inputRef={firstInputRef}
                  />

                  <EditableInfoRow
                    icon={<FaPhone className="text-blue-600" />}
                    label="Phone"
                    value={profile?.phone}
                    draft={draft.phone}
                    editing={!!editing.phone}
                    onEdit={() => toggleEdit("phone", true)}
                    onCancel={() => toggleEdit("phone", false)}
                    onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
                    onSave={() => saveField("phone")}
                    saving={savingField === "phone"}
                    inputProps={{
                      type: "tel",
                      placeholder: "Enter phone number",
                    }}
                  />

                  <EditableInfoRow
                    icon={<FaMapMarkerAlt className="text-blue-600" />}
                    label="Address"
                    value={profile?.address}
                    draft={draft.address}
                    editing={!!editing.address}
                    onEdit={() => toggleEdit("address", true)}
                    onCancel={() => toggleEdit("address", false)}
                    onChange={(v) => setDraft((d) => ({ ...d, address: v }))}
                    onSave={() => saveField("address")}
                    saving={savingField === "address"}
                    inputAsTextArea
                  />

                  {/* Email is read-only, comes from users API */}
                  <StaticInfoRow
                    icon={<FaEnvelope className="text-gray-500" />}
                    label="Email"
                    value={safe(userEmail)}
                  />
                  {/* ------------ DOCUMENT UPLOAD SECTION -------------- */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Documents
                    </h3>

                    <div className="space-y-4">
                      {/* Single Item Component */}
                      <DocumentItem
                        label="Aadhaar Card"
                        field="aadhaar"
                        value={documents.aadhaar}
                        onPick={onDocumentPick}
                        uploadingFor={uploadingFor}
                        progress={progress}
                      />

                      <DocumentItem
                        label="PAN Card"
                        field="pan"
                        value={documents.pan}
                        onPick={onDocumentPick}
                        uploadingFor={uploadingFor}
                        progress={progress}
                      />

                      <DocumentItem
                        label="Passport Size Photo"
                        field="passportPhoto"
                        value={documents.passportPhoto}
                        onPick={onDocumentPick}
                        uploadingFor={uploadingFor}
                        progress={progress}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function DocumentItem({ label, value, field, onPick, uploadingFor, progress }) {
  return (
    <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-sm flex justify-between items-center">
      <div className="w-2/3">
        <p className="font-medium text-gray-800">{label}</p>

        {uploadingFor === field && (
          <p className="text-xs text-blue-600 mt-1 font-semibold">
            Uploading… {Math.round(progress)}%
          </p>
        )}

        {value && uploadingFor !== field && (
          <span className="inline-block mt-1 text-green-600 text-xs font-semibold">
            ✓ Uploaded
          </span>
        )}

        {!value && uploadingFor !== field && (
          <span className="inline-block mt-1 text-gray-400 text-xs">
            Not Uploaded
          </span>
        )}

        {value && uploadingFor !== field && (
          <a
            href={value}
            target="_blank"
            className="block text-blue-600 underline text-xs mt-1"
          >
            View File
          </a>
        )}
      </div>

      <label className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-700">
        {value ? "Replace" : "Upload"}
        <input
          type="file"
          className="hidden"
          onChange={(e) => onPick(e, field)}
        />
      </label>
    </div>
  );
}

/* ---------------- Subcomponents ---------------- */

function StaticInfoRow({ icon, label, value }) {
  const show = value && String(value).trim() ? value : "—";
  return (
    <div className="flex items-start gap-3 bg-white/80 border border-gray-100 rounded-xl p-2 shadow-sm mb-2">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{show}</p>
      </div>
    </div>
  );
}

function EditableInfoRow({
  icon,
  label,
  value,
  draft,
  editing,
  onEdit,
  onCancel,
  onChange,
  onSave,
  saving,
  inputProps,
  inputAsTextArea = false,
  inputRef,
}) {
  const show = value && String(value).trim() ? value : "—";

  return (
    <div className="flex items-start gap-3 bg-white/80 border border-gray-100 rounded-xl p-2 shadow-sm mb-2">
      <div className="mt-0.5">{icon}</div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{label}</p>

          {!editing ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <FaPen className="text-gray-500" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={onSave}
                className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${
                  saving
                    ? "bg-blue-300 text-white cursor-wait"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <FaCheck /> {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          )}
        </div>

        {!editing ? (
          <p className="text-sm font-medium text-gray-800 mt-1 break-words">
            {show}
          </p>
        ) : inputAsTextArea ? (
          <textarea
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter value"
            {...(inputProps || {})}
            ref={inputRef}
          />
        ) : (
          <input
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter value"
            {...(inputProps || {})}
            ref={inputRef}
          />
        )}
      </div>
    </div>
  );
}
