import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css";

const PAGE_SIZE = 20;

function VenueManagement() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [venues, setVenues] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [form, setForm] = useState({ name: "", location: "", capacity: 50 });
  const [error, setError] = useState("");

  // FE-02: role-check centralized in ProtectedRoute (wraps /venues in
  // App.jsx). `role` is still used below to gate the Delete button.

  // BE-17: GET /api/venues now returns a Page<VenueResponseDTO> instead of
  // a raw array, so the venue list lives at res.data.data.content, with
  // pagination metadata (totalPages/totalElements) alongside it.
  const load = async (targetPage = page) => {
    try {
      const res = await api.get("/api/venues", { params: { page: targetPage, size: PAGE_SIZE } });
      setVenues(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
      setTotalElements(res.data.data.totalElements);
      setPage(targetPage);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load venues."));
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/venues", form);
      setForm({ name: "", location: "", capacity: 50 });
      load(0); // a new venue sorts wherever the backend puts it - safest to go back to page 0
    } catch (err) {
      alert(apiErrorMessage(err, "Could not create venue."));
    }
  };

  const toggleActive = async (venue) => {
    try {
      await api.patch(`/api/venues/${venue.id}/active?active=${!venue.active}`);
      load();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update venue."));
    }
  };

  const removeVenue = async (id) => {
    if (!window.confirm("Delete this venue?")) return;
    try {
      await api.delete(`/api/venues/${id}`);
      // Deleting the last row on a page could leave it empty - step back a
      // page if we just emptied out the current one (and it's not page 0).
      const wasLastRowOnPage = venues.length === 1 && page > 0;
      load(wasLastRowOnPage ? page - 1 : page);
    } catch (err) {
      alert(apiErrorMessage(err, "Could not delete venue (it may be in use by an event)."));
    }
  };

  return (
    <div className="dashboard-main">
      <button onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Back</button>
      <h2>Venue Management</h2>

      {error && <div className="error-text">{error}</div>}

      <form className="form-card" onSubmit={handleCreate}>
        <label>Venue Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <label>Location</label>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <label>Capacity</label>
        <input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} required />
        <div className="inline-actions" style={{ marginTop: 10 }}>
          <button type="submit">Add Venue</button>
        </div>
      </form>

      <div className="section-block table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {venues.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.location}</td>
                <td>{v.capacity}</td>
                <td><span className={`badge ${v.active ? "badge-published" : "badge-cancelled"}`}>{v.active ? "Active" : "Inactive"}</span></td>
                <td className="inline-actions">
                  <button className="secondary" onClick={() => toggleActive(v)}>
                    {v.active ? "Deactivate" : "Activate"}
                  </button>
                  {role === "SUPER_ADMIN" && (
                    <button className="danger" onClick={() => removeVenue(v.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
            {venues.length === 0 && <tr><td colSpan={5}>No venues yet.</td></tr>}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="inline-actions" style={{ marginTop: 12, justifyContent: "space-between" }}>
            <button className="secondary" disabled={page === 0} onClick={() => load(page - 1)}>← Prev</button>
            <span>Page {page + 1} of {totalPages} ({totalElements} venues)</span>
            <button className="secondary" disabled={page + 1 >= totalPages} onClick={() => load(page + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VenueManagement;