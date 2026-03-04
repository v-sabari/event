import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function FacultyDashboard() {

  const navigate = useNavigate();

  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("dashboard");

  const [showPopup, setShowPopup] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [events, setEvents] = useState([]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: ""
  });

  const API = "http://localhost:8080/api/events";

  // Route Protection
  useEffect(() => {
    if (!role || role !== "faculty") {
      navigate("/login");
    }
  }, [role, navigate]);

  // Fetch Events
  const fetchEvents = async () => {
    try {

      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setEvents(res.data);

    } catch {
      console.log("Fetch event error");
    }
  };

  useEffect(() => {
    fetchEvents();
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

  // Create / Update Event
  const handleCreateEvent = async () => {

    if (!newEvent.title || !newEvent.date) {
      alert("Fill all fields");
      return;
    }

    try {

      if (editingIndex !== null) {

        const eventId = events[editingIndex].id;

        await axios.put(
          `${API}/${eventId}`,
          newEvent,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

      } else {

        await axios.post(
          API,
          {
            title: newEvent.title,
            date: newEvent.date,
            registered: 0,
            status: "Active"
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      setNewEvent({ title: "", date: "" });
      setShowPopup(false);
      setEditingIndex(null);

      fetchEvents();

    } catch {
      alert("Operation failed");
    }
  };

  const handleDelete = async (index) => {

    try {

      const eventId = events[index].id;

      await axios.delete(`${API}/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchEvents();

    } catch {
      alert("Delete failed");
    }
  };

  const handleEdit = (index) => {

    setNewEvent({
      title: events[index].title,
      date: events[index].date
    });

    setEditingIndex(index);
    setShowPopup(true);
  };

  const toggleStatus = async (index) => {

    try {

      const event = events[index];

      await axios.put(
        `${API}/${event.id}`,
        {
          ...event,
          status: event.status === "Active" ? "Cancelled" : "Active"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchEvents();

    } catch {
      alert("Status update failed");
    }
  };

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
            className={active === "create" ? "active-link" : ""}
            onClick={() => scrollToSection("create")}
          >
            Create Event
          </li>

          <li
            className={active === "manage" ? "active-link" : ""}
            onClick={() => scrollToSection("manage")}
          >
            Manage Events
          </li>
        </ul>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="dashboard-main">

        <h1 id="dashboard">Welcome {name}</h1>

        <div className="stats-container">

          <div className="stat-card">
            <h3>Total Events</h3>
            <p>{events.length}</p>
          </div>

          <div className="stat-card">
            <h3>Total Registrations</h3>
            <p>
              {events.reduce((sum, e) => sum + (e.registered || 0), 0)}
            </p>
          </div>

          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p>
              ₹{events.reduce(
                (sum, e) => sum + ((e.registered || 0) * 100),
                0
              )}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default FacultyDashboard;