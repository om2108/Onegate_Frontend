import React, { memo } from "react";
import PropertyCard from "../PropertyCard";

function PropertiesGrid({ properties, onUpdate }) {
  if (!properties || properties.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-6 text-lg">
        No properties found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {properties.map((property) => (
        <PropertyCard
          key={property._id || property.id}
          property={property}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

export default memo(PropertiesGrid);
