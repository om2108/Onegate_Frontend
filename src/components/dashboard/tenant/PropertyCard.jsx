// src/components/dashboard/PropertyCard.jsx
import React from "react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function PropertyCard({ property, onAction, profileComplete }) {
  const {
    name,
    image,
    area,
    location,
    price,
    rating,
    verified,
    type,
    status,
    society,
  } = property || {};

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-[16/10] bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={name || "Property"}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

        {/* Verified badge */}
        {verified && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded-md bg-green-600 text-white">
            Verified
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-1">
          {name || "Untitled Property"}
        </h3>

        {/* Meta */}
        <p className="text-sm text-gray-600 line-clamp-1">
          {(area && `${area} • `) || ""}
          {location || "Unknown location"}
        </p>

        {/* Optional chips */}
        {(type || status || society) && (
          <div className="flex flex-wrap gap-2 mt-1">
            {type && (
              <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                {type}
              </span>
            )}
            {status && (
              <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                {status}
              </span>
            )}
            {society && (
              <span className="px-2 py-0.5 text-xs rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {society}
              </span>
            )}
          </div>
        )}

        {/* Price + Rating */}
        <div className="flex items-center justify-between mt-1.5">
          <p className="font-extrabold text-gray-900">
            {inr.format(Number(price || 0))}
          </p>
          {typeof rating !== "undefined" && rating !== null ? (
            <p className="text-sm text-gray-700">⭐ {rating}/5</p>
          ) : (
            <p className="text-sm text-gray-400">No rating</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onAction?.("view", property)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 transition text-sm"
            aria-label={`View ${name || "property"}`}
          >
            View
          </button>
          <div className="relative group inline-block">
  <button
  disabled={!profileComplete}
  onClick={() => {
    if (!profileComplete) return;
    onAction?.("request", property);
  }}
  className={`px-3 py-2 rounded-lg transition text-sm ${
    profileComplete
      ? "border border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
      : "border border-gray-300 bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  Request
</button>


  {!profileComplete && (
    <div
      className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        bg-black text-white text-xs px-2 py-1 rounded
        opacity-0 group-hover:opacity-100
        transition-opacity duration-100
        pointer-events-none
        whitespace-nowrap
      "
    >
      Complete profile before requesting property
    </div>
  )}
</div>



        </div>
      </div>
    </article>
  );
}