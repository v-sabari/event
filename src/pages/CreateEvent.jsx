import React, { useState } from "react";
import axios from "axios";

function CreateEvent() {

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const createEvent = async () => {

    try {

      await axios.post(
        "http://localhost:8080/api/events",
        { title, date, registered: 0, status: "Active" }
      );

      alert("Event Created");

      setTitle("");
      setDate("");

    } catch {
      alert("Create Failed");
    }
  };

  return (
    <div className="dashboard-main">

      <h2>Create Event</h2>

      <input
        placeholder="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button className="create-btn" onClick={createEvent}>
        Create Event
      </button>

    </div>
  );
}

export default CreateEvent;