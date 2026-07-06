import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/api";

function Navbar() {

  const navigate = useNavigate();
  const loggedIn = auth.isLoggedIn();

  const logout = () => {
    auth.clearSession();
    navigate("/login");
  };

  return (
    <nav className="navbar">

      <h1 className="logo">Campus Connect</h1>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/calendar">Calendar</Link>

        {loggedIn ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="#" onClick={logout}>Logout</Link>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>

    </nav>
  );
}

export default Navbar;
