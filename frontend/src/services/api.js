import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("hireflow_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("hireflow_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data)   => API.post("/auth/register", data),
  login:    (data)   => API.post("/auth/login",    data),
  getMe:    ()       => API.get("/auth/me"),
};

export const jobsAPI = {
  getAll:    (params)      => API.get("/jobs",                  { params }),
  getById:   (id)          => API.get(`/jobs/${id}`),
  create:    (data)        => API.post("/jobs",                 data),
  update:    (id, data)    => API.put(`/jobs/${id}`,            data),
  delete:    (id)          => API.delete(`/jobs/${id}`),
  getMyJobs: ()            => API.get("/jobs/recruiter/myjobs"),
};

export const appsAPI = {
  apply:        (jobId, data) => API.post(`/applications/apply/${jobId}`, data),
  getMine:      ()            => API.get("/applications/my"),
  getForJob:    (jobId)       => API.get(`/applications/job/${jobId}`),
  updateStatus: (id, data)    => API.put(`/applications/${id}/status`,   data),
  getAll:       ()            => API.get("/applications/all"),
};

export const usersAPI = {
  getProfile:    ()     => API.get("/users/profile"),
  updateProfile: (data) => API.put("/users/profile",       data),
  uploadResume:  (form) => API.put("/users/upload-resume", form, { headers: { "Content-Type": "multipart/form-data" } }),
  uploadPhoto:   (form) => API.put("/users/upload-photo",  form, { headers: { "Content-Type": "multipart/form-data" } }),
  getAll:        (p)    => API.get("/users/all",           { params: p }),
  delete:        (id)   => API.delete(`/users/${id}`),
  getAnalytics:  ()     => API.get("/users/analytics"),
};

export default API;
