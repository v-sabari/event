import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css";

function Reports() {
  const navigate = useNavigate();

  const [deptWise, setDeptWise] = useState([]);
  const [catWise, setCatWise] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [topDept, setTopDept] = useState(null);
  const [topStudent, setTopStudent] = useState(null);
  const [error, setError] = useState("");

  // FE-02: role-check centralized in ProtectedRoute (wraps /reports in
  // App.jsx, allowedRoles=["SUPER_ADMIN", "FACULTY_COORDINATOR", "HOD"]).

  useEffect(() => {
    Promise.all([
      api.get("/api/reports/department-wise-events"),
      api.get("/api/reports/category-wise-events"),
      api.get("/api/reports/attendance"),
      api.get("/api/reports/registrations"),
      api.get("/api/reports/feedback-analysis"),
      api.get("/api/reports/most-active-department"),
      api.get("/api/reports/most-active-student"),
    ])
      .then(([d, c, a, r, f, td, ts]) => {
        setDeptWise(d.data.data);
        setCatWise(c.data.data);
        setAttendance(a.data.data);
        setRegistrations(r.data.data);
        setFeedback(f.data.data);
        setTopDept(td.data.data);
        setTopStudent(ts.data.data);
      })
      .catch((err) => setError(apiErrorMessage(err, "Could not load reports.")));
  }, []);

  return (
    <div className="dashboard-main">
      <button onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Back</button>
      <h2>Reports</h2>
      {error && <div className="error-text">{error}</div>}

      <div className="stats-container">
        <div className="stat-card">
          <h3>Most Active Department</h3>
          <p>{topDept?.department || "—"}</p>
          <small>{topDept?.eventCount || 0} events</small>
        </div>
        <div className="stat-card">
          <h3>Most Active Student</h3>
          <p>{topStudent?.studentName || "—"}</p>
          <small>{topStudent?.eventCount || 0} registrations</small>
        </div>
        <div className="stat-card">
          <h3>Overall Feedback Rating</h3>
          <p>{feedback?.overallAverageRating ?? "—"} / 5</p>
        </div>
      </div>

      <div className="section-block table-container">
        <h3>Department-wise Events</h3>
        <table>
          <thead><tr><th>Department</th><th>Event Count</th></tr></thead>
          <tbody>
            {deptWise.map((row, i) => (
              <tr key={i}><td>{row.department}</td><td>{row.eventCount}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-block table-container">
        <h3>Category-wise Events</h3>
        <table>
          <thead><tr><th>Category</th><th>Event Count</th></tr></thead>
          <tbody>
            {catWise.map((row, i) => (
              <tr key={i}><td>{row.category}</td><td>{row.eventCount}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-block table-container">
        <h3>Attendance Report</h3>
        <table>
          <thead><tr><th>Event</th><th>Registered</th><th>Attended</th><th>Attendance Rate</th></tr></thead>
          <tbody>
            {attendance.map((row) => (
              <tr key={row.eventId}>
                <td>{row.eventTitle}</td>
                <td>{row.registered}</td>
                <td>{row.attended}</td>
                <td>{row.attendanceRatePercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-block table-container">
        <h3>Registration Report</h3>
        <table>
          <thead><tr><th>Event</th><th>Registered</th><th>Waitlisted</th><th>Cancelled</th><th>Attended</th></tr></thead>
          <tbody>
            {registrations.map((row) => (
              <tr key={row.eventId}>
                <td>{row.eventTitle}</td>
                <td>{row.registered}</td>
                <td>{row.waitlisted}</td>
                <td>{row.cancelled}</td>
                <td>{row.attended}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-block table-container">
        <h3>Feedback Analysis (per event)</h3>
        <table>
          <thead><tr><th>Event</th><th>Average Rating</th><th>Responses</th></tr></thead>
          <tbody>
            {feedback?.perEvent?.map((row) => (
              <tr key={row.eventId}>
                <td>{row.eventTitle}</td>
                <td>{row.averageRating} / 5</td>
                <td>{row.responseCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;