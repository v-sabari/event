import React from "react";
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

  return <h2>Invalid Role</h2>;
}

export default Dashboard;
