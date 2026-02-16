// src/components/dashboard/owner/PropertyCard.jsx
import React, { useState, useContext, memo } from "react";
import { deleteProperty } from "../../../api/property";
import PropertyEditModal from "./PropertyCompo/PropertyEditModal";
import PropertyDetailsModal from "./PropertyCompo/PropertyDetailsModal";
import { AuthContext } from "../../../context/AuthContext";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  hover: { y: -6, boxShadow: "0 10px 30px rgba(2,6,23,0.08)" },
};

const imgVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.06 },
};

const btnTap = { scale: 0.96 };

function PropertyCard({ property, onUpdate }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const handleDelete = async () => {
    try {
      if (!confirm("Are you sure you want to delete this property?")) return;
      await deleteProperty(property._id || property.id);
      onUpdate && onUpdate();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete property.",
      );
    }
  };

  return (
    <>
      <motion.div
        className="bg-white rounded-lg overflow-hidden border border-gray-200"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 20,
          duration: 0.25,
        }}
      >
        <motion.div
          className="overflow-hidden"
          initial="idle"
          whileHover="hover"
          variants={imgVariants}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <img
            src={property.image || "/default-avatar.png"}
            alt={property.name}
            loading="lazy"
            className="w-full h-48 object-cover sm:h-56 transform will-change-transform"
          />
        </motion.div>

        <div className="p-4 flex flex-col gap-2">
          <h4 className="text-lg font-semibold text-gray-800">
            {property.name}
          </h4>

          {/* kept Type & Status */}
          <p className="text-gray-600 text-sm">
            <strong>Type:</strong> {property.type}
          </p>
          <p className="text-gray-600 text-sm">
            <strong>Status:</strong> {property.status}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <motion.button
              onClick={() => setDetailsOpen(true)}
              whileTap={btnTap}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
              aria-label={`View ${property.name}`}
            >
              View
            </motion.button>

            {user?.role === "OWNER" && (
              <>
                <motion.button
                  onClick={() => setEditOpen(true)}
                  whileTap={btnTap}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                  aria-label={`Edit ${property.name}`}
                >
                  Edit
                </motion.button>

                <motion.button
                  onClick={handleDelete}
                  whileTap={btnTap}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                  aria-label={`Delete ${property.name}`}
                >
                  Delete
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Details Modal */}
      {detailsOpen && (
        <PropertyDetailsModal
          property={property}
          onClose={() => setDetailsOpen(false)}
        />
      )}

      {/* Edit Modal */}
      {editOpen && (
        <PropertyEditModal
          property={property}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            setEditOpen(false);
            onUpdate && onUpdate();
          }}
        />
      )}
    </>
  );
}

export default memo(PropertyCard);
