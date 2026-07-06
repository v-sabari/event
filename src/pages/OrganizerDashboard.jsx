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

function OrganizerDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [historyFor, setHistoryFor] = useState(null);
  const [history, setHistory] = useState([]);
  const [winnerForm, setWinnerForm] = useState(null);

  useEffect(() => {
    if (role !== "STUDENT_ORGANIZER") {
      navigate("/login");
    }
  }, [role, navigate]);

  const loadEvents = async () => {
    try {
      const res = await api.get("/api/events");
      setEvents(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load your events."));
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const submit = async (eventId) => {
    try {
      await api.post(`/api/events/${eventId}/submit`);
      loadEvents();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not submit for approval."));
    }
  };

  const cancelEvent = async (eventId) => {
    if (!window.confirm("Cancel this event?")) return;
    try {
      await api.post(`/api/events/${eventId}/cancel`);
      loadEvents();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not cancel this event."));
    }
  };

  const viewHistory = async (eventId) => {
    try {
      const res = await api.get(`/api/events/${eventId}/history`);
      setHistory(res.data.data);
      setHistoryFor(eventId);
    } catch (err) {
      alert(apiErrorMessage(err, "Could not load approval history."));
    }
  };

  const addWinner = async (eventId) => {
    if (!winnerForm || !winnerForm.participantName || !winnerForm.position) {
      alert("Participant name and position are required");
      return;
    }
    try {
      await api.post(`/api/events/${eventId}/winners`, winnerForm);
      alert("Winner recorded");
      setWinnerForm(null);
    } catch (err) {
      alert(apiErrorMessage(err, "Could not add winner."));
    }
  };

  const uploadGalleryImage = async (eventId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post(`/api/events/${eventId}/gallery`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Image added to gallery");
    } catch (err) {
      alert(apiErrorMessage(err, "Could not upload image."));
    }
  };

  return (
    <div className="dashboard">
      {open && <div className="overlay" onClick={() => setOpen(false)}></div>}

      <div className="topbar">
        <button className="menu-btn" onClick={() => setOpen(!open)}>☰</button>
        <h2>Organizer Dashboard</h2>
      </div>

      <div className={`sidebar ${open ? "active" : ""}`}>
        <h2>Organizer Panel</h2>
        <ul>
          <li onClick={() => navigate("/organizer")}>My Events</li>
          <li onClick={() => navigate("/create-event")}>+ Create Event</li>
          <li onClick={() => navigate("/calendar")}>Event Calendar</li>
        </ul>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <div className="dashboard-main">
        <h1>Welcome {name}</h1>

        {error && <div className="error-text">{error}</div>}

        <div className="section-block table-container">
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
              {events.map((e) => (
                <React.Fragment key={e.id}>
                  <tr>
                    <td>{e.title}</td>
                    <td>{e.venueName}</td>
                    <td>{new Date(e.startTime).toLocaleString()}</td>
                    <td><span className={`badge ${STATUS_BADGE[e.status] || ""}`}>{e.status}</span></td>
                    <td className="inline-actions">
                      {(e.status === "DRAFT" || e.status === "REJECTED") && (
                        <>
                          <button onClick={() => navigate(`/edit-event/${e.id}`)}>Edit</button>
                          <button onClick={() => submit(e.id)}>Submit</button>
                        </>
                      )}
                      {e.status !== "CANCELLED" && e.status !== "COMPLETED" && (
                        <button className="danger" onClick={() => cancelEvent(e.id)}>Cancel</button>
                      )}
                      <button className="secondary" onClick={() => navigate(`/events/${e.id}/roster`)}>Roster</button>
                      <button className="secondary" onClick={() => viewHistory(e.id)}>History</button>
                      {(e.status === "PUBLISHED" || e.status === "COMPLETED") && (
                        <>
                          <button className="secondary" onClick={() => setWinnerForm({ eventId: e.id, participantName: "", position: "", prize: "" })}>+ Winner</button>
                          <label className="secondary" style={{ display: "inline-block", padding: "6px 12px", background: "#6b7280", color: "white", borderRadius: 5, cursor: "pointer", fontSize: 13 }}>
                            + Photo
                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(ev) => uploadGalleryImage(e.id, ev.target.files[0])} />
                          </label>
                        </>
                      )}
                    </td>
                  </tr>

                  {historyFor === e.id && (
                    <tr>
                      <td colSpan={5}>
                        <strong>Approval History</strong>
                        <ul>
                          {history.map((h) => (
                            <li key={h.id}>
                              {h.fromStatus || "—"} → {h.toStatus} by {h.actorName} on {new Date(h.createdAt).toLocaleString()}
                              {h.remarks ? ` — "${h.remarks}"` : ""}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}

                  {winnerForm && winnerForm.eventId === e.id && (
                    <tr>
                      <td colSpan={5}>
                        <div className="form-card" style={{ maxWidth: 400 }}>
                          <label>Participant Name</label>
                          <input value={winnerForm.participantName} onChange={(ev) => setWinnerForm({ ...winnerForm, participantName: ev.target.value })} />
                          <label>Position</label>
                          <input placeholder="e.g. 1st Place" value={winnerForm.position} onChange={(ev) => setWinnerForm({ ...winnerForm, position: ev.target.value })} />
                          <label>Prize (optional)</label>
                          <input value={winnerForm.prize} onChange={(ev) => setWinnerForm({ ...winnerForm, prize: ev.target.value })} />
                          <div className="inline-actions" style={{ marginTop: 10 }}>
                            <button onClick={() => addWinner(e.id)}>Save Winner</button>
                            <button className="secondary" onClick={() => setWinnerForm(null)}>Cancel</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={5}>You haven't created any events yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrganizerDashboard;
