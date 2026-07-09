import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css";

const emptyForm = { name: "", code: "", description: "", hodId: "", hodApprovalRequired: false };
const PAGE_SIZE = 20;
// BE-17: the HOD dropdown needs the full set, not one page - see
// ClubManagement.jsx's LOOKUP_SIZE comment for the reasoning.
const LOOKUP_SIZE = 1000;

// FE-06: Departments are master data fully supported by DepartmentController
// (create/update/delete, all SUPER_ADMIN-only) but previously had no UI at
// all - the system relied entirely on DB seed data. Mirrors the
// form-card + table pattern from VenueManagement.jsx, plus edit support
// since DepartmentController exposes PUT and Venue's UI-level gap there
// (no edit button despite a working PUT) isn't something to repeat here.
function DepartmentManagement() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hods, setHods] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // FE-02: role-check centralized in ProtectedRoute (wraps /departments in
  // App.jsx, allowedRoles=["SUPER_ADMIN"] - DepartmentController writes are
  // SUPER_ADMIN-only, so unlike Venues/Clubs this page has no
  // FACULTY_COORDINATOR access at all).

  // BE-17: GET /api/departments now returns a Page<DepartmentResponseDTO>.
  const load = async (targetPage = page) => {
    try {
      const res = await api.get("/api/departments", { params: { page: targetPage, size: PAGE_SIZE } });
      setDepartments(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
      setTotalElements(res.data.data.totalElements);
      setPage(targetPage);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load departments."));
    }
  };

  useEffect(() => {
    load(0);
    // HODs are users with role HOD - used to populate the "Head of
    // Department" dropdown (UserController supports ?role= filtering).
    // BE-17: that endpoint is also paginated now, so request the full set
    // via LOOKUP_SIZE and unwrap .content.
    api.get("/api/users", { params: { role: "HOD", size: LOOKUP_SIZE } })
      .then((res) => setHods(res.data.data.content))
      .catch(() => setHods([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
  };

  const startEdit = (dept) => {
    setEditingId(dept.id);
    setForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || "",
      hodId: dept.hodId || "",
      hodApprovalRequired: dept.hodApprovalRequired,
    });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    const payload = {
      name: form.name,
      code: form.code,
      description: form.description,
      hodId: form.hodId ? Number(form.hodId) : null,
      hodApprovalRequired: form.hodApprovalRequired,
    };
    try {
      if (editingId) {
        await api.put(`/api/departments/${editingId}`, payload);
        load();
      } else {
        await api.post("/api/departments", payload);
        load(0);
      }
      resetForm();
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not save department."));
    } finally {
      setSaving(false);
    }
  };

  const removeDepartment = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await api.delete(`/api/departments/${id}`);
      const wasLastRowOnPage = departments.length === 1 && page > 0;
      load(wasLastRowOnPage ? page - 1 : page);
    } catch (err) {
      alert(apiErrorMessage(err, "Could not delete department (it may be in use)."));
    }
  };

  return (
    <div className="dashboard-main">
      <button onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Back</button>
      <h2>Department Management</h2>

      {error && <div className="error-text">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Department" : "Add Department"}</h3>
        {formError && <div className="error-text">{formError}</div>}

        <label>Department Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

        <label>Department Code</label>
        <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />

        <label>Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <label>Head of Department</label>
        <select value={form.hodId} onChange={(e) => setForm({ ...form, hodId: e.target.value })}>
          <option value="">— None assigned —</option>
          {hods.map((h) => (
            <option key={h.id} value={h.id}>{h.name} ({h.email})</option>
          ))}
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <input
            type="checkbox"
            checked={form.hodApprovalRequired}
            onChange={(e) => setForm({ ...form, hodApprovalRequired: e.target.checked })}
          />
          Require HOD approval for events in this department
        </label>

        <div className="inline-actions" style={{ marginTop: 10 }}>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update Department" : "Add Department"}
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
              <th>Code</th>
              <th>HOD</th>
              <th>HOD Approval Required</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.code}</td>
                <td>{d.hodName || "—"}</td>
                <td>{d.hodApprovalRequired ? "Yes" : "No"}</td>
                <td className="inline-actions">
                  <button className="secondary" onClick={() => startEdit(d)}>Edit</button>
                  <button className="danger" onClick={() => removeDepartment(d.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {departments.length === 0 && <tr><td colSpan={5}>No departments yet.</td></tr>}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="inline-actions" style={{ marginTop: 12, justifyContent: "space-between" }}>
            <button className="secondary" disabled={page === 0} onClick={() => load(page - 1)}>← Prev</button>
            <span>Page {page + 1} of {totalPages} ({totalElements} departments)</span>
            <button className="secondary" disabled={page + 1 >= totalPages} onClick={() => load(page + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepartmentManagement;