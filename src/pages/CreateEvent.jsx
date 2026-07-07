import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css";

// Reused for both creating a brand new draft and editing an existing
// draft/rejected event - Phase 1 flagged this page as orphaned and
// duplicating logic already in FacultyDashboard; it is now the single
// place an event draft is created or edited (FacultyDashboard no longer
// creates events - that page is for approval, not authoring).
function CreateEvent() {
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing an existing draft
  const role = localStorage.getItem("role");

  // Matches EventController's @PreAuthorize("hasAnyRole('STUDENT_ORGANIZER','SUPER_ADMIN')")
  // on both POST /api/events and PUT /api/events/{id} - every other
  // restricted page in the app redirects before rendering the form; this
  // one previously rendered the full form for any authenticated user and
  // only failed on submit.
  useEffect(() => {
    if (!["STUDENT_ORGANIZER", "SUPER_ADMIN"].includes(role)) {
      navigate("/login");
    }
  }, [role, navigate]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    clubId: "",
    departmentId: "",
    venueId: "",
    startTime: "",
    endTime: "",
    registrationDeadline: "",
    maxParticipants: 50,
    fee: 0,
    bannerUrl: "",
  });

  const [venues, setVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Master data for the dropdowns - all four are read-open to any
    // authenticated user per the backend's Venue/Category/Club/Department controllers.
    Promise.all([
      api.get("/api/venues"),
      api.get("/api/event-categories"),
      api.get("/api/clubs"),
      api.get("/api/departments"),
    ])
      .then(([v, c, cl, d]) => {
        setVenues(v.data.data);
        setCategories(c.data.data);
        setClubs(cl.data.data);
        setDepartments(d.data.data);
      })
      .catch(() => setError("Failed to load form options. Please refresh."));

    if (id) {
      api
        .get(`/api/events/${id}`)
        .then((res) => {
          const e = res.data.data;
          setForm({
            title: e.title || "",
            description: e.description || "",
            categoryId: e.categoryId || "",
            clubId: e.clubId || "",
            departmentId: e.departmentId || "",
            venueId: e.venueId || "",
            startTime: toLocalInput(e.startTime),
            endTime: toLocalInput(e.endTime),
            registrationDeadline: toLocalInput(e.registrationDeadline),
            maxParticipants: e.maxParticipants,
            fee: e.fee,
            bannerUrl: e.bannerUrl || "",
          });
        })
        .catch(() => setError("Could not load this event for editing."));
    }
  }, [id]);

  const toLocalInput = (isoString) =>
    isoString ? isoString.substring(0, 16) : "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => ({
    title: form.title,
    description: form.description,
    categoryId: form.categoryId || null,
    clubId: form.clubId || null,
    departmentId: form.departmentId || null,
    venueId: Number(form.venueId),
    startTime: new Date(form.startTime).toISOString(),
    endTime: new Date(form.endTime).toISOString(),
    registrationDeadline: new Date(form.registrationDeadline).toISOString(),
    maxParticipants: Number(form.maxParticipants),
    fee: Number(form.fee) || 0,
    bannerUrl: form.bannerUrl || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = buildPayload();
      if (id) {
        await api.put(`/api/events/${id}`, payload);
      } else {
        await api.post("/api/events", payload);
      }
      navigate("/organizer");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save the event draft."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-main">
      <h2>{id ? "Edit Event Draft" : "Create Event Draft"}</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} />

        <label>Category</label>
        <select name="categoryId" value={form.categoryId} onChange={handleChange}>
          <option value="">-- None --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label>Club</label>
        <select name="clubId" value={form.clubId} onChange={handleChange}>
          <option value="">-- None --</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label>Department</label>
        <select name="departmentId" value={form.departmentId} onChange={handleChange}>
          <option value="">-- None --</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <label>Venue</label>
        <select name="venueId" value={form.venueId} onChange={handleChange} required>
          <option value="">-- Select a venue --</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>{v.name} (capacity {v.capacity})</option>
          ))}
        </select>

        <label>Start Time</label>
        <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} required />

        <label>End Time</label>
        <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} required />

        <label>Registration Deadline</label>
        <input type="datetime-local" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} required />

        <label>Maximum Participants</label>
        <input type="number" min="1" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} required />

        <label>Fee (₹)</label>
        <input type="number" min="0" step="0.01" name="fee" value={form.fee} onChange={handleChange} />

        <label>Banner Image URL (optional)</label>
        <input name="bannerUrl" value={form.bannerUrl} onChange={handleChange} placeholder="Upload via Gallery/Files first, then paste the URL here" />

        {error && <div className="error-text">{error}</div>}

        <div className="inline-actions" style={{ marginTop: 16 }}>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : id ? "Save Changes" : "Create Draft"}
          </button>
          <button type="button" className="secondary" onClick={() => navigate("/organizer")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
