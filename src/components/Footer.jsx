import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-section">
          <h3>About</h3>
          <p>
            Campus Connect is a platform for students to discover
            and register for college events easily and securely.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>

          <p><Link to="/">Home</Link></p>
          <p><Link to="/events">Events</Link></p>
          <p><Link to="/login">Login</Link></p>

        </div>

        <div className="footer-section">
          <h3>Contact</h3>

          <p>Email: campusconnect@gmail.com</p>
          <p>Phone: +91 6379766032</p>
          <p>Location: Erode Sengunthar Engineering College</p>

        </div>

      </div>

      <div className="footer-bottom">
        © 2026 Campus Connect. All Rights Reserved.
      </div>

    </footer>
  );
}

export default Footer;