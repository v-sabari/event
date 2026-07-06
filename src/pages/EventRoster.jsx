import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css";

const STATUS_BADGE = {
  REGISTERED: "badge-registered",
  WAITLISTED: "badge-waitlisted",
  CANCELLED: "badge-cancelled",
  ATTENDED: "badge-attended",
};

// QR Attendance: in a real deployment the qrToken value would come from a
// camera-based QR scanner library decoding the student's entry pass; that
// decoded string is exactly what gets posted here. A manual text input is
// included as a fallback / for testing without camera hardware.
function EventRoster() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");
  const [scanToken, setScanToken] = useState("");
  const [scanMessage, setScanMessage] = useState("");

  const load = async () => {
    try {
      const res = await api.get(`/api/events/${id}/registrations`);
      setRegistrations(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load the registration roster."));
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleScan = async (e) => {
    e.preventDefault();
    setScanMessage("");
    try {
      const res = await api.post("/api/attendance/scan", { qrToken: scanToken.trim() });
      setScanMessage(`Checked in: ${res.data.data.userName}`);
      setScanToken("");
      load();
    } catch (err) {
      setScanMessage(apiErrorMessage(err, "Check-in failed."));
    }
  };

  const generateCertificate = async (registrationId) => {
    try {
      await api.post(`/api/registrations/${registrationId}/certificate`);
      alert("Certificate generated");
    } catch (err) {
      alert(apiErrorMessage(err, "Could not generate certificate."));
    }
  };

  return (
    <div className="dashboard-main">
      <button className="inline-actions" onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>
        ← Back
      </button>
      <h2>Event Roster</h2>

      {error && <div className="error-text">{error}</div>}

      <form className="form-card" onSubmit={handleScan} style={{ maxWidth: 500 }}>
        <label>QR Attendance Check-In</label>
        <input
          placeholder="Scan or paste QR token"
          value={scanToken}
          onChange={(e) => setScanToken(e.target.value)}
        />
        <div className="inline-actions" style={{ marginTop: 10 }}>
          <button type="submit">Check In</button>
        </div>
        {scanMessage && <p>{scanMessage}</p>}
      </form>

      <div className="section-block table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Reg Number</th>
              <th>Status</th>
              <th>Registered At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r.id}>
                <td>{r.userName}</td>
                <td>{r.userRegNumber}</td>
                <td><span className={`badge ${STATUS_BADGE[r.status] || ""}`}>{r.status}</span></td>
                <td>{new Date(r.registeredAt).toLocaleString()}</td>
                <td className="inline-actions">
                  {r.status === "ATTENDED" && (
                    <button onClick={() => generateCertificate(r.id)}>Generate Certificate</button>
                  )}
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr><td colSpan={5}>No registrations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EventRoster;
