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

  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState("08");
  const [startMinute, setStartMinute] = useState("00");
  const [startAMPM, setStartAMPM] = useState("AM");
  const [endHour, setEndHour] = useState("09");
  const [endMinute, setEndMinute] = useState("00");
  const [endAMPM, setEndAMPM] = useState("AM");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const startTime = `${startHour}:${startMinute} ${startAMPM}`;
    const endTime = `${endHour}:${endMinute} ${endAMPM}`;

    const booking = {
      CourtId: court.CourtId,
      CourtName: court.CourtName,
      UserEmail: user?.email,
      UserName: user?.name,
      Date: date,
      StartTime: startTime,
      EndTime: endTime,
    };

    try {
      const response = await courtService.createBooking(booking);

      if (response && response.success) {
        setShowSuccess(true);

        // Send browser notification
        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("Redirecting to payment page...");
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification("Redirecting to payment page...");
              }
            });
          }
        }

        // Navigate after 2 seconds
        setTimeout(() => navigate("/mybookings"), 2000);
      } else {
        throw new Error(response.message || "Booking failed.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong.");
      setShowError(true);
    }
  };

  if (!court) {
    return <p>No court selected.</p>;
  }

  return (
    <div className="confirm-booking-container">
      <h2>Confirm Booking</h2>
      <p><strong>Court:</strong> {court.CourtName}</p>
      <form onSubmit={handleBookingSubmit}>
        <label>
          Date:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <div className="time-selectors">
          <div>
            <label>Start Time:</label>
            <select value={startHour} onChange={(e) => setStartHour(e.target.value)}>{HOURS.map((h) => <option key={h}>{h}</option>)}</select> :
            <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>{MINUTES.map((m) => <option key={m}>{m}</option>)}</select>
            <select value={startAMPM} onChange={(e) => setStartAMPM(e.target.value)}>{AMPM.map((a) => <option key={a}>{a}</option>)}</select>
          </div>
          <div>
            <label>End Time:</label>
            <select value={endHour} onChange={(e) => setEndHour(e.target.value)}>{HOURS.map((h) => <option key={h}>{h}</option>)}</select> :
            <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)}>{MINUTES.map((m) => <option key={m}>{m}</option>)}</select>
            <select value={endAMPM} onChange={(e) => setEndAMPM(e.target.value)}>{AMPM.map((a) => <option key={a}>{a}</option>)}</select>
          </div>
        </div>
        <button type="submit">Proceed to Payment</button>
      </form>

      {showSuccess && <p className="success-message">Booking successful! Redirecting...</p>}
      {showError && <p className="error-message">Error: {errorMessage}</p>}
    </div>
  );
};

export default ConfirmBooking;
