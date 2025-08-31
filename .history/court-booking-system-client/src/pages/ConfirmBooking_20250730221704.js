import React, { useState, useEffect } from "react";

const ConfirmBookingBasic = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Get today's date in YYYY-MM-DD format for min attribute of date input
  const todayStr = new Date().toISOString().split("T")[0];

  // Request notification permission once when component mounts
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.name || !formData.email || !formData.date || !formData.startTime || !formData.endTime) {
      setErrorMessage("Please fill all fields.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    // Check if end time is after start time
    if (formData.endTime <= formData.startTime) {
      setErrorMessage("End time must be after start time.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    // Show notification if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("✅ Booking successful!", {
        body: "Redirecting to My Bookings page...",
        icon: "/favicon.ico",
      });
    } else {
      alert("Notification permission not granted.");
    }

    // Simulate redirect message
    alert("Redirecting to My Bookings page...");
  };

  // Simple reusable style object for form inputs and labels
  const labelStyle = { display: "block", marginBottom: 6, fontWeight: "600" };
  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 4,
    border: "1px solid #ccc",
    fontSize: 16,
    boxSizing: "border-box",
  };
  const errorStyle = { color: "red", marginTop: 8, marginBottom: 10, fontWeight: "600" };

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "30px auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        backgroundColor: "#fafafa",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Basic Confirm Booking</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name" style={labelStyle}>
          Your Name:
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          style={inputStyle}
          placeholder="Enter your full name"
          required
        />

        <label htmlFor="email" style={labelStyle}>
          Your Email:
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={inputStyle}
          placeholder="example@mail.com"
          required
        />

        <label htmlFor="date" style={labelStyle}>
          Booking Date:
        </label>
        <input
          id="date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          style={inputStyle}
          min={todayStr} // disable dates before today
          required
        />

        <label htmlFor="startTime" style={labelStyle}>
          Start Time:
        </label>
        <input
          id="startTime"
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          style={inputStyle}
          step={900} // 15 minute steps
          required
        />

        <label htmlFor="endTime" style={labelStyle}>
          End Time:
        </label>
        <input
          id="endTime"
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          style={inputStyle}
          step={900} // 15 minute steps
          required
        />

        {errorMessage && <div style={errorStyle}>{errorMessage}</div>}

        <button
          type="submit"
          style={{
            marginTop: 15,
            width: "100%",
            padding: 12,
            backgroundColor: "#28a745",
            color: "white",
            fontSize: 18,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Proceed to Payment
        </button>
      </form>
    </div>
  );
};

export default ConfirmBookingBasic;
