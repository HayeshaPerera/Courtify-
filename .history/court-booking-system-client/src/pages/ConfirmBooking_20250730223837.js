import React, { useState, useEffect } from "react";

const ConfirmBookingBasic = ({ courtName }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

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

    if (!formData.name || !formData.email || !formData.date || !formData.startTime || !formData.endTime) {
      setErrorMessage("Please fill all fields.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`✅ Booking for ${courtName}`, {
        body: "Redirecting to My Bookings page...",
        icon: "/favicon.ico",
      });
    } else {
      alert(`Booking confirmed for ${courtName}`);
    }

    alert("Redirecting to Payment page...");
  };

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const date = new Date();
        date.setHours(hour, min, 0);
        const formatted = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        times.push(formatted);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Confirm Booking</h2>
      {courtName && (
        <h3 style={{ textAlign: "center", color: "#555", marginBottom: "20px" }}>
          Court: <span style={{ fontWeight: "bold" }}>{courtName}</span>
        </h3>
      )}
      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label>Your Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label>Your Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label>Booking Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={getTodayDateString()}
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label>Start Time:</label>
          <select name="startTime" value={formData.startTime} onChange={handleChange} style={inputStyle}>
            <option value="">-- Select --</option>
            {timeOptions.map((time, idx) => (
              <option key={idx} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <div style={fieldStyle}>
          <label>End Time:</label>
          <select name="endTime" value={formData.endTime} onChange={handleChange} style={inputStyle}>
            <option value="">-- Select --</option>
            {timeOptions.map((time, idx) => (
              <option key={idx} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {errorMessage && <div style={{ color: "red", marginBottom: "10px" }}>{errorMessage}</div>}

        <button type="submit" style={buttonStyle}>
          Proceed to Payment
        </button>
      </form>
    </div>
  );
};

// === Styling ===

const containerStyle = {
  maxWidth: "450px",
  margin: "30px auto",
  fontFamily: "Arial, sans-serif",
  padding: "20px",
  border: "1px solid #ccc",
  borderRadius: "12px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
};

const titleStyle = {
  textAlign: "center",
  color: "#333",
  marginBottom: "10px",
};

const fieldStyle = {
  marginBottom: "15px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "12px",
  width: "100%",
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default ConfirmBookingBasic;
