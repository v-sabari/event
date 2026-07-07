import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import { Link } from "react-router-dom";
import api from "../services/api";

// Preview count for the homepage teaser section - the full, filterable list
// lives on Events.jsx, so this stays intentionally short.
const HOME_PREVIEW_COUNT = 4;

function Home() {

  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Public, unauthenticated endpoint - same one Calendar.jsx and
    // Events.jsx already use. Errors are swallowed rather than shown as a
    // banner (consistent with Calendar.jsx): this is a public marketing
    // page, so an empty "Upcoming Events" section is an acceptable fallback
    // rather than surfacing a scary error to anonymous visitors.
    api.get("/api/events/published")
      .then((res) => {
        const upcoming = res.data.data
          .filter((e) => new Date(e.startTime) > new Date())
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .slice(0, HOME_PREVIEW_COUNT);
        setEvents(upcoming);
      })
      .catch(() => setEvents([]));
  }, []);

  return (
    <div>

      <Navbar />

      <section className="hero">
        <div>
          <h1>Welcome To Campus Connect</h1>
          <p>Discover and register events easily</p>

          <Link to="/events">
            <button className="hero-btn">
              Explore Events
            </button>
          </Link>
        </div>
      </section>

      <h2 style={{ textAlign: "center", marginTop: "20px" }}>
        Upcoming Events
      </h2>

      <div className="products-section">

        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}

        {events.length === 0 && (
          <p style={{ textAlign: "center", width: "100%" }}>
            No upcoming events right now — check back soon!
          </p>
        )}

      </div>

      <Footer />

    </div>
  );
}

export default Home;