import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar, Spinner } from "./UI";

/* ── PrivateRoute ────────────────────────────────────────────────────────── */
export function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;
  return children;
}

/* ── Nav links per role ──────────────────────────────────────────────────── */
const LINKS = {
  candidate: [
    { path: "/dashboard",    label: "Dashboard",      icon: "🏠" },
    { path: "/jobs",         label: "Browse Jobs",    icon: "💼" },
    { path: "/applications", label: "My Applications",icon: "📋" },
    { path: "/profile",      label: "My Profile",     icon: "👤" },
  ],
  recruiter: [
    { path: "/dashboard", label: "Dashboard",  icon: "🏠" },
    { path: "/post-job",  label: "Post a Job", icon: "➕" },
    { path: "/my-jobs",   label: "My Jobs",    icon: "📁" },
    { path: "/profile",   label: "Profile",    icon: "👤" },
  ],
  admin: [
    { path: "/dashboard",       label: "Dashboard",    icon: "🏠" },
    { path: "/admin/users",     label: "Manage Users", icon: "👥" },
    { path: "/admin/jobs",      label: "All Jobs",     icon: "💼" },
    { path: "/admin/analytics", label: "Analytics",    icon: "📊" },
  ],
};

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
export function Sidebar({ activePath, navigate, onLogout }) {
  const { user } = useAuth();
  const links    = LINKS[user?.role] || [];
  const photoSrc = user?.profilePhoto ? `/uploads/${user.profilePhoto.split("uploads/")[1]}` : null;

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-gray-100">
        <div className="text-xl font-extrabold text-indigo-600 tracking-tight">🚀 HireFlow</div>
        <div className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest">{user?.role} panel</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map((link) => {
          const active = activePath === link.path;
          return (
            <div key={link.path} onClick={() => navigate(link.path)}
              className={`nav-link ${active ? "nav-link-active" : ""}`}>
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3 px-1">
          <Avatar name={user?.name} size={9} src={photoSrc} />
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={onLogout}
          className="w-full py-2 text-sm font-semibold text-gray-600 bg-gray-100
                     hover:bg-gray-200 rounded-lg transition-colors">
          Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ── Topbar ──────────────────────────────────────────────────────────────── */
export function Topbar({ title }) {
  const { user } = useAuth();
  const photoSrc = user?.profilePhoto ? `/uploads/${user.profilePhoto.split("uploads/")[1]}` : null;
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-7 shrink-0">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Hello, {user?.name?.split(" ")[0]} 👋</span>
        <Avatar name={user?.name} size={8} src={photoSrc} />
      </div>
    </header>
  );
}

/* ── AppLayout ───────────────────────────────────────────────────────────── */
export function AppLayout({ children, title, activePath, navigate, onLogout }) {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar activePath={activePath} navigate={navigate} onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-auto">
        <Topbar title={title} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
