import React, { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";

// Search & Filters module: Event Name, Department, Category, Venue, Date.
function Events() {

  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);

  const [filters, setFilters] = useState({
    name: "",
    departmentId: "",
    categoryId: "",
    venueId: "",
    date: "",
  });

  useEffect(() => {
    // BE-17: these three populate filter <select> dropdowns (not tables),
    // and all now return Page<T> - request the full set via a large,
    // explicit size and unwrap .content. /api/events/search and
    // /api/events/published below are untouched (out of this bug's scope).
    const LOOKUP_SIZE = 1000;
    api.get("/api/departments", { params: { size: LOOKUP_SIZE } }).then((res) => setDepartments(res.data.data.content)).catch(() => {});
    api.get("/api/event-categories", { params: { size: LOOKUP_SIZE } }).then((res) => setCategories(res.data.data.content)).catch(() => {});
    api.get("/api/venues", { params: { size: LOOKUP_SIZE } }).then((res) => setVenues(res.data.data.content)).catch(() => {});
  }, []);

  const loadEvents = () => {
    const hasFilters = Object.values(filters).some((v) => v !== "");
    const url = hasFilters ? "/api/events/search" : "/api/events/published";
    const params = hasFilters
      ? Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""))
      : {};

    api.get(url, { params })
      .then(res => setEvents(res.data.data))
      .catch(() => setEvents([]));
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadEvents();
  };

  const clearFilters = () => {
    setFilters({ name: "", departmentId: "", categoryId: "", venueId: "", date: "" });
    setTimeout(loadEvents, 0);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-main">

      <h2>All Events</h2>

      <form className="form-card" onSubmit={handleSearch} style={{ maxWidth: "100%" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 180px" }}>
            <label>Event Name</label>
            <input name="name" value={filters.name} onChange={handleFilterChange} placeholder="Search by title" />
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label>Department</label>
            <select name="departmentId" value={filters.departmentId} onChange={handleFilterChange}>
              <option value="">All</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label>Category</label>
            <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange}>
              <option value="">All</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label>Venue</label>
            <select name="venueId" value={filters.venueId} onChange={handleFilterChange}>
              <option value="">All</option>
              {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label>Date</label>
            <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
          </div>
        </div>
        <div className="inline-actions" style={{ marginTop: 12 }}>
          <button type="submit">Search</button>
          <button type="button" className="secondary" onClick={clearFilters}>Clear</button>
        </div>
      </form>

      <div className="products-section">

        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}

        {events.length === 0 && <p>No events match your search.</p>}

      </div>

      </div>
      <Footer />
    </>
  );
}

export default Events;