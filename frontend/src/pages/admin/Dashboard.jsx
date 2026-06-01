import { useState, useEffect } from "react";
import { usersAPI } from "../../services/api";
import { StatCard, ProgressBar, Spinner } from "../../components/UI";

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getAnalytics().then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  const maxLoc = Math.max(...(stats?.jobsByLocation || []).map((x) => x.count), 1);

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Full platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
        <StatCard label="Total Users"        value={stats?.totalUsers        || 0} icon="👥" colorClass="bg-indigo-50" />
        <StatCard label="Candidates"         value={stats?.candidates         || 0} icon="🎓" colorClass="bg-violet-50" />
        <StatCard label="Recruiters"         value={stats?.recruiters         || 0} icon="🏢" colorClass="bg-cyan-50" />
        <StatCard label="Active Jobs"        value={stats?.totalJobs          || 0} icon="💼" colorClass="bg-amber-50" />
        <StatCard label="Applications"       value={stats?.totalApplications  || 0} icon="📋" colorClass="bg-green-50" />
        <StatCard label="Hired"              value={stats?.accepted           || 0} icon="🎉" colorClass="bg-pink-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Jobs by location */}
        <div className="card p-6">
          <h3 className="section-title">Jobs by Location</h3>
          <div className="space-y-4">
            {(stats?.jobsByLocation || []).map(({ _id: loc, count }) => (
              <div key={loc}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{loc}</span>
                  <span className="font-bold text-indigo-600">{count}</span>
                </div>
                <ProgressBar value={count} max={maxLoc} color="bg-indigo-500" />
              </div>
            ))}
            {!stats?.jobsByLocation?.length && <p className="text-sm text-gray-400">No data yet.</p>}
          </div>
        </div>

        {/* Application status */}
        <div className="card p-6">
          <h3 className="section-title">Application Status</h3>
          <div className="space-y-4">
            {[
              ["Pending",  stats?.pending,  "bg-amber-400"],
              ["Accepted", stats?.accepted, "bg-green-500"],
              ["Rejected", stats?.rejected, "bg-red-400"],
            ].map(([label, count, color]) => {
              const total = stats?.totalApplications || 1;
              const pct   = Math.round(((count || 0) / total) * 100);
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{label}</span>
                    <span className="font-bold text-gray-600">{count || 0} ({pct}%)</span>
                  </div>
                  <ProgressBar value={count || 0} max={total} color={color} />
                </div>
              );
            })}
          </div>
          <div className="mt-5 bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Total Applications</p>
            <p className="text-3xl font-extrabold text-gray-900">{stats?.totalApplications || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
