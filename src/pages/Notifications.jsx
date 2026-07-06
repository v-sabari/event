import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../services/api";
import "./Dashboard.css";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/api/notifications?size=50");
      setNotifications(res.data.data.content);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load notifications."));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      load();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update notification."));
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/api/notifications/read-all");
      load();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update notifications."));
    }
  };

  return (
    <div className="dashboard-main">
      <button onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Back</button>
      <h2>Notifications</h2>
      {error && <div className="error-text">{error}</div>}

      <div className="inline-actions" style={{ marginBottom: 10 }}>
        <button className="secondary" onClick={markAllRead}>Mark all as read</button>
      </div>

      <div className="section-block table-container">
        <table>
          <thead>
            <tr><th>Title</th><th>Message</th><th>Received</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id} style={{ fontWeight: n.read ? "normal" : "bold" }}>
                <td>{n.title}</td>
                <td>{n.message}</td>
                <td>{new Date(n.createdAt).toLocaleString()}</td>
                <td>{n.read ? "Read" : "Unread"}</td>
                <td>
                  {!n.read && (
                    <button className="inline-actions" onClick={() => markRead(n.id)}>Mark Read</button>
                  )}
                </td>
              </tr>
            ))}
            {notifications.length === 0 && (
              <tr><td colSpan={5}>No notifications yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Notifications;
