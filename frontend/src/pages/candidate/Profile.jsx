import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usersAPI } from "../../services/api";
import { Input, Textarea, Btn, Avatar } from "../../components/UI";

export default function CandidateProfile() {
  const { user, updateUser, showToast } = useAuth();
  const [edit, setEdit]         = useState(false);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm]         = useState({
    name:     user?.name     || "",
    bio:      user?.bio      || "",
    location: user?.location || "",
    skills:   (user?.skills  || []).join(", "),
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      const r = await usersAPI.updateProfile({
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      updateUser(r.data.user);
      showToast("Profile updated!");
      setEdit(false);
    } catch {
      showToast("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append("resume", file);
    setUploading(true);
    try {
      const r = await usersAPI.uploadResume(fd);
      updateUser({ resume: r.data.resume });
      showToast("Resume uploaded!");
    } catch { showToast("Upload failed.", "error"); }
    finally { setUploading(false); }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append("profilePhoto", file);
    setUploading(true);
    try {
      const r = await usersAPI.uploadPhoto(fd);
      updateUser({ profilePhoto: r.data.profilePhoto });
      showToast("Photo updated!");
    } catch { showToast("Upload failed.", "error"); }
    finally { setUploading(false); }
  };

  const photoSrc = user?.profilePhoto
    ? `/uploads/${user.profilePhoto.split("uploads/")[1]}`
    : null;

  return (
    <div className="p-7 max-w-xl">
      <h1 className="page-title mb-6">My Profile</h1>

      <div className="card p-7">
        {/* Photo row */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            {photoSrc
              ? <img src={photoSrc} alt="profile" className="w-20 h-20 rounded-full object-cover" />
              : <Avatar name={user?.name} size={20} />
            }
            <label className="absolute bottom-0 right-0 bg-indigo-600 rounded-full w-6 h-6
                               flex items-center justify-center cursor-pointer text-white text-xs">
              ✏
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <p className="text-xs text-gray-300 capitalize">Candidate</p>
          </div>
        </div>

        {edit ? (
          <>
            <Input label="Full Name"   value={form.name}     onChange={set("name")} />
            <Textarea label="Bio"      value={form.bio}      onChange={set("bio")} />
            <Input label="Location"    value={form.location} onChange={set("location")} />
            <Input label="Skills (comma-separated)" placeholder="React, Node.js, Python"
              value={form.skills} onChange={set("skills")} />
            <div className="flex gap-3 mt-1">
              <Btn onClick={saveProfile} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Btn>
              <Btn variant="secondary" onClick={() => setEdit(false)}>Cancel</Btn>
            </div>
          </>
        ) : (
          <>
            {[
              ["📧 Email",    user?.email],
              ["📍 Location", user?.location || "Not set"],
              ["📝 Bio",      user?.bio      || "Not set"],
            ].map(([label, val]) => (
              <div key={label} className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm text-gray-700">{val}</p>
              </div>
            ))}

            <div className="mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">🛠 Skills</p>
              <div className="flex flex-wrap gap-2">
                {(user?.skills || []).map((s) => (
                  <span key={s} className="skill-tag">{s}</span>
                ))}
                {(!user?.skills || user.skills.length === 0) &&
                  <span className="text-sm text-gray-400">No skills added yet</span>}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">📄 Resume</p>
              <div className="flex items-center gap-3">
                {user?.resume
                  ? <a href={`/uploads/${user.resume.split("uploads/")[1]}`}
                       target="_blank" rel="noreferrer"
                       className="text-sm font-semibold text-indigo-600 hover:underline">
                       View Resume ↗
                     </a>
                  : <span className="text-sm text-gray-400">No resume uploaded</span>}
                <label className="cursor-pointer text-xs font-semibold bg-indigo-50 text-indigo-600
                                   px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                  {uploading ? "Uploading…" : "Upload PDF"}
                  <input type="file" accept=".pdf" onChange={handleResume} className="hidden" />
                </label>
              </div>
            </div>

            <Btn onClick={() => setEdit(true)}>✏️ Edit Profile</Btn>
          </>
        )}
      </div>
    </div>
  );
}
