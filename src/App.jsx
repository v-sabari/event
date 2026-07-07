import React from "react";
import "./App.css";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Events from "./pages/Events.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import OrganizerDashboard from "./pages/OrganizerDashboard.jsx";
import EventRoster from "./pages/EventRoster.jsx";
import Calendar from "./pages/Calendar.jsx";
import VenueManagement from "./pages/VenueManagement.jsx";
import Reports from "./pages/Reports.jsx";
import Notifications from "./pages/Notifications.jsx";
import CustomCursor from "./components/CustomCursor.jsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>

      <CustomCursor />

      {/* ⭐ Global Layout Wrapper */}
      <div style={{ width: "100%", minHeight: "100vh" }}>

        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/events" element={<Events />} />

          {/* Student Organizer */}
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/edit-event/:id" element={<CreateEvent />} />

          {/* Shared: roster/attendance (organizer + faculty/HOD/admin) */}
          <Route path="/events/:id/roster" element={<EventRoster />} />

          {/* Event Calendar (public) */}
          <Route path="/calendar" element={<Calendar />} />

          {/* Venue Management (admin/faculty) */}
          <Route path="/venues" element={<VenueManagement />} />

          {/* Reports (admin/faculty/HOD) */}
          <Route path="/reports" element={<Reports />} />

          {/* Notifications (any authenticated user) */}
          <Route path="/notifications" element={<Notifications />} />

        </Routes>

      </div>

    </BrowserRouter>
  );
}

export default App;