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
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CommandPalette from "./components/CommandPalette.jsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>

      <CustomCursor />

      {/* ⭐ Global Layout Wrapper */}
      <div style={{ width: "100%", minHeight: "100vh" }}>

        <Routes>

          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/events" element={<Events />} />
          {/* Event Calendar (public) */}
          <Route path="/calendar" element={<Calendar />} />

          {/* FE-02: dispatches to the right role-specific dashboard
              (Admin/Faculty/Organizer/Student) internally - any
              authenticated user is allowed in here, so no allowedRoles.
              This also fixes a real gap: previously an anonymous visitor
              hitting /dashboard directly saw "Invalid Role" text instead
              of being redirected to /login, since Dashboard.jsx had no
              guard of its own at all. */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* Student Organizer - matches CreateEventController.java role /
              Dashboard.jsx's STUDENT_ORGANIZER branch. Reachable both via
              /dashboard (through Dashboard.jsx's branching) and directly
              here, so it needs its own guard. */}
          <Route path="/organizer" element={
            <ProtectedRoute allowedRoles={["STUDENT_ORGANIZER"]}><OrganizerDashboard /></ProtectedRoute>
          } />
          {/* EventController: createDraft/updateDraft allow STUDENT_ORGANIZER and SUPER_ADMIN. */}
          <Route path="/create-event" element={
            <ProtectedRoute allowedRoles={["STUDENT_ORGANIZER", "SUPER_ADMIN"]}><CreateEvent /></ProtectedRoute>
          } />
          <Route path="/edit-event/:id" element={
            <ProtectedRoute allowedRoles={["STUDENT_ORGANIZER", "SUPER_ADMIN"]}><CreateEvent /></ProtectedRoute>
          } />

          {/* FE-02: previously had NO protection at all. Roles match
              RegistrationController's GET /api/events/{id}/registrations,
              AttendanceController's POST /api/attendance/scan, and
              CertificateController's POST .../certificate - all three are
              @PreAuthorize("hasAnyRole('STUDENT_ORGANIZER','FACULTY_COORDINATOR','HOD','SUPER_ADMIN')"),
              i.e. every role EventRoster.jsx actually calls, deliberately
              excluding STUDENT. */}
          <Route path="/events/:id/roster" element={
            <ProtectedRoute allowedRoles={["STUDENT_ORGANIZER", "FACULTY_COORDINATOR", "HOD", "SUPER_ADMIN"]}><EventRoster /></ProtectedRoute>
          } />

          {/* Venue Management - VenueController writes allow SUPER_ADMIN/FACULTY_COORDINATOR. */}
          <Route path="/venues" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "FACULTY_COORDINATOR"]}><VenueManagement /></ProtectedRoute>
          } />

          {/* Department Management - DepartmentController writes are SUPER_ADMIN-only. */}
          <Route path="/departments" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><DepartmentManagement /></ProtectedRoute>
          } />

          {/* Club Management - ClubController writes allow SUPER_ADMIN/FACULTY_COORDINATOR. */}
          <Route path="/clubs" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "FACULTY_COORDINATOR"]}><ClubManagement /></ProtectedRoute>
          } />

          {/* Event Category Management - same role split as Clubs. */}
          <Route path="/event-categories" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "FACULTY_COORDINATOR"]}><EventCategoryManagement /></ProtectedRoute>
          } />

          {/* Reports - matches Reports.jsx's original SUPER_ADMIN/FACULTY_COORDINATOR/HOD check. */}
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "FACULTY_COORDINATOR", "HOD"]}><Reports /></ProtectedRoute>
          } />

          {/* FE-02: previously had NO protection at all. NotificationController
              has no @PreAuthorize - it just scopes every query to
              currentUser.getId() - so any authenticated user is allowed,
              not a specific role. */}
          <Route path="/notifications" element={
            <ProtectedRoute><Notifications /></ProtectedRoute>
          } />

          {/* User Management - UserController's POST/GET allow SUPER_ADMIN/FACULTY_COORDINATOR. */}
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "FACULTY_COORDINATOR"]}><UserManagement /></ProtectedRoute>
          } />

        </Routes>
            <CommandPalette />

      </div>

    </BrowserRouter>
  );
}

export default App;