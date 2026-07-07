import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  // FE-05: Super Admin had no way to approve/reject events because this
  // page never loaded or rendered the approval queue, even though the
  // backend already accepts SUPER_ADMIN on GET /api/events/pending-approval
  // and POST /api/events/{id}/approve|reject (see EventController /
  // EventApprovalServiceImpl). This mirrors the same queue/approve/reject
  // pattern already working in FacultyDashboard.jsx for FACULTY_COORDINATOR/HOD.
  const [pending, setPending] = useState([]);
  const [remarksFor, setRemarksFor] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (role !== "SUPER_ADMIN") navigate("/login");
  }, [role, navigate]);

  useEffect(() => {
    api.get("/api/dashboard/admin")
      .then((res) => setSummary(res.data.data))
      .catch((err) => setError(apiErrorMessage(err, "Could not load dashboard summary.")));
  }, []);

  const loadPending = async () => {
    try {
      const res = await api.get("/api/events/pending-approval");
      setPending(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load the approval queue."));
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const approve = async (eventId) => {
    setProcessingId(eventId);
    try {
      await api.post(`/api/events/${eventId}/approve`, { remarks: "" });
      loadPending();
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
    } catch (err) {
      alert(apiErrorMessage(err, "Rejection failed."));
    } finally {
      setProcessingId(null);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="dashboard">
      {open && <div className="overlay" onClick={() => setOpen(false)}></div>}

      <div className="topbar">
        <button className="menu-btn" onClick={() => setOpen(!open)}>☰</button>
        <h2>Admin Dashboard</h2>
      </div>

      <div className={`sidebar ${open ? "active" : ""}`}>
        <h2>Admin Panel</h2>
        <ul>
          <li onClick={() => { setOpen(false); navigate("/dashboard"); }}>Overview</li>
          <li onClick={() => { setOpen(false); scrollToSection("pending"); }}>Approval Queue</li>
          <li onClick={() => { setOpen(false); navigate("/users"); }}>Manage Users</li>
          <li onClick={() => { setOpen(false); navigate("/reports"); }}>Reports</li>
          <li onClick={() => { setOpen(false); navigate("/venues"); }}>Manage Venues</li>
          <li onClick={() => { setOpen(false); navigate("/calendar"); }}>Event Calendar</li>
          <li onClick={() => { setOpen(false); navigate("/events"); }}>Search Events</li>
        </ul>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <div className="dashboard-main">
        <h1>Welcome {name}</h1>

        {error && <div className="error-text">{error}</div>}

        {summary && (
          <div className="stats-container">
            <div className="stat-card"><h3>Total Users</h3><p>{summary.totalUsers}</p></div>
            <div className="stat-card"><h3>Total Events</h3><p>{summary.totalEvents}</p></div>
            <div className="stat-card"><h3>Pending Approvals</h3><p>{summary.pendingApprovals}</p></div>
            <div className="stat-card"><h3>Active Events</h3><p>{summary.activeEvents}</p></div>
            <div className="stat-card"><h3>Today's Events</h3><p>{summary.todaysEvents}</p></div>
          </div>
        )}

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

        {summary && (
          <div className="section-block table-container">
            <h2>Recent Registrations</h2>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Event</th>
                  <th>Status</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentRegistrations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.userName} ({r.userRegNumber})</td>
                    <td>{r.eventTitle}</td>
                    <td><span className="badge badge-registered">{r.status}</span></td>
                    <td>{new Date(r.registeredAt).toLocaleString()}</td>
                  </tr>
                ))}
                {summary.recentRegistrations.length === 0 && (
                  <tr><td colSpan={4}>No registrations yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;