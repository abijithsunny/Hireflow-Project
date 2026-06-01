import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { appsAPI } from "../../services/api";
import { StatCard, Badge, Spinner } from "../../components/UI";

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function CandidateDashboard() {
  const { user }              = useAuth();
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appsAPI.getMine().then((r) => setApps(r.data.applications)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const pending  = apps.filter((a) => a.status === "pending").length;
  const accepted = apps.filter((a) => a.status === "accepted").length;
  const rejected = apps.filter((a) => a.status === "rejected").length;

  const completion = [
    ["Name",   !!user?.name],
    ["Email",  !!user?.email],
    ["Skills", (user?.skills || []).length > 0],
    ["Bio",    !!user?.bio],
  ];
  const completePct = Math.round((completion.filter(([, v]) => v).length / completion.length) * 100);

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="page-title">Welcome back, {user?.name?.split(" ")[0]}! 👋</h1>
        <p className="text-gray-500 text-sm">Here's your job search overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard label="Applications" value={apps.length} icon="📋" colorClass="bg-indigo-50" />
        <StatCard label="Pending"      value={pending}     icon="⏳" colorClass="bg-amber-50"  />
        <StatCard label="Accepted"     value={accepted}    icon="✅" colorClass="bg-green-50"  />
        <StatCard label="Rejected"     value={rejected}    icon="❌" colorClass="bg-red-50"    />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent applications */}
        <div className="card p-5">
          <h3 className="section-title">Recent Applications</h3>
          {apps.length === 0
            ? <p className="text-sm text-gray-400">No applications yet. Browse jobs!</p>
            : apps.slice(0, 5).map((app) => (
              <div key={app._id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{app.jobId?.title}</p>
                  <p className="text-xs text-gray-400">{app.jobId?.company} · {fmt(app.createdAt)}</p>
                </div>
                <Badge status={app.status} />
              </div>
            ))}
        </div>

        {/* Profile + skills */}
        <div className="card p-5">
          <h3 className="section-title">Your Skills</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            {(user?.skills || []).map((s) => (
              <span key={s} className="skill-tag">{s}</span>
            ))}
            {(!user?.skills || user.skills.length === 0) &&
              <p className="text-sm text-gray-400">Add skills in your profile</p>}
          </div>

          <h3 className="section-title">Profile Completion — {completePct}%</h3>
          <div className="h-2 bg-gray-100 rounded-full mb-4">
            <div className="h-2 bg-indigo-500 rounded-full transition-all"
              style={{ width: `${completePct}%` }} />
          </div>
          <div className="space-y-2">
            {completion.map(([label, done]) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className={`text-base ${done ? "text-green-500" : "text-gray-200"}`}>
                  {done ? "✅" : "○"}
                </span>
                <span className={`text-sm ${done ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
