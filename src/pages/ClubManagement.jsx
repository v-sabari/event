import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css";

const emptyForm = { name: "", description: "", departmentId: "", coordinatorId: "" };

// FE-06: Clubs are master data fully supported by ClubController
// (create/update by SUPER_ADMIN/FACULTY_COORDINATOR, delete SUPER_ADMIN,
// active toggle by SUPER_ADMIN/FACULTY_COORDINATOR) but previously had no
// UI at all. Mirrors VenueManagement.jsx's form + table + active-toggle
// pattern, plus edit support (see DepartmentManagement.jsx for why).
function ClubManagement() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const canDelete = role === "SUPER_ADMIN";

  const [clubs, setClubs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!["SUPER_ADMIN", "FACULTY_COORDINATOR"].includes(role)) {
      navigate("/login");
    }
  }, [role, navigate]);

  const load = async () => {
    try {
      const res = await api.get("/api/clubs");
      setClubs(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load clubs."));
    }
  };

  useEffect(() => {
    load();
    api.get("/api/departments")
      .then((res) => setDepartments(res.data.data))
      .catch(() => setDepartments([]));
    // Coordinators are users with role FACULTY_COORDINATOR - used to
    // populate the "Coordinator" dropdown (UserController ?role= filter).
    api.get("/api/users", { params: { role: "FACULTY_COORDINATOR" } })
      .then((res) => setCoordinators(res.data.data))
      .catch(() => setCoordinators([]));
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
  };

  const startEdit = (club) => {
    setEditingId(club.id);
    setForm({
      name: club.name,
      description: club.description || "",
      departmentId: club.departmentId || "",
      coordinatorId: club.coordinatorId || "",
    });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      coordinatorId: form.coordinatorId ? Number(form.coordinatorId) : null,
    };
    try {
      if (editingId) {
        await api.put(`/api/clubs/${editingId}`, payload);
      } else {
        await api.post("/api/clubs", payload);
      }
      resetForm();
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not save club."));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (club) => {
    try {
      await api.patch(`/api/clubs/${club.id}/active?active=${!club.active}`);
      load();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update club status."));
    }
  };

  const removeClub = async (id) => {
    if (!window.confirm("Delete this club?")) return;
    try {
      await api.delete(`/api/clubs/${id}`);
      load();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not delete club (it may be in use)."));
    }
  };

  return (
    <div className="dashboard-main">
      <button onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Back</button>
      <h2>Club Management</h2>

      {error && <div className="error-text">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Club" : "Add Club"}</h3>
        {formError && <div className="error-text">{formError}</div>}

        <label>Club Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

        <label>Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <label>Department</label>
        <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
          <option value="">— None —</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <label>Coordinator</label>
        <select value={form.coordinatorId} onChange={(e) => setForm({ ...form, coordinatorId: e.target.value })}>
          <option value="">— None assigned —</option>
          {coordinators.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
          ))}
        </select>

        <div className="inline-actions" style={{ marginTop: 10 }}>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update Club" : "Add Club"}
          </button>
          {editingId && (
            <button type="button" className="secondary" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      <div className="section-block table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Coordinator</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.departmentName || "—"}</td>
                <td>{c.coordinatorName || "—"}</td>
                <td><span className={`badge ${c.active ? "badge-published" : "badge-cancelled"}`}>{c.active ? "Active" : "Inactive"}</span></td>
                <td className="inline-actions">
                  <button className="secondary" onClick={() => startEdit(c)}>Edit</button>
                  <button className="secondary" onClick={() => toggleActive(c)}>
                    {c.active ? "Deactivate" : "Activate"}
                  </button>
                  {canDelete && (
                    <button className="danger" onClick={() => removeClub(c.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
            {clubs.length === 0 && <tr><td colSpan={5}>No clubs yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClubManagement;