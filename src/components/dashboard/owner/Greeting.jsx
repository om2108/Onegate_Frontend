import React, { useState } from "react";
import AddPropertyModal from "./PropertyCompo/AddPropertyModal";

export default function Greeting({ onPropertyAdded }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-4 sm:px-0">
      {/* 👋 Greeting text */}
      <div className="flex flex-col">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Welcome Sir, <span className="text-indigo-600">Owner</span>
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your properties and tenants easily.
        </p>
      </div>

      {/* ➕ Add Property Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full sm:w-auto bg-indigo-600 text-white text-sm sm:text-base px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 active:scale-[0.98] transition"
      >
        + Add Property
      </button>

      {/* 🏠 Add Property Modal */}
      {isModalOpen && (
        <AddPropertyModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={onPropertyAdded}
        />
      )}
    </section>
  );
}
