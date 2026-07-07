import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { API_BASE_URL, apiErrorMessage } from "../services/api";

import "./Dashboard.css";

const STATUS_BADGE = {
  REGISTERED: "badge-registered",
  WAITLISTED: "badge-waitlisted",
  CANCELLED: "badge-cancelled",
  ATTENDED: "badge-attended",
};

function StudentDashboard() {

  const navigate = useNavigate();

  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("dashboard");

  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [error, setError] = useState("");

  const [qrImage, setQrImage] = useState(null); // object URL for the QR modal
  const [feedbackFor, setFeedbackFor] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comments: "" });
  const [processingId, setProcessingId] = useState(null); // id of the event/registration currently being acted on

  // Route Protection (fixed to match the real backend role value: "STUDENT")
  useEffect(() => {
    if (!role || role !== "STUDENT") {
      navigate("/login");
    }
  }, [role, navigate]);

  // Fetch published events (Event Calendar / browse module)
  const fetchEvents = async () => {
    try {
      const res = await api.get("/api/events/published");
      setEvents(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load events."));
    }
  };

  // Fetch My Registrations
  const fetchRegistrations = async () => {
    try {
      const res = await api.get("/api/registrations/mine");
      setMyRegistrations(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load your registrations."));
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
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

  const isRegistered = (eventId) =>
    myRegistrations.some(
      (r) => r.eventId === eventId && r.status !== "CANCELLED"
    );

  const handleRegister = async (event) => {

    if (isRegistered(event.id)) {
      alert("You are already registered for this event.");
      return;
    }

    if (event.fee > 0) {
      const confirmPay = window.confirm(
        `This event has a fee of ₹${event.fee}. Registering confirms your intent to pay at the venue. Continue?`
      );
      if (!confirmPay) return;
    }

    try {
      setProcessingId(event.id);
      const res = await api.post(`/api/events/${event.id}/registrations`);
      alert(res.data.message);
      fetchRegistrations();
      fetchEvents();
    } catch (err) {
      alert(apiErrorMessage(err, "Registration failed."));
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm("Cancel this registration?")) return;
    try {
      setProcessingId(registrationId);
      await api.delete(`/api/registrations/${registrationId}`);
      fetchRegistrations();
      fetchEvents();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not cancel registration."));
    } finally {
      setProcessingId(null);
    }
  };

  // QR Entry Pass: the download endpoint requires an Authorization header,
  // which a plain <img src> can't send - so it's fetched as a blob and
  // shown via an object URL instead.
  const viewQrPass = async (registrationId) => {
    try {
      const res = await api.get(`/api/registrations/${registrationId}/qr`, {
        responseType: "blob",
      });
      setQrImage(URL.createObjectURL(res.data));
    } catch (err) {
      alert(apiErrorMessage(err, "Could not load QR pass."));
    }
  };

  const downloadCertificate = async (registrationId) => {
    try {
      const res = await api.get(`/api/registrations/${registrationId}/certificate`);
      window.open(`${API_BASE_URL}${res.data.data.downloadUrl}`, "_blank");
    } catch (err) {
      alert(apiErrorMessage(err, "Certificate not available yet."));
    }
  };

  const submitFeedback = async (eventId) => {
    try {
      setProcessingId(eventId);
      await api.post(`/api/events/${eventId}/feedback`, feedbackForm);
      alert("Thank you for your feedback!");
      setFeedbackFor(null);
      setFeedbackForm({ rating: 5, comments: "" });
    } catch (err) {
      alert(apiErrorMessage(err, "Could not submit feedback."));
    } finally {
      setProcessingId(null);
    }
  };

  const totalPayment = myRegistrations
    .filter((r) => r.status !== "CANCELLED")
    .reduce((sum, r) => {
      const ev = events.find((e) => e.id === r.eventId);
      return sum + (ev ? Number(ev.fee) : 0);
    }, 0);

  return (
    <div className="dashboard">

      {open && <div className="overlay" onClick={() => setOpen(false)}></div>}

      {qrImage && (
        <div className="qr-modal-backdrop" onClick={() => setQrImage(null)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Your Entry Pass</h3>
            <img src={qrImage} alt="QR entry pass" />
            <p>Show this at the venue to check in.</p>
            <button onClick={() => setQrImage(null)}>Close</button>
          </div>
        </div>
      )}

      <div className="topbar">
        <button className="menu-btn" onClick={() => setOpen(!open)}>☰</button>
        <h2>Student Dashboard</h2>
      </div>

      <div className={`sidebar ${open ? "active" : ""}`}>
        <h2>Student Panel</h2>

        <ul>
          <li
            className={active === "dashboard" ? "active-link" : ""}
            onClick={() => scrollToSection("dashboard")}
          >
            Dashboard
          </li>

          <li
            className={active === "events" ? "active-link" : ""}
            onClick={() => scrollToSection("events")}
          >
            Available Events
          </li>

          <li
            className={active === "my" ? "active-link" : ""}
            onClick={() => scrollToSection("my")}
          >
            My Registrations
          </li>

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
            <h3>Available Events</h3>
            <p>{events.length}</p>
          </div>

          <div className="stat-card">
            <h3>My Registrations</h3>
            <p>{myRegistrations.filter((r) => r.status !== "CANCELLED").length}</p>
          </div>

          <div className="stat-card">
            <h3>Total Payment</h3>
            <p>₹{totalPayment}</p>
          </div>

        </div>

        <div id="events" className="section-block table-container">
          <h2>Available Events</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Venue</th>
                <th>Start Time</th>
                <th>Deadline</th>
                <th>Fee</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td>{e.venueName}</td>
                  <td>{new Date(e.startTime).toLocaleString()}</td>
                  <td>{new Date(e.registrationDeadline).toLocaleString()}</td>
                  <td>₹{e.fee}</td>
                  <td>
                    <button
                      className="inline-actions"
                      disabled={isRegistered(e.id) || processingId === e.id}
                      onClick={() => handleRegister(e)}
                    >
                      {processingId === e.id ? (
                        <><span className="spinner"></span>Registering...</>
                      ) : isRegistered(e.id) ? "Registered" : "Register"}
                    </button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={6}>No events available right now.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div id="my" className="section-block table-container">
          <h2>My Registrations</h2>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myRegistrations.map((r) => (
                <React.Fragment key={r.id}>
                  <tr>
                    <td>{r.eventTitle}</td>
                    <td><span className={`badge ${STATUS_BADGE[r.status] || ""}`}>{r.status}</span></td>
                    <td className="inline-actions">
                      {(r.status === "REGISTERED" || r.status === "ATTENDED") && (
                        <button onClick={() => viewQrPass(r.id)}>View QR Pass</button>
                      )}
                      {(r.status === "REGISTERED" || r.status === "WAITLISTED") && (
                        <button className="danger" disabled={processingId === r.id} onClick={() => handleCancelRegistration(r.id)}>
                          {processingId === r.id ? <><span className="spinner"></span>Cancelling...</> : "Cancel"}
                        </button>
                      )}
                      {r.status === "ATTENDED" && (
                        <>
                          <button className="secondary" onClick={() => downloadCertificate(r.id)}>Certificate</button>
                          <button className="secondary" onClick={() => setFeedbackFor(r.eventId)}>Feedback</button>
                        </>
                      )}
                    </td>
                  </tr>
                  {feedbackFor === r.eventId && (
                    <tr>
                      <td colSpan={3}>
                        <div className="form-card" style={{ maxWidth: 400 }}>
                          <label>Rating (1-5)</label>
                          <input
                            type="number" min="1" max="5"
                            value={feedbackForm.rating}
                            onChange={(ev) => setFeedbackForm({ ...feedbackForm, rating: Number(ev.target.value) })}
                          />
                          <label>Comments</label>
                          <textarea
                            className="remarks-box"
                            value={feedbackForm.comments}
                            onChange={(ev) => setFeedbackForm({ ...feedbackForm, comments: ev.target.value })}
                          />
                          <div className="inline-actions" style={{ marginTop: 10 }}>
                            <button disabled={processingId === r.eventId} onClick={() => submitFeedback(r.eventId)}>
                              {processingId === r.eventId ? <><span className="spinner"></span>Submitting...</> : "Submit"}
                            </button>
                            <button className="secondary" onClick={() => setFeedbackFor(null)}>Cancel</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {myRegistrations.length === 0 && (
                <tr><td colSpan={3}>You haven't registered for any events yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

export default StudentDashboard;
