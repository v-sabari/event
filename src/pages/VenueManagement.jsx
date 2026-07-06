import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css";

function VenueManagement() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({ name: "", location: "", capacity: 50 });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!["SUPER_ADMIN", "FACULTY_COORDINATOR"].includes(role)) {
      navigate("/login");
    }
  }, [role, navigate]);

  const load = async () => {
    try {
      const res = await api.get("/api/venues");
      setVenues(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load venues."));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/venues", form);
      setForm({ name: "", location: "", capacity: 50 });
      load();
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
      load();
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
      </div>
    </div>
  );
}

export default VenueManagement;
