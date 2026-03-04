import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import { Link } from "react-router-dom";

function Home() {

  const [events] = useState([
  {
    title: "Tech Fest",
    date: "2026-03-20",
    location: "Auditorium",
    fee: 200,
  },
  {
    title: "Workshop",
    date: "2026-04-10",
    location: "Lab",
    fee: 100,
  }
]);

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

        {events.map((event, index) => (
          <EventCard key={index} event={event} />
        ))}

      </div>

      <Footer />

    </div>
  );
}

export default Home;