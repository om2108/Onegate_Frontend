// src/components/layout/DashboardLayout.jsx
import React, { useState, useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "./Sidebar";
import Header from "./Header";
import ProfileModal from "./ProfileModal";
import { AuthContext } from "../../context/AuthContext";

export default function DashboardLayout({ role }) {
  const { user } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const location = useLocation();

  return (
    <div className="flex flex-col h-screen font-sans">
      {/* Header */}
      <Header
        setSidebarOpen={setSidebarOpen}
        onOpenProfileModal={() => setModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          role={role}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          modalOpen={modalOpen}
        />

        {/* Main content */}
        <main
          className={`flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-100 transition-all ${
            modalOpen ? "blur-sm" : ""
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Big Profile Modal */}
        <ProfileModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </div>
  );
}
