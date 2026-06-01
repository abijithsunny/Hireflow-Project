import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { jobsAPI, appsAPI } from "../../services/api";
import { Modal, Spinner, Empty, Badge, Avatar } from "../../components/UI";
import JobCard from "../../components/JobCard";

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function MyJobs() {
  const { showToast }             = useAuth();
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [viewJob, setViewJob]     = useState(null);
  const [jobApps, setJobApps]     = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    jobsAPI.getMyJobs().then((r) => setJobs(r.data.jobs)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job and all its applications?")) return;
    try {
      await jobsAPI.delete(jobId);
      setJobs((p) => p.filter((j) => j._id !== jobId));
      showToast("Job deleted.");
    } catch { showToast("Failed to delete.", "error"); }
  };

  const viewApplicants = async (job) => {
    setViewJob(job);
    setLoadingApps(true);
    try {
      const r = await appsAPI.getForJob(job._id);
      setJobApps(r.data.applications);
    } finally { setLoadingApps(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-7">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">My Jobs</h1>
        <span className="text-sm text-gray-400">{jobs.length} job{jobs.length !== 1 ? "s" : ""}</span>
      </div>

      {jobs.length === 0
        ? <Empty icon="📭" message="No jobs posted yet. Go to 'Post a Job' to create one." />
        : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} recruiterMode
                onView={(j, mode) => mode === "applicants" && viewApplicants(j)}
                onDelete={handleDelete} />
            ))}
          </div>
        )}

      {viewJob && (
        <Modal title={`Applicants — ${viewJob.title}`} onClose={() => setViewJob(null)}>
          {loadingApps ? <Spinner /> : jobApps.length === 0 ? <Empty message="No applications yet." /> :
            jobApps.map((app) => (
              <div key={app._id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <Avatar name={app.candidateId?.name} size={9} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{app.candidateId?.name}</p>
                    <p className="text-xs text-gray-400">{app.candidateId?.email} · {fmt(app.createdAt)}</p>
                  </div>
                </div>
                <Badge status={app.status} />
              </div>
            ))}
        </Modal>
      )}
    </div>
  );
}
