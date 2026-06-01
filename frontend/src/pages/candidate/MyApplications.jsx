import { useState, useEffect } from "react";
import { appsAPI } from "../../services/api";
import { Badge, Spinner, Empty } from "../../components/UI";

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function MyApplications() {
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appsAPI.getMine().then((r) => setApps(r.data.applications)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="p-7">
      <h1 className="page-title mb-6">My Applications</h1>

      {apps.length === 0
        ? <Empty icon="📭" message="You haven't applied to any jobs yet." />
        : (
          <div className="flex flex-col gap-4">
            {apps.map((app) => (
              <div key={app._id} className="card p-5">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1">{app.jobId?.title}</h3>
                    <p className="text-sm font-semibold text-indigo-600 mb-2">{app.jobId?.company}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <span>📍 {app.jobId?.location}</span>
                      <span>💰 {app.jobId?.salary}</span>
                      <span>📅 Applied {fmt(app.createdAt)}</span>
                    </div>
                    {app.coverNote && (
                      <p className="mt-2 text-sm text-gray-400 italic">"{app.coverNote}"</p>
                    )}
                    {app.recruiterNote && (
                      <div className="mt-3 bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-sm text-green-700">
                        💬 {app.recruiterNote}
                      </div>
                    )}
                  </div>
                  <Badge status={app.status} />
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
