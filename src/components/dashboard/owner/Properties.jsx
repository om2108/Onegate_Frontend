import React, { useState, useEffect, useMemo } from "react";
import PropertyFilters from "./PropertyCompo/PropertyFilters";
import PropertiesGrid from "./PropertyCompo/PropertiesGrid";
import { getAllProperties } from "../../../api/property";

export default function Properties() {
  const [propertiesData, setPropertiesData] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    status: "",
    minPrice: "",
    maxPrice: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    locations: [],
    types: [],
    statuses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🏠 Fetch all properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllProperties();
        setPropertiesData(data);

        // 🔹 Extract unique filter values
        const locations = [
          ...new Set(data.map((p) => p.location).filter(Boolean)),
        ];
        const types = [...new Set(data.map((p) => p.type).filter(Boolean))];
        const statuses = [
          ...new Set(data.map((p) => p.status).filter(Boolean)),
        ];

        setFilterOptions({ locations, types, statuses });
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load properties.",
        );
        setError("Failed to load properties. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // 🔍 Apply filters
  const filteredProperties = useMemo(() => {
    return propertiesData.filter((p) => {
      const matchesLocation =
        !filters.location ||
        p.location?.toLowerCase().includes(filters.location.toLowerCase());
      const matchesType = !filters.type || p.type === filters.type;
      const matchesStatus = !filters.status || p.status === filters.status;
      const matchesMinPrice =
        !filters.minPrice || p.price >= Number(filters.minPrice);
      const matchesMaxPrice =
        !filters.maxPrice || p.price <= Number(filters.maxPrice);

      return (
        matchesLocation &&
        matchesType &&
        matchesStatus &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [filters, propertiesData]);

  // 🧩 UI rendering states
  if (loading)
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Loading properties...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 font-medium mt-6">{error}</div>
    );

  if (!propertiesData.length)
    return (
      <div className="text-center text-gray-500 mt-6">
        No properties found in the system.
      </div>
    );

  return (
    <div className="properties-page container mx-auto p-4">
      {/* Filters */}
      <PropertyFilters
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
      />

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <PropertiesGrid properties={filteredProperties} />
      ) : (
        <p className="text-gray-500 text-center mt-6">
          No properties match your filters.
        </p>
      )}
    </div>
  );
}
