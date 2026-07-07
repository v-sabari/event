import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css";

const ROLES = ["STUDENT", "STUDENT_ORGANIZER", "FACULTY_COORDINATOR", "HOD", "SUPER_ADMIN"];

const emptyForm = { regNumber: "", name: "", email: "", password: "", role: "STUDENT", departmentId: "" };

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
  const [departments, setDepartments] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!["SUPER_ADMIN", "FACULTY_COORDINATOR"].includes(role)) {
      navigate("/login");
    }
  }, [role, navigate]);

  const load = async (filterRole) => {
    try {
      const res = await api.get("/api/users", filterRole ? { params: { role: filterRole } } : undefined);
      setUsers(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load users."));
    }
  };

  useEffect(() => {
    load(roleFilter);
    api.get("/api/departments")
      .then((res) => setDepartments(res.data.data))
      .catch(() => setDepartments([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (value) => {
    setRoleFilter(value);
    load(value);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const payload = { ...form, departmentId: form.departmentId ? Number(form.departmentId) : null };
      await api.post("/api/users", payload);
      setForm(emptyForm);
      load(roleFilter);
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not create user."));
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (user) => {
    try {
      await api.patch(`/api/users/${user.id}/enabled?enabled=${!user.enabled}`);
      load(roleFilter);
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update user."));
    }
  };

  const changeRole = async (user, newRole) => {
    if (newRole === user.role) return;
    if (!window.confirm(`Change ${user.name}'s role from ${user.role} to ${newRole}?`)) return;
    try {
      await api.patch(`/api/users/${user.id}/role?role=${newRole}`);
      load(roleFilter);
    } catch (err) {
      alert(apiErrorMessage(err, "Could not change role."));
    }
  };

  return (
    <div className="dashboard-main">
      <button onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Back</button>
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
      </div>
    </div>
  );
}

export default UserManagement;
