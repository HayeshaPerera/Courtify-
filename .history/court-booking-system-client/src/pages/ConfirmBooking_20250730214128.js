import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import XrplService from "../services/common-services/XrplService.ts";
import { useSelector } from "react-redux";
import "../styles/ConfirmBooking.css";

const HOURS = [...Array(12)].map((_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};
  const user = useSelector((state) => state.user.user);

  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState({ hour: "", minute: "", period: "AM" });
  const [endTime, setEndTime] = useState({ hour: "", minute: "", period: "AM" });
  const [bookingError, setBookingError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = ({ hour, minute, period }) => {
    return `${hour}:${minute} ${period}`;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !startTime.hour || !startTime.minute || !endTime.hour || !endTime.minute) {
      setBookingError("Please fill in all required fields.");
      return;
    }

    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    const bookingDetails = {
      CourtId: court.CourtId,
      CourtName: court.CourtName,
      UserEmail: user.email,
      UserName: user.name,
      Date: selectedDate,
      StartTime: formattedStartTime,
      EndTime: formattedEndTime,
    };

    try {
      const response = await courtService.createBooking(bookingDetails);

      if (response && response.success) {
        setShowSuccess(true);

        // Show browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Booking Confirmed", {
            body: "Redirecting to payment page...",
          });
        }

        setTimeout(() => {
          navigate("/mybookings");
        }, 2000);
      } else {
        setBookingError(response.error || "Booking failed.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError("An error occurred during booking.");
    }
  };

  return (
    <div className="confirm-booking-container">
      <h2>Confirm Booking</h2>
      {court ? (
        <form onSubmit={handleBookingSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="courtName">Court Name:</label>
            <input type="text" id="courtName" value={court.CourtName} readOnly />
          </div>

          <div className="form-group">
            <label htmlFor="selectedDate">Select Date:</label>
            <input type="date" id="selectedDate" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Start Time:</label>
            <div className="time-inputs">
              <select value={startTime.hour} onChange={(e) => setStartTime({ ...startTime, hour: e.target.value })}>
                <option value="">Hour</option>
                {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <select value={startTime.minute} onChange={(e) => setStartTime({ ...startTime, minute: e.target.value })}>
                <option value="">Min</option>
                {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={startTime.period} onChange={(e) => setStartTime({ ...startTime, period: e.target.value })}>
                {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>End Time:</label>
            <div className="time-inputs">
              <select value={endTime.hour} onChange={(e) => setEndTime({ ...endTime, hour: e.target.value })}>
                <option value="">Hour</option>
                {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <select value={endTime.minute} onChange={(e) => setEndTime({ ...endTime, minute: e.target.value })}>
                <option value="">Min</option>
                {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={endTime.period} onChange={(e) => setEndTime({ ...endTime, period: e.target.value })}>
                {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {bookingError && <p className="error-message">{bookingError}</p>}
          {showSuccess && <p className="success-message">Booking successful! Redirecting...</p>}

          <button type="submit">Proceed to Payment</button>
        </form>
      ) : (
        <p>No court details found.</p>
      )}
    </div>
  );
};

export default ConfirmBooking;
