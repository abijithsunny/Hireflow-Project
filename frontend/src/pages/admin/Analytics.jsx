import { useState, useEffect } from "react";
import { usersAPI } from "../../services/api";
import { StatCard, ProgressBar, Spinner } from "../../components/UI";

export default function Analytics() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getAnalytics().then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const maxLoc = Math.max(...(stats?.jobsByLocation || []).map((x) => x.count), 1);
  const maxDay = Math.max(...(stats?.appsByDay     || []).map((x) => x.count), 1);

  return (
    <div className="p-7">
      <h1 className="page-title mb-6">Analytics</h1>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-7">
        {[
          { label: "Users",        value: stats?.totalUsers,        icon: "👥", colorClass: "bg-indigo-50" },
          { label: "Jobs",         value: stats?.totalJobs,         icon: "💼", colorClass: "bg-amber-50"  },
          { label: "Applications", value: stats?.totalApplications, icon: "📋", colorClass: "bg-green-50"  },
          { label: "Hired",        value: stats?.accepted,          icon: "🎉", colorClass: "bg-pink-50"   },
          { label: "Rejected",     value: stats?.rejected,          icon: "❌", colorClass: "bg-red-50"    },
        ].map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Jobs by location */}
        <div className="card p-6">
          <h3 className="section-title">Jobs by Location</h3>
          <div className="space-y-4">
            {(stats?.jobsByLocation || []).map(({ _id: loc, count }) => (
              <div key={loc}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-700">{loc}</span>
                  <span className="font-bold text-indigo-600">{count}</span>
                </div>
                <ProgressBar value={count} max={maxLoc} color="bg-indigo-500" />
              </div>
            ))}
            {!stats?.jobsByLocation?.length && <p className="text-sm text-gray-400">No data yet.</p>}
          </div>
        </div>

        {/* Apps last 7 days bar chart */}
        <div className="card p-6">
          <h3 className="section-title">Applications — Last 7 Days</h3>
          {(stats?.appsByDay || []).length === 0
            ? <p className="text-sm text-gray-400">No applications in the last 7 days.</p>
            : (
              <div className="flex items-end gap-2 h-36 mt-2">
                {(stats?.appsByDay || []).map(({ _id: day, count }) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-indigo-600">{count}</span>
                    <div className="w-full bg-indigo-500 rounded-t transition-all duration-700"
                      style={{ height: `${(count / maxDay) * 100}px`, minHeight: 4 }} />
                    <span className="text-[10px] text-gray-400">{day.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* User breakdown */}
      <div className="card p-6">
        <h3 className="section-title">User Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            ["Candidates", stats?.candidates, "bg-green-500"],
            ["Recruiters", stats?.recruiters, "bg-indigo-500"],
          ].map(([label, count, color]) => {
            const pct = Math.round(((count || 0) / (stats?.totalUsers || 1)) * 100);
            return (
              <div key={label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="font-bold text-gray-600">{count || 0} ({pct}%)</span>
                </div>
                <ProgressBar value={count || 0} max={stats?.totalUsers || 1} color={color} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
