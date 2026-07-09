import React from "react";
import { Navigate } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import FacultyDashboard from "./FacultyDashboard";
import OrganizerDashboard from "./OrganizerDashboard";
import AdminDashboard from "./AdminDashboard";

function Dashboard() {

  const role = localStorage.getItem("role");

  if (role === "STUDENT") return <StudentDashboard />;
  if (role === "STUDENT_ORGANIZER") return <OrganizerDashboard />;
  if (role === "SUPER_ADMIN") return <AdminDashboard />;
  // Faculty Coordinator and HOD share the approval-queue shell - the backend
  // already scopes what each role can see and act on (e.g.
  // GET /api/events/pending-approval returns only the stage relevant to the caller).
  if (role === "FACULTY_COORDINATOR" || role === "HOD") {
    return <FacultyDashboard />;
  }

  // FE-04: this route is wrapped in <ProtectedRoute> (App.jsx), which already
  // redirects a logged-out visitor to /login before this component ever
  // renders - so `role` being null/empty here can't happen via normal
  // navigation anymore. This branch is what's left: a valid session whose
  // role somehow doesn't match any known value (e.g. manually edited
  // localStorage, or a future role added on the backend before the frontend
  // is updated to handle it). Redirect instead of showing "Invalid Role"
  // text, consistent with how every other protected page behaves.
  return <Navigate to="/login" replace />;
}

export default Dashboard;