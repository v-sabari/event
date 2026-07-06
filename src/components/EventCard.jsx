import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/api";

function EventCard({ event }) {

  const navigate = useNavigate();

  const handleRegisterClick = () => {
    // Registration itself happens on the Student Dashboard (it needs to be
    // authenticated as a STUDENT and check deadline/capacity/waitlist there);
    // this card just gets the person to the right place.
    if (!auth.isLoggedIn()) {
      navigate("/login");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="event-container">

      <img
        src={event?.bannerUrl || "/src/assets/lap.jpeg"}
        alt="event"
      />

      <h3>{event?.title}</h3>

      <p>Date: {event?.startTime ? new Date(event.startTime).toLocaleString() : "TBA"}</p>
      <p>Location: {event?.venueName || "Campus"}</p>
      <p>Fee: ₹{event?.fee || 0}</p>

      <button className="review-btn" onClick={handleRegisterClick}>
        Register
      </button>

    </div>
  );
}

export default EventCard;
