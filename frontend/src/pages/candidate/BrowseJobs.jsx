import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { jobsAPI, appsAPI } from "../../services/api";
import { Modal, Btn, Textarea, Spinner, Empty } from "../../components/UI";
import JobCard from "../../components/JobCard";

export default function BrowseJobs() {
  const { showToast }                   = useAuth();
  const [jobs,      setJobs]            = useState([]);
  const [myAppIds,  setMyAppIds]        = useState([]);
  const [loading,   setLoading]         = useState(true);
  const [search,    setSearch]          = useState("");
  const [location,  setLocation]        = useState("");
  const [jobType,   setJobType]         = useState("");
  const [viewJob,   setViewJob]         = useState(null);
  const [applyJob,  setApplyJob]        = useState(null);
  const [coverNote, setCoverNote]       = useState("");
  const [applying,  setApplying]        = useState(false);
  const [page,      setPage]            = useState(1);
  const [total,     setTotal]           = useState(0);

  const PER_PAGE = 9;

  const fetchJobs = () => {
    setLoading(true);
    jobsAPI.getAll({ search, location, jobType, page, limit: PER_PAGE })
      .then((r) => { setJobs(r.data.jobs); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    appsAPI.getMine().then((r) => setMyAppIds(r.data.applications.map((a) => a.jobId?._id)));
  }, []);

  useEffect(() => { fetchJobs(); }, [search, location, jobType, page]); // eslint-disable-line

  const handleApply = async () => {
    setApplying(true);
    try {
      await appsAPI.apply(applyJob._id, { coverNote });
      setMyAppIds((p) => [...p, applyJob._id]);
      showToast("Application submitted! 🎉");
      setApplyJob(null); setCoverNote("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to apply.", "error");
    } finally {
      setApplying(false);
    }
  };

  const pages = Math.ceil(total / PER_PAGE);

  return (
    <div className="p-7">
      <h1 className="page-title mb-5">Browse Jobs</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input placeholder="🔍 Search title, company, skills…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="form-input flex-1 min-w-[200px]" />
        <input placeholder="📍 Location" value={location}
          onChange={(e) => { setLocation(e.target.value); setPage(1); }}
          className="form-input w-40" />
        <select value={jobType} onChange={(e) => { setJobType(e.target.value); setPage(1); }}
          className="form-input w-36 bg-white">
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="remote">Remote</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
        </select>
      </div>

      <p className="text-sm text-gray-400 mb-4">{total} job{total !== 1 ? "s" : ""} found</p>

      {loading ? <Spinner /> : (
        <>
          {jobs.length === 0
            ? <Empty message="No jobs match your search." />
            : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} onView={setViewJob}
                    onApply={setApplyJob} applied={myAppIds.includes(job._id)} />
                ))}
              </div>
            )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors
                    ${page === p
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* View Job Modal */}
      {viewJob && (
        <Modal title={viewJob.title} onClose={() => setViewJob(null)}>
          <p className="text-sm font-bold text-indigo-600 mb-1">{viewJob.company}</p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
            <span>📍 {viewJob.location}</span>
            <span>💰 {viewJob.salary}</span>
            <span>⏱ {viewJob.jobType}</span>
            <span>🎓 {viewJob.experience}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{viewJob.description}</p>
          <h4 className="text-sm font-bold text-gray-800 mb-2">Requirements</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-5">
            {(viewJob.requirements || []).map((r) => <li key={r}>{r}</li>)}
          </ul>
          <div className="flex gap-3">
            {myAppIds.includes(viewJob._id)
              ? <Btn variant="success" disabled>✓ Already Applied</Btn>
              : <Btn onClick={() => { setViewJob(null); setApplyJob(viewJob); }}>Apply Now</Btn>}
            <Btn variant="secondary" onClick={() => setViewJob(null)}>Close</Btn>
          </div>
        </Modal>
      )}

      {/* Apply Modal */}
      {applyJob && (
        <Modal title={`Apply — ${applyJob.title}`} onClose={() => setApplyJob(null)}>
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 text-sm">
            <span className="font-bold">{applyJob.company}</span>
            <span className="text-gray-500"> · {applyJob.location} · {applyJob.salary}</span>
          </div>
          <Textarea label="Cover Note (optional)"
            placeholder="Why are you excited about this role? What makes you a great fit?"
            value={coverNote} onChange={(e) => setCoverNote(e.target.value)} />
          <div className="flex gap-3">
            <Btn onClick={handleApply} disabled={applying}>
              {applying ? "Submitting…" : "Submit Application"}
            </Btn>
            <Btn variant="secondary" onClick={() => setApplyJob(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
