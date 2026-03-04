import React from "react";
import "./App.css";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Events from "./pages/Events.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>

      {/* ⭐ Global Layout Wrapper */}
      <div style={{ width: "100%", minHeight: "100vh" }}>

        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/events" element={<Events />} />

        </Routes>

      </div>

    </BrowserRouter>
  );
}

export default App;