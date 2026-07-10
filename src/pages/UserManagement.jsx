import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css";

const ROLES = ["STUDENT", "STUDENT_ORGANIZER", "FACULTY_COORDINATOR", "HOD", "SUPER_ADMIN"];

const emptyForm = { regNumber: "", name: "", email: "", password: "", role: "STUDENT", departmentId: "" };
const PAGE_SIZE = 20;
// BE-17: the department dropdown on the "Create User" form needs the full
// set, not one page - see ClubManagement.jsx's LOOKUP_SIZE comment.
const LOOKUP_SIZE = 1000;

function UserManagement() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  // POST /api/users and GET /api/users allow SUPER_ADMIN and FACULTY_COORDINATOR
  // (UserController.java), but PATCH .../enabled and .../role are SUPER_ADMIN
  // only - so those two controls are hidden entirely for FACULTY_COORDINATOR
  // rather than shown and left to fail with a 403, matching how
  // VenueManagement.jsx hides its Delete button for non-SUPER_ADMIN.
  const isSuperAdmin = role === "SUPER_ADMIN";

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // FE-02: role-check centralized in ProtectedRoute (wraps /users in
  // App.jsx). `role` is still used above for `isSuperAdmin`.

  // BE-17: GET /api/users now returns a Page<UserResponseDTO>.
  const load = async (filterRole, targetPage = 0) => {
    try {
      const params = { page: targetPage, size: PAGE_SIZE, ...(filterRole ? { role: filterRole } : {}) };
      const res = await api.get("/api/users", { params });
      setUsers(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
      setTotalElements(res.data.data.totalElements);
      setPage(targetPage);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load users."));
    }
  };

  useEffect(() => {
    load(roleFilter, 0);
    // BE-17: GET /api/departments is also paginated now - this call
    // populates the "Create User" form's department <select>, so it needs
    // the full set (LOOKUP_SIZE) and .content.
    api.get("/api/departments", { params: { size: LOOKUP_SIZE } })
      .then((res) => setDepartments(res.data.data.content))
      .catch(() => setDepartments([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (value) => {
    setRoleFilter(value);
    load(value, 0);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const payload = { ...form, departmentId: form.departmentId ? Number(form.departmentId) : null };
      await api.post("/api/users", payload);
      setForm(emptyForm);
      load(roleFilter, 0); // a new user - safest to go back to page 0
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not create user."));
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (user) => {
    try {
      await api.patch(`/api/users/${user.id}/enabled?enabled=${!user.enabled}`);
      load(roleFilter, page);
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update user."));
    }
  };

  const changeRole = async (user, newRole) => {
    if (newRole === user.role) return;
    if (!window.confirm(`Change ${user.name}'s role from ${user.role} to ${newRole}?`)) return;
    try {
      await api.patch(`/api/users/${user.id}/role?role=${newRole}`);
      load(roleFilter, page);
    } catch (err) {
      alert(apiErrorMessage(err, "Could not change role."));
    }
  };

  return (
    <div className="dashboard-main">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <h2>User Management</h2>

      {error && <div className="error-text">{error}</div>}

      <form className="form-card" onSubmit={handleCreate}>
        <label>Registration Number</label>
        <input
          value={form.regNumber}
          onChange={(e) => setForm({ ...form, regNumber: e.target.value })}
          required
        />
        <label>Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <label>Temporary Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          minLength={8}
          required
        />
        <label>Role</label>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <label>Department</label>
        <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
          <option value="">-- None --</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {formError && <div className="error-text">{formError}</div>}

        <div className="inline-actions" style={{ marginTop: 10 }}>
          <button type="submit" disabled={saving}>{saving ? "Creating..." : "Create User"}</button>
        </div>
      </form>

      <div className="section-block table-container">
        <div className="inline-actions" style={{ marginBottom: 10 }}>
          <label htmlFor="roleFilter" style={{ marginRight: 8 }}>Filter by role:</label>
          <select id="roleFilter" value={roleFilter} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Reg Number</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              {isSuperAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.regNumber}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {isSuperAdmin ? (
                    <select value={u.role} onChange={(e) => changeRole(u, e.target.value)}>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    u.role
                  )}
                </td>
                <td>{u.departmentName || "—"}</td>
                <td>
                  <span className={`badge ${u.enabled ? "badge-published" : "badge-cancelled"}`}>
                    {u.enabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
                {isSuperAdmin && (
                  <td className="inline-actions">
                    <button className="secondary" onClick={() => toggleEnabled(u)}>
                      {u.enabled ? "Disable" : "Enable"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={isSuperAdmin ? 7 : 6}>No users found.</td></tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="inline-actions" style={{ marginTop: 12, justifyContent: "space-between" }}>
            <button className="secondary" disabled={page === 0} onClick={() => load(roleFilter, page - 1)}>← Prev</button>
            <span>Page {page + 1} of {totalPages} ({totalElements} users)</span>
            <button className="secondary" disabled={page + 1 >= totalPages} onClick={() => load(roleFilter, page + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;