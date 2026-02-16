import React, { memo } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

function PropertyFilters({ filters, setFilters, filterOptions }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    // numeric fields: coerce to number or empty string
    if (name === "minPrice" || name === "maxPrice") {
      const v = e.target.value === "" ? "" : Number(e.target.value);
      setFilters((prev) => ({ ...prev, [name]: v }));
      return;
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      location: "",
      type: "",
      status: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200 rounded-2xl p-6 mb-8 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 border-b pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-indigo-600 w-5 h-5" />
          <h3 className="text-xl font-semibold text-gray-800">Property Filters</h3>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Filter Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Location */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Location</label>
          <select
            name="location"
            value={filters.location}
            onChange={handleChange}
            className="border border-gray-300 bg-gray-50 hover:bg-white rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="">All Locations</option>
            {(filterOptions?.locations || []).map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Property Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="border border-gray-300 bg-gray-50 hover:bg-white rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="">All Types</option>
            {(filterOptions?.types || []).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="border border-gray-300 bg-gray-50 hover:bg-white rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="">All Status</option>
            {(filterOptions?.statuses || []).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Price Range (₹)</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              value={filters.minPrice}
              onChange={handleChange}
              className="border border-gray-300 bg-gray-50 hover:bg-white rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full transition-all"
              min="0"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={handleChange}
              className="border border-gray-300 bg-gray-50 hover:bg-white rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full transition-all"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(PropertyFilters);
