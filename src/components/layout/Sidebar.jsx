// src/components/layout/Sidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  EyeIcon,
  BellIcon,
  CalendarDaysIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";

// links map (unchanged)
const linksMap = {
  USER: [
  { name: "Dashboard", path: "/dashboard/user", icon: HomeIcon },
  {
    name: "Past Requests",
    path: "/dashboard/user/past-requests",
    icon: ClipboardDocumentListIcon,
  },
],

  MEMBER: [
    { name: "Dashboard", path: "/dashboard/member", icon: HomeIcon },
    {
      name: "Maintenance",
      path: "/dashboard/member/maintenance",
      icon: CreditCardIcon,
    },
    {
      name: "Services",
      path: "/dashboard/member/services",
      icon: UserGroupIcon,
    },
    {
      name: "Events",
      path: "/dashboard/member/events",
      icon: CalendarDaysIcon,
    },
    {
      name: "Notices",                  
      path: "/dashboard/member/noticesm",
      icon: CalendarDaysIcon,
    },
    { name: "Visitors", path: "/dashboard/member/visitors", icon: EyeIcon },
    {
      name: "Complaints",
      path: "/dashboard/member/complaints",
      icon: ClipboardDocumentListIcon,
    },
    {
      name: "Explore Properties",
      path: "/dashboard/member/properties",
      icon: EyeIcon,
    },
  ],

  OWNER: [
    { name: "Dashboard", path: "/dashboard/owner", icon: HomeIcon },
    {
      name: "Properties",
      path: "/dashboard/owner/properties",
      icon: ClipboardDocumentListIcon,
    },
    {
      name: "Tenant Requests",
      path: "/dashboard/owner/tenants",
      icon: UserGroupIcon,
    },
    {
      name: "Agreements",
      path: "/dashboard/owner/agreements",
      icon: CreditCardIcon,
    },
    {
      name: "User Management",
      path: "/dashboard/owner/user-list",
      icon: UserGroupIcon,
    },
  ],

  SECRETARY: [
    { name: "Dashboard", path: "/dashboard/secretary", icon: HomeIcon },
    {
      name: "Notices",
      path: "/dashboard/secretary/notices",
      icon: ClipboardDocumentListIcon,
    },
    {
      name: "Complaints",
      path: "/dashboard/secretary/complaints",
      icon: ClipboardDocumentListIcon,
    },
    {
      name: "Residents",
      path: "/dashboard/secretary/residents",
      icon: UserGroupIcon,
    },
    { name: "Visitors", path: "/dashboard/secretary/visitors", icon: EyeIcon },
    {
      name: "Facilities",
      path: "/dashboard/secretary/facilities",
      icon: HomeIcon,
    },
    {
      name: "Reports",
      path: "/dashboard/secretary/reports",
      icon: CreditCardIcon,
    },
  ],
  WATCHMAN: [
  {
    name: "Visitor Entry",
    path: "/dashboard/watchman",
    icon: EyeIcon,
  },
  {
    name: "Resident Verification",
    path: "/dashboard/watchman/resident-verification",
    icon: UserGroupIcon,
  },
  {
    name: "Image Verification",
    path: "/dashboard/watchman/image-verification",
    icon: CameraIcon,
  },
  {
    name: "Logs",
    path: "/dashboard/watchman/logs",
    icon: ClipboardDocumentListIcon,
  },
],
};

// motion variants (mobile)
const overlayVariants = {
  hidden: { opacity: 0, pointerEvents: "none" },
  visible: { opacity: 1, pointerEvents: "auto" },
};

const sidebarVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.03 } }),
};

export default function Sidebar({
  role = "USER",
  sidebarOpen,
  setSidebarOpen,
  modalOpen,
}) {
  const links = useMemo(() => linksMap[role] || linksMap.USER, [role]);

  // Detect desktop (>= 640px) and listen for changes
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia && window.matchMedia("(min-width: 640px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 640px)");
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener
      ? mq.addEventListener("change", onChange)
      : mq.addListener(onChange);
    return () => {
      mq.removeEventListener
        ? mq.removeEventListener("change", onChange)
        : mq.removeListener(onChange);
    };
  }, []);

  // Close on ESC (mobile)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {/* Mobile overlay (animated only on mobile) */}
      <AnimatePresence>
        {!isDesktop && sidebarOpen && (
          <motion.div
            key="sidebar-overlay"
            className={`fixed inset-0 z-40 bg-black/40 ${
              modalOpen ? "pointer-events-none" : ""
            }`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {/* When isDesktop is true we keep the element static (no x transform from framer) */}
      {isDesktop ? (
        // Desktop: static sidebar (Tailwind handles layout)
        <aside
          role="navigation"
          aria-label="Sidebar"
          className={[
            "hidden sm:flex sm:flex-col sm:top-0 sm:left-0 sm:z-50 sm:h-full sm:w-64 bg-white border-r border-gray-200",
            "flex-col",
            modalOpen ? "blur-sm pointer-events-none" : "",
          ].join(" ")}
        >
          {/* Links */}
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <ul className="space-y-1">
              {links.map(({ name, path, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      [
                        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                        "hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200",
                        isActive
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : "text-gray-700",
                      ].join(" ")
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-blue-600 opacity-0 group-[.active]:opacity-100"
                    />
                    <Icon className="h-5 w-5 flex-shrink-0 text-gray-500 group-hover:text-blue-700" />
                    <span className="truncate">{name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            <p className="truncate">© {new Date().getFullYear()} OneGate</p>
          </div>
        </aside>
      ) : (
        // Mobile: animated aside
        <motion.aside
          role="navigation"
          aria-label="Sidebar"
          className={[
            "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 sm:hidden",
            modalOpen ? "blur-sm pointer-events-none" : "",
            "flex flex-col",
          ].join(" ")}
          initial={false}
          animate={sidebarOpen ? "visible" : "hidden"}
          variants={sidebarVariants}
          transition={{ type: "tween", duration: 0.22 }}
        >
          <div className="px-4 py-5 border-b">
            <h3 className="text-lg font-semibold text-gray-900">OneGate</h3>
            <p className="text-xs text-gray-500">Member console</p>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <ul className="space-y-1">
              {links.map(({ name, path, icon: Icon }, idx) => (
                <motion.li
                  key={path}
                  custom={idx}
                  initial="hidden"
                  animate={sidebarOpen ? "visible" : "hidden"}
                  variants={itemVariants}
                >
                  <NavLink
                    to={path}
                    end
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      [
                        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                        "hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200",
                        isActive
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : "text-gray-700",
                      ].join(" ")
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-blue-600 opacity-0 group-[.active]:opacity-100"
                    />
                    <Icon className="h-5 w-5 flex-shrink-0 text-gray-500 group-hover:text-blue-700" />
                    <span className="truncate">{name}</span>
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            <p className="truncate">© {new Date().getFullYear()} OneGate</p>
          </div>
        </motion.aside>
      )}
    </>
  );
}
