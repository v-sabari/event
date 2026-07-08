import React from "react";
import "./App.css";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Events from "./pages/Events.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import OrganizerDashboard from "./pages/OrganizerDashboard.jsx";
import EventRoster from "./pages/EventRoster.jsx";
import Calendar from "./pages/Calendar.jsx";
import VenueManagement from "./pages/VenueManagement.jsx";
import DepartmentManagement from "./pages/DepartmentManagement.jsx";
import ClubManagement from "./pages/ClubManagement.jsx";
import EventCategoryManagement from "./pages/EventCategoryManagement.jsx";
import Reports from "./pages/Reports.jsx";
import Notifications from "./pages/Notifications.jsx";
import UserManagement from "./pages/UserManagement.jsx";
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

          <Route path="/forgot-password" element={<ForgotPassword />} />

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

          {/* Department Management (admin only - see DepartmentController) */}
          <Route path="/departments" element={<DepartmentManagement />} />

          {/* Club Management (admin/faculty) */}
          <Route path="/clubs" element={<ClubManagement />} />

          {/* Event Category Management (admin/faculty) */}
          <Route path="/event-categories" element={<EventCategoryManagement />} />

          {/* Reports (admin/faculty/HOD) */}
          <Route path="/reports" element={<Reports />} />

          {/* Notifications (any authenticated user) */}
          <Route path="/notifications" element={<Notifications />} />

          {/* User Management (admin/faculty) */}
          <Route path="/users" element={<UserManagement />} />

        </Routes>

      </div>

    </BrowserRouter>
  );
}

export default App;