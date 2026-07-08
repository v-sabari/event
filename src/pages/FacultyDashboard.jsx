import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";

import "./Dashboard.css";

const STATUS_BADGE = {
  DRAFT: "badge-draft",
  PENDING_FACULTY_APPROVAL: "badge-pending",
  PENDING_HOD_APPROVAL: "badge-pending",
  PENDING_ADMIN_APPROVAL: "badge-pending",
  REJECTED: "badge-rejected",
  PUBLISHED: "badge-published",
  CANCELLED: "badge-cancelled",
  COMPLETED: "badge-completed",
};

// Faculty Coordinator / HOD / Super Admin all land here. Phase 1 found this
// page's "Create Event"/"Manage Events" sidebar links pointed at sections
// that were never rendered, and the create/edit/delete handlers operated on
// a fake Event shape unrelated to the real backend. Those roles don't
// actually create events in this workflow (Student Organizers do, via
// CreateEvent.jsx) - this page's real job is the Approval Workflow, so the
// sidebar links and sections now point at what this role actually does.
function FacultyDashboard() {

  const navigate = useNavigate();

  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("dashboard");

  const [pending, setPending] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [error, setError] = useState("");
  const [remarksFor, setRemarksFor] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Route Protection
  useEffect(() => {
    if (!role || !["FACULTY_COORDINATOR", "HOD", "SUPER_ADMIN"].includes(role)) {
      navigate("/login");
    }
  }, [role, navigate]);

  const loadPending = async () => {
    try {
      const res = await api.get("/api/events/pending-approval");
      setPending(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load the approval queue."));
    }
  };

  const loadAllEvents = async () => {
    try {
      const res = await api.get("/api/events");
      setAllEvents(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load events."));
    }
  };

  useEffect(() => {
    loadPending();
    loadAllEvents();
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActive(id);
      setOpen(false);
    }
  };

  const approve = async (eventId) => {
    setProcessingId(eventId);
    try {
      await api.post(`/api/events/${eventId}/approve`, { remarks: "" });
      loadPending();
      loadAllEvents();
    } catch (err) {
      alert(apiErrorMessage(err, "Approval failed."));
    } finally {
      setProcessingId(null);
    }
  };

  const openReject = (eventId) => {
    setRemarksFor(eventId);
    setRemarks("");
  };

  const submitReject = async (eventId) => {
    if (!remarks.trim()) {
      alert("Remarks are required when rejecting an event.");
      return;
    }
    setProcessingId(eventId);
    try {
      await api.post(`/api/events/${eventId}/reject`, { remarks });
      setRemarksFor(null);
      loadPending();
      loadAllEvents();
    } catch (err) {
      alert(apiErrorMessage(err, "Rejection failed."));
    } finally {
      setProcessingId(null);
    }
  };

  const totalRegistrationsAcrossPublished = allEvents
    .filter((e) => e.status === "PUBLISHED" || e.status === "COMPLETED")
    .length; // roster counts are per-event (fetched on the roster page); this is a lightweight proxy stat.

  return (
    <div className="dashboard">

      {open && <div className="overlay" onClick={() => setOpen(false)}></div>}

      <div className="topbar">
        <button className="menu-btn" onClick={() => setOpen(!open)}>☰</button>
        <h2>Faculty Dashboard</h2>
      </div>

      <div className={`sidebar ${open ? "active" : ""}`}>
        <h2>Faculty Panel</h2>

        <ul>
          <li
            className={active === "dashboard" ? "active-link" : ""}
            onClick={() => scrollToSection("dashboard")}
          >
            Dashboard
          </li>

          <li
            className={active === "pending" ? "active-link" : ""}
            onClick={() => scrollToSection("pending")}
          >
            Approval Queue
          </li>

          <li
            className={active === "manage" ? "active-link" : ""}
            onClick={() => scrollToSection("manage")}
          >
            All Events
          </li>

          {role === "SUPER_ADMIN" && (
            <li onClick={() => { setOpen(false); navigate("/venues"); }}>Manage Venues</li>
          )}
          {role === "SUPER_ADMIN" && (
            <li onClick={() => { setOpen(false); navigate("/departments"); }}>Manage Departments</li>
          )}
          {(role === "SUPER_ADMIN" || role === "FACULTY_COORDINATOR") && (
            <li onClick={() => { setOpen(false); navigate("/clubs"); }}>Manage Clubs</li>
          )}
          {(role === "SUPER_ADMIN" || role === "FACULTY_COORDINATOR") && (
            <li onClick={() => { setOpen(false); navigate("/event-categories"); }}>Manage Event Categories</li>
          )}
          {(role === "SUPER_ADMIN" || role === "FACULTY_COORDINATOR") && (
            <li onClick={() => { setOpen(false); navigate("/users"); }}>Manage Users</li>
          )}
          <li onClick={() => { setOpen(false); navigate("/reports"); }}>Reports</li>
          <li onClick={() => { setOpen(false); navigate("/calendar"); }}>Event Calendar</li>
          <li onClick={() => { setOpen(false); navigate("/notifications"); }}>Notifications</li>
        </ul>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="dashboard-main">

        <h1 id="dashboard">Welcome {name}</h1>

        {error && <div className="error-text">{error}</div>}

        <div className="stats-container">

          <div className="stat-card">
            <h3>Pending Your Approval</h3>
            <p>{pending.length}</p>
          </div>

          <div className="stat-card">
            <h3>Total Events (visible to you)</h3>
            <p>{allEvents.length}</p>
          </div>

          <div className="stat-card">
            <h3>Published/Completed</h3>
            <p>{totalRegistrationsAcrossPublished}</p>
          </div>

        </div>

        <div id="pending" className="section-block table-container">
          <h2>Approval Queue</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Organizer</th>
                <th>Venue</th>
                <th>Start Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((e) => (
                <React.Fragment key={e.id}>
                  <tr>
                    <td>{e.title}</td>
                    <td>{e.createdByName}</td>
                    <td>{e.venueName}</td>
                    <td>{new Date(e.startTime).toLocaleString()}</td>
                    <td className="inline-actions">
                      <button onClick={() => approve(e.id)} disabled={processingId === e.id}>
                        {processingId === e.id ? <><span className="spinner"></span>Approving...</> : "Approve"}
                      </button>
                      <button className="danger" onClick={() => openReject(e.id)} disabled={processingId === e.id}>
                        Reject
                      </button>
                    </td>
                  </tr>
                  {remarksFor === e.id && (
                    <tr>
                      <td colSpan={5}>
                        <textarea
                          className="remarks-box"
                          placeholder="Reason for rejection (required)"
                          value={remarks}
                          onChange={(ev) => setRemarks(ev.target.value)}
                        />
                        <div className="inline-actions" style={{ marginTop: 8 }}>
                          <button className="danger" onClick={() => submitReject(e.id)} disabled={processingId === e.id}>
                            {processingId === e.id ? <><span className="spinner"></span>Rejecting...</> : "Confirm Reject"}
                          </button>
                          <button className="secondary" onClick={() => setRemarksFor(null)} disabled={processingId === e.id}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {pending.length === 0 && (
                <tr><td colSpan={5}>Nothing awaiting your approval right now.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div id="manage" className="section-block table-container">
          <h2>All Events</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Venue</th>
                <th>Start Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allEvents.map((e) => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td>{e.venueName}</td>
                  <td>{new Date(e.startTime).toLocaleString()}</td>
                  <td><span className={`badge ${STATUS_BADGE[e.status] || ""}`}>{e.status}</span></td>
                  <td className="inline-actions">
                    <button className="secondary" onClick={() => navigate(`/events/${e.id}/roster`)}>Roster</button>
                  </td>
                </tr>
              ))}
              {allEvents.length === 0 && (
                <tr><td colSpan={5}>No events to show.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

export default FacultyDashboard;