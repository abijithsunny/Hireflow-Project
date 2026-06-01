import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { usersAPI } from "../../services/api";
import { Btn, Spinner, Avatar } from "../../components/UI";

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const ROLE_CLS = {
  admin:     "bg-red-50   text-red-700",
  recruiter: "bg-blue-50  text-blue-700",
  candidate: "bg-green-50 text-green-700",
};

export default function ManageUsers() {
  const { showToast }               = useAuth();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch]         = useState("");

  useEffect(() => {
    setLoading(true);
    usersAPI.getAll(roleFilter ? { role: roleFilter } : {})
      .then((r) => setUsers(r.data.users))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This also removes their jobs and applications.`)) return;
    try {
      await usersAPI.delete(id);
      setUsers((p) => p.filter((u) => u._id !== id));
      showToast("User deleted.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed.", "error");
    }
  };

  const filtered = users.filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-7">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="page-title">Manage Users</h1>
        <div className="flex gap-3">
          <input placeholder="🔍 Name or email…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="form-input w-52" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="form-input w-36 bg-white">
            <option value="">All Roles</option>
            <option value="candidate">Candidates</option>
            <option value="recruiter">Recruiters</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["User", "Email", "Role", "Company / Skills", "Joined", "Actions"].map((h) => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} size={8} />
                      <span className="font-semibold text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="table-td text-gray-400">{u.email}</td>
                  <td className="table-td">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${ROLE_CLS[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="table-td text-gray-400 text-xs max-w-[160px] truncate">
                    {u.role === "recruiter" ? (u.company || "—") : (u.skills || []).slice(0, 3).join(", ") || "—"}
                  </td>
                  <td className="table-td text-gray-300 text-xs">{fmt(u.createdAt)}</td>
                  <td className="table-td">
                    {u.role !== "admin" && (
                      <Btn small variant="danger" onClick={() => handleDelete(u._id, u.name)}>Delete</Btn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-10 text-sm text-gray-400">No users found.</p>
          )}
        </div>
      )}
    </div>
  );
}
