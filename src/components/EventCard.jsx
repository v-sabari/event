import React from "react";

function EventCard({ event }) {
  return (
    <div className="event-container">

      <img
        src="/src/assets/lap.jpeg"
        alt="event"
      />

      <h3>{event?.title}</h3>

      <p>Date: {event?.date}</p>
      <p>Location: {event?.location || "Campus"}</p>
      <p>Fee: ₹{event?.fee || 0}</p>

      <button className="review-btn">
        Register
      </button>

    </div>
  );
}

export default EventCard;