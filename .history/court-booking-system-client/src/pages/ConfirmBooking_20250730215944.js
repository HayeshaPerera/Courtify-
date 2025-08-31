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

  // Request notification permission once when component mounts
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.name || !formData.email || !formData.date || !formData.startTime || !formData.endTime) {
      setErrorMessage("Please fill all fields.");
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

  return (
    <div style={{ maxWidth: "400px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h2>Basic Confirm Booking</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Your Name:</label><br />
          <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Your Email:</label><br />
          <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Booking Date:</label><br />
          <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Start Time:</label><br />
          <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>End Time:</label><br />
          <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} style={{ width: "100%" }} />
        </div>

        {errorMessage && <div style={{ color: "red", marginBottom: "10px" }}>{errorMessage}</div>}

        <button type="submit" style={{ padding: "10px", width: "100%", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer" }}>
          Proceed to Payment
        </button>
      </form>
    </div>
  );
};

export default ConfirmBookingBasic;
