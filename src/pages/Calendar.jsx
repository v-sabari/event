import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import "../pages/Dashboard.css";

// Event Calendar module: public, read-only, grouped by date for a quick
// day-by-day view rather than a flat table (Events.jsx already covers the
// flat/browsable listing, so this page is deliberately date-first).
function Calendar() {
  const [eventsByDate, setEventsByDate] = useState({});

  useEffect(() => {
    api.get("/api/events/published").then((res) => {
      const grouped = {};
      res.data.data.forEach((e) => {
        const day = new Date(e.startTime).toDateString();
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(e);
      });
      setEventsByDate(grouped);
    });
  }, []);

  const sortedDays = Object.keys(eventsByDate).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return (
    <>
      <Navbar />
      <div className="dashboard-main">
        <h2>Event Calendar</h2>

        {sortedDays.length === 0 && <p>No upcoming published events.</p>}

        {sortedDays.map((day) => (
          <div key={day} className="section-block">
            <h3>{day}</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Title</th>
                    <th>Venue</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {eventsByDate[day].map((e) => (
                    <tr key={e.id}>
                      <td>{new Date(e.startTime).toLocaleTimeString()}</td>
                      <td>{e.title}</td>
                      <td>{e.venueName}</td>
                      <td>{e.categoryName || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
}

export default Calendar;
