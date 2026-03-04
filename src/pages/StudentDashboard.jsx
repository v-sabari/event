import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

function StudentDashboard() {

  const navigate = useNavigate();

  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("dashboard");

  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);

  const API = "http://localhost:8080/api/events";
  const REG_API = "http://localhost:8080/api/registrations";

  // Route Protection
  useEffect(() => {
    if (!role || role !== "student") {
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
      console.log("Event fetch error");
    }
  };

  // Fetch My Registrations
  const fetchRegistrations = async () => {
    try {

      const res = await axios.get(`${REG_API}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMyRegistrations(res.data);

    } catch {
      console.log("Registration fetch error");
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

  const handleRegister = async (event) => {

    if (event.status !== "Active") {
      alert("This event is not active");
      return;
    }

    if (myRegistrations.find(e => e.title === event.title)) {
      alert("Already Registered");
      return;
    }

    const confirmPay = window.confirm(
      `Pay ₹${event.fee || 100} to register for ${event.title}?`
    );

    if (!confirmPay) return;

    try {

      await axios.post(
        REG_API,
        {
          eventId: event.id,
          studentName: name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Payment successful! Registered.");

      fetchRegistrations();
      fetchEvents();

    } catch {
      alert("Registration failed");
    }
  };

  const totalPayment = myRegistrations.reduce(
    (sum, e) => sum + (e.fee || 100),
    0
  );

  return (
    <div className="dashboard">

      {open && <div className="overlay" onClick={() => setOpen(false)}></div>}

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
        </ul>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="dashboard-main">

        <h1 id="dashboard">Welcome {name}</h1>

        <div className="stats-container">

          <div className="stat-card">
            <h3>Available Events</h3>
            <p>{events.length}</p>
          </div>

          <div className="stat-card">
            <h3>My Registrations</h3>
            <p>{myRegistrations.length}</p>
          </div>

          <div className="stat-card">
            <h3>Total Payment</h3>
            <p>₹{totalPayment}</p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default StudentDashboard;