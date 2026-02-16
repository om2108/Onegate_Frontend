// src/components/layout/Header.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { connectSocket, disconnectSocket } from "../../util/socket";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getProfile } from "../../api/profile";
import {
  getNotifications,
  getNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../api/notification";

const logo =
  "https://res.cloudinary.com/dopjyimaq/image/upload/f_auto,q_auto/v1771076067/encuusttipzand6nseyr.svg";import { motion } from "framer-motion";

export default function Header({ setSidebarOpen, onOpenProfileModal }) {
  const { user, logout } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const avatarRef = useRef(null);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // MOBILE SEARCH
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  /** -----------------------------------------------
   * LOAD PROFILE
   * --------------------------------------------- */
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    (async () => {
      try {
        setLoadingProfile(true);
        const data = await getProfile();
        if (mounted) setProfile(data);
      } catch (e) {
        alert("Profile load failed");
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    })();

    return () => (mounted = false);
  }, [user]);

  /** -----------------------------------------------
   * LOAD NOTIFICATIONS (Polling + Event Listener)
   * --------------------------------------------- */
  const loadNotifications = async () => {
    try {
      const count = await getNotificationCount(); // already number
      const list = await getNotifications(); // already array

      setUnreadCount(count || 0);
      setNotifications(Array.isArray(list) ? list : []);
    } catch (e) {
      alert("Notification load failed");
    }
  };

  useEffect(() => {
    const handler = () => loadNotifications();

    window.addEventListener("refreshNotifications", handler);

    return () => window.removeEventListener("refreshNotifications", handler);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    loadNotifications();

    connectSocket(user.id, () => {
      loadNotifications();
    });

    return () => disconnectSocket();
  }, [user?.id]);

  /** -----------------------------------------------
   * CLOSE ON OUTSIDE CLICK
   * --------------------------------------------- */
  useEffect(() => {
    const onClick = (e) => {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(e.target) &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /** -----------------------------------------------
   * SEARCH (desktop + mobile)
   * --------------------------------------------- */
  const submitSearch = (term) => {
    const q = term.trim();
    const params = new URLSearchParams(location.search);
    q ? params.set("search", q) : params.delete("search");
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    submitSearch(searchText);
    setSearchOpen(false);
  };

  /** -----------------------------------------------
   * COMMON INFO
   * --------------------------------------------- */
  const name = profile?.fullName || user?.name || user?.email;
  const initial = String(name?.[0] || "U").toUpperCase();
  const role = (profile?.role || user?.role || "").toLowerCase();

  const formatDateTime = (dt) => (dt ? new Date(dt).toLocaleString() : "");

  return (
    <>
      {/* HEADER */}
      <motion.header
        className="sticky top-0 z-50 bg-white/80 backdrop-blur"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <div className="h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500" />

        <div className="px-3 sm:px-6 border-b border-gray-200">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-2">
              <button
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <Bars3Icon className="h-6 w-6 text-gray-700" />
              </button>
              <img src={logo} alt="logo" className="h-7 sm:h-9" />
            </div>

            {/* CENTER (desktop search) */}
            <div className="hidden sm:flex flex-1 justify-center max-w-lg">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch(e.target.search.value);
                }}
                className="relative w-full"
              >
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  name="search"
                  placeholder="Search..."
                  className="w-full pl-10 pr-10 py-2 rounded-full bg-gray-50 border text-sm 
                             focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </form>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search */}
              <button
                className="sm:hidden p-2 rounded-md hover:bg-gray-100"
                onClick={() => setSearchOpen(true)}
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>

              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  className="p-2 rounded-md hover:bg-gray-100 relative group"
                  onClick={() => {
                    setNotifOpen((prev) => {
                      if (!prev) setMenuOpen(false);
                      return !prev;
                    });
                    loadNotifications();
                  }}
                >
                  <BellIcon
                    className={`h-6 w-6 ${unreadCount > 0 ? "text-blue-600" : "text-gray-500"}`}
                  />

                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATION PANEL */}
                {notifOpen && (
                  <div
                    className={`
                      absolute bg-white border rounded-xl shadow-lg z-50
                      ${
                        window.innerWidth < 640
                          ? "left-1/2 -translate-x-[75%] top-[60px] w-[85vw]"
                          : "right-0 mt-2 w-80"
                      }
                    `}
                    style={{ maxHeight: "75vh", overflowY: "auto" }}
                  >
                    <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
                      <p className="text-sm font-semibold text-gray-800">
                        Notifications
                      </p>

                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            await markAllNotificationsRead();

                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, readStatus: "READ" })),
                            );

                            setUnreadCount(0);
                          }}
                          className="text-xs text-blue-600"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-sm text-gray-500">
                        No notifications
                      </p>
                    ) : (
                      notifications.map((n) => {
                        const nid = n.id || n._id;
                        return (
                          <button
                            key={nid}
                            className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${
                              n.readStatus === "UNREAD" ? "bg-blue-50" : ""
                            }`}
                            onClick={async () => {
                              await markNotificationRead(nid);

                              setNotifications((prev) =>
                                prev.map((x) =>
                                  (x.id || x._id) === nid
                                    ? { ...x, readStatus: "READ" }
                                    : x,
                                ),
                              );

                              setUnreadCount((c) => Math.max(c - 1, 0));
                            }}
                          >
                            <p className="text-sm">{n.message}</p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              {formatDateTime(n.createdAt)}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* PROFILE */}
              <div ref={avatarRef} className="relative">
                <button
                  className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100"
                  onClick={() => {
                    setMenuOpen((prev) => {
                      if (!prev) setNotifOpen(false);
                      return !prev;
                    });
                  }}
                >
                  {/* Avatar */}
                  {profile?.image && !imgError ? (
                    <img
                      src={profile.image}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center ring-2 ring-white">
                      <span>{initial}</span>
                    </div>
                  )}

                  {/* Name + Role (desktop only) */}
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold">{name}</span>
                    <span className="text-[11px] text-gray-500 capitalize">
                      {role}
                    </span>
                  </div>

                  <ChevronDownIcon className="hidden sm:block h-4 w-4 text-gray-400" />
                </button>

                {/* PROFILE PANEL */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border bg-white shadow-lg z-50">
                    <div className="flex items-center gap-3 px-4 py-3 border-b">
                      {profile?.image && !imgError ? (
                        <img
                          src={profile.image}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center">
                          {initial}
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>

                    <button
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenProfileModal();
                      }}
                    >
                      View / Edit Profile
                    </button>

                    <button
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/help");
                      }}
                    >
                      Help
                    </button>

                    <button
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/contact");
                      }}
                    >
                      Contact
                    </button>

                    <button
                      className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 border-t"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE SEARCH DRAWER */}
        {searchOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-[190]"
              onClick={() => setSearchOpen(false)}
            />

            <div
              className="fixed top-0 left-0 right-0 bg-white z-[200] p-4 shadow-xl rounded-b-2xl"
              style={{ animation: "drawerSlideDown 0.25s ease-out" }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Search</h2>
                <button
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setSearchOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6 text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleMobileSearchSubmit}>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    autoFocus
                    placeholder="Search…"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border bg-gray-50 text-sm 
                               focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-4 bg-blue-600 text-white w-full py-3 rounded-xl text-sm font-medium"
                >
                  Search
                </button>
              </form>
            </div>
          </>
        )}
      </motion.header>
    </>
  );
}
