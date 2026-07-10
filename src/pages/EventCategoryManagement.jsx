import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css";

const emptyForm = { name: "", description: "" };
const PAGE_SIZE = 20;

// FE-06: Event categories are master data fully supported by
// EventCategoryController (create/update by SUPER_ADMIN/FACULTY_COORDINATOR,
// delete SUPER_ADMIN) but previously had no UI - meaning every event was
// stuck using whatever categories existed in DB seed data. Mirrors
// VenueManagement.jsx's form + table pattern, plus edit support (see
// DepartmentManagement.jsx for why).
function EventCategoryManagement() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const canDelete = role === "SUPER_ADMIN";

  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // FE-02: role-check centralized in ProtectedRoute (wraps /event-categories
  // in App.jsx). `role` is still used above for `canDelete`.

  // BE-17: GET /api/event-categories now returns a Page<EventCategoryResponseDTO>.
  const load = async (targetPage = page) => {
    try {
      const res = await api.get("/api/event-categories", { params: { page: targetPage, size: PAGE_SIZE } });
      setCategories(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
      setTotalElements(res.data.data.totalElements);
      setPage(targetPage);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load event categories."));
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || "" });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/api/event-categories/${editingId}`, form);
        load();
      } else {
        await api.post("/api/event-categories", form);
        load(0);
      }
      resetForm();
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not save category."));
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (id) => {
    if (!window.confirm("Delete this event category?")) return;
    try {
      await api.delete(`/api/event-categories/${id}`);
      const wasLastRowOnPage = categories.length === 1 && page > 0;
      load(wasLastRowOnPage ? page - 1 : page);
    } catch (err) {
      alert(apiErrorMessage(err, "Could not delete category (it may be in use by an event)."));
    }
  };

  return (
    <div className="dashboard-main">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <h2>Event Category Management</h2>

      {error && <div className="error-text">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Category" : "Add Category"}</h3>
        {formError && <div className="error-text">{formError}</div>}

        <label>Category Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

        <label>Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <div className="inline-actions" style={{ marginTop: 10 }}>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update Category" : "Add Category"}
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
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.description || "—"}</td>
                <td className="inline-actions">
                  <button className="secondary" onClick={() => startEdit(c)}>Edit</button>
                  {canDelete && (
                    <button className="danger" onClick={() => removeCategory(c.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={3}>No event categories yet.</td></tr>}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="inline-actions" style={{ marginTop: 12, justifyContent: "space-between" }}>
            <button className="secondary" disabled={page === 0} onClick={() => load(page - 1)}>← Prev</button>
            <span>Page {page + 1} of {totalPages} ({totalElements} categories)</span>
            <button className="secondary" disabled={page + 1 >= totalPages} onClick={() => load(page + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventCategoryManagement;