import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toast, Spinner } from "./components/UI";
import { AppLayout, PrivateRoute } from "./components/Layout";

import Login    from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import CandidateDashboard from "./pages/candidate/Dashboard.jsx";
import BrowseJobs         from "./pages/candidate/BrowseJobs.jsx";
import MyApplications     from "./pages/candidate/MyApplications.jsx";
import CandidateProfile   from "./pages/candidate/Profile.jsx";

import RecruiterDashboard from "./pages/recruiter/Dashboard.jsx";
import PostJob            from "./pages/recruiter/PostJob.jsx";
import MyJobs             from "./pages/recruiter/MyJobs.jsx";
import RecruiterProfile   from "./pages/recruiter/Profile.jsx";

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import ManageUsers    from "./pages/admin/ManageUsers.jsx";
import AllJobs        from "./pages/admin/AllJobs.jsx";
import Analytics      from "./pages/admin/Analytics.jsx";

/* ── Page titles ─────────────────────────────────────────────────────────── */
const TITLES = {
  "/dashboard":       "Dashboard",
  "/jobs":            "Browse Jobs",
  "/applications":    "My Applications",
  "/profile":         "My Profile",
  "/post-job":        "Post a Job",
  "/my-jobs":         "My Jobs",
  "/admin/users":     "Manage Users",
  "/admin/jobs":      "All Jobs",
  "/admin/analytics": "Analytics",
};

/* ── Shell wraps every protected page with sidebar + topbar ─────────────── */
function Shell({ children }) {
  const { logout }   = useAuth();
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  return (
    <AppLayout
      title={TITLES[pathname] || "Dashboard"}
      activePath={pathname}
      navigate={navigate}
      onLogout={logout}>
      {children}
    </AppLayout>
  );
}

/* ── Role-aware renders ─────────────────────────────────────────────────── */
function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === "recruiter") return <RecruiterDashboard />;
  if (user?.role === "admin")     return <AdminDashboard />;
  return <CandidateDashboard />;
}

function ProfilePage() {
  const { user } = useAuth();
  if (user?.role === "recruiter") return <RecruiterProfile />;
  return <CandidateProfile />;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

/* ── Route tree ──────────────────────────────────────────────────────────── */
function AppRoutes() {
  return (
    <>
      <Toast />
      <Routes>
        {/* Public */}
        <Route path="/"         element={<RootRedirect />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Shared */}
        <Route path="/dashboard" element={<PrivateRoute><Shell><DashboardPage /></Shell></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute><Shell><ProfilePage /></Shell></PrivateRoute>} />

        {/* Candidate */}
        <Route path="/jobs"         element={<PrivateRoute allowedRoles={["candidate"]}><Shell><BrowseJobs /></Shell></PrivateRoute>} />
        <Route path="/applications" element={<PrivateRoute allowedRoles={["candidate"]}><Shell><MyApplications /></Shell></PrivateRoute>} />

        {/* Recruiter */}
        <Route path="/post-job" element={<PrivateRoute allowedRoles={["recruiter"]}><Shell><PostJob /></Shell></PrivateRoute>} />
        <Route path="/my-jobs"  element={<PrivateRoute allowedRoles={["recruiter"]}><Shell><MyJobs /></Shell></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin/users"     element={<PrivateRoute allowedRoles={["admin"]}><Shell><ManageUsers /></Shell></PrivateRoute>} />
        <Route path="/admin/jobs"      element={<PrivateRoute allowedRoles={["admin"]}><Shell><AllJobs /></Shell></PrivateRoute>} />
        <Route path="/admin/analytics" element={<PrivateRoute allowedRoles={["admin"]}><Shell><Analytics /></Shell></PrivateRoute>} />

        {/* Error pages */}
        <Route path="/unauthorized" element={
          <div className="min-h-screen flex flex-col items-center justify-center text-center font-sans">
            <p className="text-6xl mb-4">🔒</p>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-400 mb-4">You don't have permission to view this page.</p>
            <a href="/dashboard" className="text-indigo-600 font-semibold hover:underline">← Go to Dashboard</a>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

/* ── Root export ─────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
