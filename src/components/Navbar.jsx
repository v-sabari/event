import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <h1 className="logo">Campus Connect</h1>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/login">Login</Link>
      </div>

    </nav>
  );
}

export default Navbar;