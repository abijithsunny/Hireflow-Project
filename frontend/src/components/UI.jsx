import { useAuth } from "../context/AuthContext";

/* ── Toast ───────────────────────────────────────────────────────────────── */
export function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;
  const cls =
    toast.type === "error"
      ? "bg-red-50 text-red-800 border border-red-200"
      : "bg-green-50 text-green-800 border border-green-200";
  return (
    <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg font-semibold text-sm max-w-xs ${cls}`}>
      {toast.msg}
    </div>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "bg-indigo-600", "bg-teal-600", "bg-amber-600",
  "bg-pink-600",   "bg-blue-600", "bg-violet-600", "bg-emerald-700",
];

export function Avatar({ name = "", size = 9, src }) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const colorCls = AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const dim      = `w-${size} h-${size}`;

  if (src)
    return <img src={src} alt={name} className={`${dim} rounded-full object-cover shrink-0`} />;

  return (
    <div className={`${dim} ${colorCls} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ fontSize: `${size * 0.38 * 4}px` }}>
      {initials}
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────────────────────── */
export function Badge({ status }) {
  const map = {
    pending:  "badge-pending",
    reviewed: "badge-reviewed",
    accepted: "badge-accepted",
    rejected: "badge-rejected",
  };
  return <span className={map[status] || "badge-pending"}>{status}</span>;
}

/* ── Button ──────────────────────────────────────────────────────────────── */
const BTN_CLS = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  danger:    "btn-danger",
  success:   "btn-success",
  outline:   "btn-outline",
};

export function Btn({ children, variant = "primary", small, onClick, className = "", disabled, type = "button" }) {
  const base = BTN_CLS[variant] || BTN_CLS.primary;
  const size = small ? "!py-1.5 !px-3.5 !text-xs" : "";
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`${base} ${size} ${className}`}>
      {children}
    </button>
  );
}

/* ── Input ───────────────────────────────────────────────────────────────── */
export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="form-label">{label}</label>}
      <input
        className={`form-input ${error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ── Textarea ────────────────────────────────────────────────────────────── */
export function Textarea({ label, className = "", ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="form-label">{label}</label>}
      <textarea
        className={`form-input resize-y min-h-[90px] ${className}`}
        {...props}
      />
    </div>
  );
}

/* ── Select ──────────────────────────────────────────────────────────────── */
export function Select({ label, children, className = "", ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="form-label">{label}</label>}
      <select className={`form-input bg-white ${className}`} {...props}>
        {children}
      </select>
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────────────────────── */
export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40">
      <div className="bg-white rounded-2xl p-7 w-full max-w-lg max-h-[85vh] overflow-y-auto relative shadow-2xl">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl leading-none">
          ✕
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-5">{title}</h2>
        {children}
      </div>
    </div>
  );
}

/* ── Spinner ─────────────────────────────────────────────────────────────── */
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-9 h-9 border-[3px] border-gray-200 border-t-indigo-600 rounded-full spin" />
    </div>
  );
}

/* ── StatCard ────────────────────────────────────────────────────────────── */
export function StatCard({ label, value, icon, colorClass = "bg-indigo-50" }) {
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center text-2xl shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-extrabold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────────────────────── */
export function Empty({ icon = "📭", message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-base">{message}</p>
    </div>
  );
}

/* ── ProgressBar ─────────────────────────────────────────────────────────── */
export function ProgressBar({ value, max, color = "bg-indigo-500" }) {
  const pct = Math.round((value / (max || 1)) * 100);
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-2 ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}
