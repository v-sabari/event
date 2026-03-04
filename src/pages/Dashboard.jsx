import React from "react";
import StudentDashboard from "./StudentDashboard";
import FacultyDashboard from "./FacultyDashboard";

function Dashboard() {

  const role = localStorage.getItem("role");

  if (role === "student") return <StudentDashboard />;
  if (role === "faculty") return <FacultyDashboard />;

  return <h2>Invalid Role</h2>;
}

export default Dashboard;