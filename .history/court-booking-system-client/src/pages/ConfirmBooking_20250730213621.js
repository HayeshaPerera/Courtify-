import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import { useSelector } from "react-redux";
import "../styles/ConfirmBooking.css";

const HOURS = [...Array(12)].map((_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const AMPM = ["AM", "PM"];

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};
  const user = useSelector((state) => state.auth.user);
  const [selectedDate, setSelectedDate] = useState("");
  const [startHour, setStartHour] = useState("01");
  const [startMinute, setStartMinute] = useState("00");
  const [startAmPm, setStartAmPm] = useState("PM");
  const [endHour, setEndHour] = useState("02");
  const [endMinute, setEndMinute] = useState("00");
  const [endAmPm, setEndAmPm] = useState("PM");
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Request notification permission on page load
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedDate) {
      setError("Please select a date.");
      return;
    }

    const startTime = `${startHour}:${startMinute} ${startAmPm}`;
    const endTime = `${endHour}:${endMinute} ${endAmPm}`;

    const bookingData = {
      CourtId: court.id,
      CourtName: court.name,
      UserEmail: user.email,
      UserName: user.username,
      Date: selectedDate,
      StartTime: startTime,
      EndTime: endTime,
    };

    try {
      const response = await courtService.createBooking(bookingData);
      if (response && response.success) {
        setShowSuccess(true);

        // Show browser notification
        if (Notification.permission === "granted") {
          new Notification("Redirecting to payment page...");
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("Redirecting to payment page...");
            }
          });
        }

        // Redirect after short delay
        setTimeout(() => navigate("/mybookings"), 2000);
      } else if (response && response.error) {
        setError(response.error);
      } else {
        setError("Booking failed. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="confirm-booking-container">
      <h2>Confirm Booking</h2>
      {court && (
        <div className="court-details">
          <p><strong>Court:</strong> {court.name}</p>
          <p><strong>Sport:</strong> {court.sport}</p>
          <p><strong>Location:</strong> {court.location}</p>
        </div>
      )}

      <form onSubmit={handleBookingSubmit} className="booking-form">
        <label>Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
        />

        <div className="time-selectors">
          <div>
            <label>Start Time:</label>
            <select value={startHour} onChange={(e) => setStartHour(e.target.value)}>{HOURS.map(h => <option key={h}>{h}</option>)}</select>
            <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>{MINUTES.map(m => <option key={m}>{m}</option>)}</select>
            <select value={startAmPm} onChange={(e) => setStartAmPm(e.target.value)}>{AMPM.map(p => <option key={p}>{p}</option>)}</select>
          </div>

          <div>
            <label>End Time:</label>
            <select value={endHour} onChange={(e) => setEndHour(e.target.value)}>{HOURS.map(h => <option key={h}>{h}</option>)}</select>
            <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)}>{MINUTES.map(m => <option key={m}>{m}</option>)}</select>
            <select value={endAmPm} onChange={(e) => setEndAmPm(e.target.value)}>{AMPM.map(p => <option key={p}>{p}</option>)}</select>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}
        {showSuccess && <p className="success-message">Booking successful!</p>}

        <button type="submit" className="submit-button">Proceed to Payment</button>
      </form>
    </div>
  );
};

export default ConfirmBooking;
