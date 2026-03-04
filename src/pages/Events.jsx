import React, { useEffect, useState } from "react";
import EventCard from "../components/EventCard";

function Events() {

  const [events, setEvents] = useState([]);

  useEffect(() => {

    fetch("http://localhost:8080/api/events")
      .then(res => res.json())
      .then(data => setEvents(data));

  }, []);

  return (
    <div className="dashboard-main">

      <h2>All Events</h2>

      <div className="products-section">

        {events.map((event, index) => (
          <EventCard key={index} event={event} />
        ))}

      </div>

    </div>
  );
}

export default Events;