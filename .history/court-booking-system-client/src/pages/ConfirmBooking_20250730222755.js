import React, { useState } from "react";
import "../styles/ConfirmBooking.css";

const HOURS = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12"
];
const MINUTES = ["00", "15", "30", "45"];
const AMPM = ["AM", "PM"];

const ConfirmBooking = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const dateObj = new Date();
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, date, startTime, endTime } = formData;

    if (!name || !email || !date || !startTime || !endTime) {
      setErrorMessage("Please fill all fields.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    if (end <= start) {
      setErrorMessage("End time must be after start time.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    // Simulate successful booking
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("✅ Booking successful!", {
        body: "Redirecting to My Bookings page...",
        icon: "/favicon.ico",
      });
    } else {
      alert("Booking successful! (Enable notification permissions to get notified)");
    }

    alert("Redirecting to My Bookings page...");
  };

  const renderTimeOptions = () => {
    const options = [];
    for (let ampm of AMPM) {
      for (let hour of HOURS) {
        for (let minute of MINUTES) {
          options.push(`${hour}:${minute} ${ampm}`);
        }
      }
    }
    return options;
  };

  return (
    <div className="booking-container">
      <h2>Confirm Your Booking</h2>
      <form onSubmit={handleSubmit} className="booking-form">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />

        <select name="startTime" value={formData.startTime} onChange={handleChange}>
          <option value="">Select Start Time</option>
          {renderTimeOptions().map((time) => (
            <option key={`start-${time}`} value={time}>{time}</option>
          ))}
        </select>

        <select name="endTime" value={formData.endTime} onChange={handleChange}>
          <option value="">Select End Time</option>
          {renderTimeOptions().map((time) => (
            <option key={`end-${time}`} value={time}>{time}</option>
          ))}
        </select>

        {errorMessage && <p className="error">{errorMessage}</p>}

        <button type="submit">Book Now</button>
      </form>
    </div>
  );
};

export default ConfirmBooking;
