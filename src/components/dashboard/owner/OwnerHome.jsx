// src/components/dashboard/owner/OwnerHome.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import Greeting from "./Greeting";
import PropertyCard from "./PropertyCard";
import Payments from "./Payments";
import Rightbar from "./Rightbar";
import { getAllProperties } from "../../../api/property";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function OwnerHome() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [sortBy, setSortBy] = useState("created"); // created | priceAsc | priceDesc | name

  // global search support (?search=...)
  const location = useLocation();
  const searchTerm =
    new URLSearchParams(location.search).get("search")?.trim().toLowerCase() ||
    "";

  // 🔹 Fetch with an option to show/hide big loading spinner
  const fetchProperties = useCallback(async (showSpinner = true) => {
    try {
      setErr("");
      if (showSpinner) setLoading(true);
      const data = await getAllProperties();
      const list = Array.isArray(data) ? data : [];
      setProperties(list);

      // cache in sessionStorage for fast revisit
      try {
        sessionStorage.setItem("owner_properties", JSON.stringify(list));
      } catch (e) {
        alert(e?.message || "Failed to cache properties");
      }
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to fetch properties",
      );
      setErr("Could not load properties. Please try again.");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 🔹 Try to load from cache first for instant UI when revisiting
    let hasCache = false;
    try {
      const cached = sessionStorage.getItem("owner_properties");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setProperties(parsed);
          setLoading(false); // don't show skeleton if we have cached data
          hasCache = true;
        }
      }
    } catch (e) {
      alert(e?.message || "Failed to read cached properties");
    }

    // If we had cache → refresh in background (no skeleton)
    // If no cache → show skeleton during first load
    fetchProperties(!hasCache);
  }, [fetchProperties]);

  const filtered = useMemo(() => {
    let list = [...properties];

    if (searchTerm) {
      list = list.filter((p) => {
        const haystack = [
          p.name,
          p.area,
          p.location,
          p.society,
          p.description,
          String(p.price ?? ""),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchTerm);
      });
    }

    switch (sortBy) {
      case "priceAsc":
        list.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "priceDesc":
        list.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name":
        list.sort((a, b) => String(a.name || "").localeCompare(b.name || ""));
        break;
      default: // "created" — newest first if timestamps exist
        list.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
    }

    return list;
  }, [properties, searchTerm, sortBy]);

  const VISIBLE_COUNT = 6;
  const visibleProperties = filtered.slice(0, VISIBLE_COUNT);
  const hasMore = filtered.length > VISIBLE_COUNT;

  // 🔹 Only show big skeleton if we truly have no data yet (first ever load)
  const showSkeleton = loading && properties.length === 0;

  if (showSkeleton) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-gray-200 overflow-hidden"
              >
                <div className="aspect-[16/10] bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 overflow-auto"
    >
      {/* Main column */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Greeting can open add-property modal; refetch on add */}
        <motion.div
          layout
          initial="hidden"
          animate="enter"
          variants={itemVariants}
        >
          <Greeting onPropertyAdded={() => fetchProperties(true)} />
        </motion.div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              My Properties
            </h3>
            <p className="text-sm text-gray-500">
              Showing {Math.min(filtered.length, VISIBLE_COUNT)} of{" "}
              {filtered.length} result
              {filtered.length === 1 ? "" : "s"}
              {searchTerm && (
                <>
                  {" "}
                  for <span className="font-medium">“{searchTerm}”</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="created">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="name">Name (A–Z)</option>
            </select>

            {/* Animated Refresh Button */}
            <motion.button
              onClick={() => fetchProperties(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 text-sm"
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={
                loading
                  ? { repeat: Infinity, duration: 1, ease: "linear" }
                  : { duration: 0.25 }
              }
              aria-label="Refresh properties"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Errors */}
        {err && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-sm"
          >
            {err}
          </motion.div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-200 bg-white p-8 text-center"
          >
            <p className="text-gray-700 font-medium mb-1">
              No properties found
            </p>
            <p className="text-gray-500 text-sm">
              Try changing filters or add a new property from the greeting card.
            </p>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {visibleProperties.map((property) => (
                  <motion.div
                    key={property.id || property._id}
                    layout
                    initial="hidden"
                    animate="enter"
                    exit="exit"
                    variants={itemVariants}
                    transition={{ duration: 0.18 }}
                    className="h-full"
                  >
                    <PropertyCard
                      property={property}
                      onUpdate={() => fetchProperties(false)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Show more button */}
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Link
                  to="/dashboard/owner/properties"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm"
                  aria-label="Show more properties"
                >
                  Show more ({filtered.length - VISIBLE_COUNT} more)
                </Link>
              </div>
            )}
          </>
        )}

        {/* Owner payments widget */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="text-base font-semibold mb-3">Payments</h3>

          {/* ensure the container has an explicit height and doesn't collapse */}
          <div className="w-full h-72 min-w-0">
            <Payments />
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="lg:sticky lg:top-20">
          <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Rightbar />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
