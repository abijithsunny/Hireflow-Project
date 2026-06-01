import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usersAPI } from "../../services/api";
import { Input, Btn, Avatar } from "../../components/UI";

export default function RecruiterProfile() {
  const { user, updateUser, showToast } = useAuth();
  const [edit, setEdit]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({
    name:           user?.name           || "",
    company:        user?.company        || "",
    companyWebsite: user?.companyWebsite || "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const r = await usersAPI.updateProfile(form);
      updateUser(r.data.user);
      showToast("Profile updated!");
      setEdit(false);
    } catch { showToast("Failed.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-7 max-w-lg">
      <h1 className="page-title mb-6">Recruiter Profile</h1>
      <div className="card p-7">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name} size={16} />
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <p className="text-sm font-semibold text-indigo-600">{user?.company}</p>
          </div>
        </div>

        {edit ? (
          <>
            <Input label="Full Name"       value={form.name}           onChange={set("name")} />
            <Input label="Company Name"    value={form.company}        onChange={set("company")} />
            <Input label="Company Website" placeholder="https://…"     value={form.companyWebsite} onChange={set("companyWebsite")} />
            <div className="flex gap-3 mt-1">
              <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Btn>
              <Btn variant="secondary" onClick={() => setEdit(false)}>Cancel</Btn>
            </div>
          </>
        ) : (
          <>
            {[
              ["📧 Email",   user?.email],
              ["🏢 Company", user?.company        || "Not set"],
              ["🌐 Website", user?.companyWebsite || "Not set"],
            ].map(([label, val]) => (
              <div key={label} className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm text-gray-700">{val}</p>
              </div>
            ))}
            <Btn onClick={() => setEdit(true)}>✏️ Edit Profile</Btn>
          </>
        )}
      </div>
    </div>
  );
}
