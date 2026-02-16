// src/App.jsx
import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import "./App.css";

// AUTH PAGES
const LoginForm = lazy(() => import("./components/auth/LoginForm"));
const RegisterForm = lazy(() => import("./components/auth/RegisterForm"));
const VerifyEmail = lazy(() => import("./components/auth/VerifyEmail"));
const Onboarding = lazy(() => import("./components/auth/OnboardingPage"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/auth/ResetPassword"));

// Landing / Welcome (Professional)
const WelcomePage = lazy(() => import("./components/layout/WelcomePage"));

// DASHBOARD LAYOUTS
const UserLayout = lazy(() => import("./components/layout/UserLayout"));
const MemberLayout = lazy(() => import("./components/layout/MemberLayout"));
const SecretaryLayout = lazy(() =>
  import("./components/layout/SecretaryLayout")
);
const WatchmanLayout = lazy(() => import("./components/layout/WatchmanLayout"));
const OwnerLayout = lazy(() => import("./components/layout/OwnerLayout"));

// SECRETARY PAGES
const SecretaryHome = lazy(() =>
  import("./components/dashboard/secretary/SecretaryHome")
);
const Notices = lazy(() => import("./components/dashboard/secretary/Notices"));
const Complaints = lazy(() =>
  import("./components/dashboard/secretary/Complaint")
);
const Residents = lazy(() =>
  import("./components/dashboard/secretary/Resident")
);
const Visitors = lazy(() =>
  import("./components/dashboard/secretary/Visitors")
);
const Facilities = lazy(() =>
  import("./components/dashboard/secretary/Facilities")
);
const Reports = lazy(() => import("./components/dashboard/secretary/Reports"));
const Attendance = lazy(() =>
  import("./components/dashboard/secretary/Attendance")
);



// OWNER PAGES
const OwnerHome = lazy(() => import("./components/dashboard/owner/OwnerHome"));
const Properties = lazy(() =>
  import("./components/dashboard/owner/Properties")
);
const TenantRequests = lazy(() =>
  import("./components/dashboard/owner/TenantRequests")
);
const Agreements = lazy(() => import("./components/dashboard/owner/Agreement"));
const UsersList = lazy(() => import("./components/dashboard/owner/UsersList"));

// WATCHMAN
const VisitorEntry = lazy(() =>
  import("./components/dashboard/watchman/VisitorEntry")
);
const ResidentVerification = lazy(() =>
  import("./components/dashboard/watchman/ResidentVerification")
);
const ImageVerification = lazy(() =>
  import("./components/dashboard/watchman/ImageVerification")
);
const PendingApprovals = lazy(() =>
  import("./components/dashboard/watchman/PendingApprovals")
);
const ApprovedVisitors = lazy(() =>
   import("./components/dashboard/watchman/ApprovedVisitors")
);
const Logs = lazy(() => import("./components/dashboard/watchman/Logs"));

// MEMBER
const MemberHome = lazy(() =>
  import("./components/dashboard/member/MemberHome")
);
const MemberProperties = lazy(() =>
  import("./components/dashboard/member/MemberProperties")
);
const Maintenance = lazy(() =>
  import("./components/dashboard/member/Maintenance")
);
const Services = lazy(() =>
  import("./components/dashboard/member/Services")
);
const Events = lazy(() =>
  import("./components/dashboard/member/Events")
);
const VisitorsMember = lazy(() =>
  import("./components/dashboard/member/Visitors")
);
const ComplaintsMember = lazy(() =>
  import("./components/dashboard/member/Complaints")
);
const NoticesM = lazy(() => import("./components/dashboard/member/Notices"));

// TENANT USER
const TenantHome = lazy(() =>
  import("./components/dashboard/tenant/TenantHome")
);
const TenantPastRequests = lazy(() =>
  import("./components/dashboard/tenant/TenantPastRequests")
);

const Unauthorized = lazy(() => import("./components/dashboard/Unauthorized"));

// HELP & CONTACT
const Help = lazy(() => import("./components/layout/Help"));
const Contact = lazy(() => import("./components/layout/Contact"));

function PageTransition({ children }) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const duration = prefersReducedMotion ? 0 : 0.25;
  const disableBodyScroll = !prefersReducedMotion;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
      transition={{ duration }}
      className="app-min-h-screen"
      style={{
        minHeight: "100vh",
        overflow: "hidden",
      }}
      onAnimationStart={() => {
        if (disableBodyScroll) document.body.classList.add("body-no-scroll");
      }}
      onAnimationComplete={() => {
        if (disableBodyScroll) document.body.classList.remove("body-no-scroll");
      }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  // include forgot/reset routes as auth flow pages
  const authPaths = [
    "/login",
    "/register",
    "/verify",
    "/onboarding",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPath = authPaths.includes(location.pathname);

  return (
    <>
      {/* AUTH ROUTES (animated) */}
      <AnimatePresence mode="wait" initial={false}>
        {isAuthPath && (
          <Routes location={location} key={location.pathname}>
            <Route
              path="/login"
              element={
                <PageTransition>
                  <LoginForm />
                </PageTransition>
              }
            />
            <Route
              path="/register"
              element={
                <PageTransition>
                  <RegisterForm />
                </PageTransition>
              }
            />
            <Route
              path="/verify"
              element={
                <PageTransition>
                  <VerifyEmail />
                </PageTransition>
              }
            />
            <Route
              path="/onboarding"
              element={
                <PageTransition>
                  <Onboarding />
                </PageTransition>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PageTransition>
                  <ForgotPassword />
                </PageTransition>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PageTransition>
                  <ResetPassword />
                </PageTransition>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </AnimatePresence>

      {/* PUBLIC + PROTECTED ROUTES */}
      {!isAuthPath && (
        <Routes>
          {/* Public landing / welcome page */}
          <Route path="/" element={<WelcomePage />} />

          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* HELP & CONTACT */}
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />

          {/* SECRETARY */}
          <Route
            path="/dashboard/secretary/*"
            element={
              <ProtectedRoute roles={["SECRETARY"]}>
                <SecretaryLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SecretaryHome />} />
            <Route path="notices" element={<Notices />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="residents" element={<Residents />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="facilities" element={<Facilities />} />
            <Route path="reports" element={<Reports />} />
            <Route path="attendance" element={<Attendance />} />
          </Route>

          {/* OWNER */}
          <Route
            path="/dashboard/owner/*"
            element={
              <ProtectedRoute roles={["OWNER"]}>
                <OwnerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OwnerHome />} />
            <Route path="properties" element={<Properties />} />
            <Route path="tenants" element={<TenantRequests />} />
            <Route path="agreements" element={<Agreements />} />
            <Route path="user-list" element={<UsersList />} />
          </Route>

          {/* MEMBER */}
          <Route
            path="/dashboard/member/*"
            element={
              <ProtectedRoute roles={["MEMBER"]}>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MemberHome />} />
            <Route path="properties" element={<MemberProperties />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="services" element={<Services />} />
            <Route path="noticesm" element={<NoticesM />} />
            <Route path="events" element={<Events />} />
            <Route path="visitors" element={<VisitorsMember />} />
            <Route path="complaints" element={<ComplaintsMember />} />
          </Route>

          {/* WATCHMAN */}
          <Route
            path="/dashboard/watchman/*"
            element={
              <ProtectedRoute roles={["WATCHMAN"]}>
                <WatchmanLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<VisitorEntry />} />
            <Route
              path="resident-verification"
              element={<ResidentVerification />}
            />
            <Route
              path="image-verification"
              element={<ImageVerification/>}
            />
            <Route 
             path="pending-approvals" 
             element={<PendingApprovals />} 
             />
             <Route path="approved-visitors" element={<ApprovedVisitors />} />
            <Route path="logs" element={<Logs />} />
          </Route>

          {/* TENANT / USER */}
          <Route
            path="/dashboard/user/*"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TenantHome />} />
            <Route path="past-requests" element={<TenantPastRequests />} />
          </Route>

          {/* catch-all: redirect to landing (public) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense
          fallback={
            <div className="min-h-screen grid place-items-center">
              Loading...
            </div>
          }
        >
          <AnimatedRoutes />
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
