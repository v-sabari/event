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

  useEffect(() => {
    if (role !== "SUPER_ADMIN") navigate("/login");
  }, [role, navigate]);

  useEffect(() => {
    api.get("/api/dashboard/admin")
      .then((res) => setSummary(res.data.data))
      .catch((err) => setError(apiErrorMessage(err, "Could not load dashboard summary.")));
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
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
          <li onClick={() => navigate("/dashboard")}>Overview</li>
          <li onClick={() => navigate("/reports")}>Reports</li>
          <li onClick={() => navigate("/venues")}>Manage Venues</li>
          <li onClick={() => navigate("/calendar")}>Event Calendar</li>
          <li onClick={() => navigate("/events")}>Search Events</li>
        </ul>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <div className="dashboard-main">
        <h1>Welcome {name}</h1>

        {error && <div className="error-text">{error}</div>}

        {summary && (
          <>
            <div className="stats-container">
              <div className="stat-card"><h3>Total Users</h3><p>{summary.totalUsers}</p></div>
              <div className="stat-card"><h3>Total Events</h3><p>{summary.totalEvents}</p></div>
              <div className="stat-card"><h3>Pending Approvals</h3><p>{summary.pendingApprovals}</p></div>
              <div className="stat-card"><h3>Active Events</h3><p>{summary.activeEvents}</p></div>
              <div className="stat-card"><h3>Today's Events</h3><p>{summary.todaysEvents}</p></div>
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
