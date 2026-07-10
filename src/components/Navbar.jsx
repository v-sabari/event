import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const loggedIn = auth.isLoggedIn();

  const name = (typeof window !== "undefined" && localStorage.getItem("name")) || "";
  const role = (typeof window !== "undefined" && localStorage.getItem("role")) || "";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "U";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const logout = () => {
    setMenuOpen(false);
    auth.clearSession();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo-wrap">
        <img src="/favicon.ico" alt="Campus Connect logo" className="logo-icon" />
        <h1 className="logo">Campus Connect</h1>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/calendar">Calendar</Link>

        {loggedIn ? (
          <>
            <Link to="/dashboard">Dashboard</Link>

            <div className="qw-avatar-wrap" ref={menuRef}>
              <button
                type="button"
                className="qw-avatar-btn"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                title={name || "Account"}
              >
                <span className="qw-avatar-initials">{initials}</span>
              </button>

              {menuOpen && (
                <div className="qw-avatar-menu" role="menu">
                  <div className="qw-avatar-menu-header">
                    <div className="qw-avatar-menu-name">{name || "Account"}</div>
                    {role && <div className="qw-avatar-menu-role">{role.replace(/_/g, " ")}</div>}
                  </div>
                  <button
                    type="button"
                    className="qw-avatar-menu-item"
                    onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    className="qw-avatar-menu-item"
                    onClick={() => { setMenuOpen(false); navigate("/notifications"); }}
                  >
                    Notifications
                  </button>
                  <div className="qw-avatar-menu-sep" />
                  <button
                    type="button"
                    className="qw-avatar-menu-item qw-avatar-menu-danger"
                    onClick={logout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;