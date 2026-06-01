import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { jobsAPI, appsAPI } from "../../services/api";
import { StatCard, Badge, Modal, Btn, Spinner, Empty, Avatar } from "../../components/UI";

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function RecruiterDashboard() {
  const { user, showToast }     = useAuth();
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedJob, setSelectedJob]   = useState(null);
  const [jobApps, setJobApps]           = useState([]);
  const [loadingApps, setLoadingApps]   = useState(false);

  useEffect(() => {
    jobsAPI.getMyJobs().then((r) => setJobs(r.data.jobs)).finally(() => setLoading(false));
  }, []);

  const viewApplicants = async (job) => {
    setSelectedJob(job);
    setLoadingApps(true);
    try {
      const r = await appsAPI.getForJob(job._id);
      setJobApps(r.data.applications);
    } finally { setLoadingApps(false); }
  };

  const handleStatus = async (appId, status) => {
    try {
      await appsAPI.updateStatus(appId, { status });
      setJobApps((p) => p.map((a) => a._id === appId ? { ...a, status } : a));
      showToast(status === "accepted" ? "Candidate accepted! 🎉" : "Status updated.");
    } catch { showToast("Failed.", "error"); }
  };

  if (loading) return <Spinner />;
  const totalApplicants = jobs.reduce((s, j) => s + (j.applicantCount || 0), 0);

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="page-title">Recruiter Dashboard</h1>
        <p className="text-sm text-gray-500">{user?.company || "Your Company"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        <StatCard label="Jobs Posted"      value={jobs.length}      icon="📁" colorClass="bg-indigo-50" />
        <StatCard label="Total Applicants" value={totalApplicants}  icon="👥" colorClass="bg-violet-50" />
        <StatCard label="Active Jobs"      value={jobs.filter(j => j.isActive).length} icon="✅" colorClass="bg-green-50" />
      </div>

      <div className="card p-5">
        <h3 className="section-title">Your Posted Jobs</h3>
        {jobs.length === 0
          ? <Empty icon="📭" message="No jobs posted yet." />
          : jobs.map((job) => (
            <div key={job._id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 flex-wrap gap-3">
              <div>
                <p className="text-sm font-bold text-gray-900">{job.title}</p>
                <p className="text-xs text-gray-400">📍 {job.location} · 💰 {job.salary} · {fmt(job.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold bg-violet-50 text-violet-700 px-3 py-1 rounded-full">
                  {job.applicantCount || 0} applicants
                </span>
                <Btn small variant="outline" onClick={() => viewApplicants(job)}>Review →</Btn>
              </div>
            </div>
          ))}
      </div>

      {selectedJob && (
        <Modal title={`Applicants — ${selectedJob.title}`} onClose={() => setSelectedJob(null)}>
          {loadingApps ? <Spinner /> : jobApps.length === 0 ? <Empty message="No applications yet." /> :
            jobApps.map((app) => (
              <div key={app._id} className="py-4 border-b border-gray-50 last:border-0">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={app.candidateId?.name} size={10} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{app.candidateId?.name}</p>
                    <p className="text-xs text-gray-400">{app.candidateId?.email}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(app.candidateId?.skills || []).map((s) => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                    {app.coverNote && <p className="text-xs text-gray-400 italic mt-1.5">"{app.coverNote}"</p>}
                    {app.candidateId?.resume && (
                      <a href={`/uploads/${app.candidateId.resume.split("uploads/")[1]}`}
                        target="_blank" rel="noreferrer"
                        className="text-xs font-semibold text-indigo-600 mt-1 inline-block">
                        📄 View Resume ↗
                      </a>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge status={app.status} />
                    <p className="text-xs text-gray-300 mt-1">{fmt(app.createdAt)}</p>
                  </div>
                </div>
                {app.status === "pending" && (
                  <div className="flex gap-2">
                    <Btn small variant="success" onClick={() => handleStatus(app._id, "accepted")}>✓ Accept</Btn>
                    <Btn small variant="danger"  onClick={() => handleStatus(app._id, "rejected")}>✗ Reject</Btn>
                    <Btn small variant="secondary" onClick={() => handleStatus(app._id, "reviewed")}>Mark Reviewed</Btn>
                  </div>
                )}
              </div>
            ))}
        </Modal>
      )}
    </div>
  );
}
