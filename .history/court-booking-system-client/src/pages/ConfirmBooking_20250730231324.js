import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/ConfirmBooking.css";

const HOURS = [...Array(12)].map((_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const AM_PM = ["AM", "PM"];

const ConfirmBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { court } = location.state || {};
  const [sport, setSport] = useState("");
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState("07");
  const [startMinute, setStartMinute] = useState("00");
  const [startAMPM, setStartAMPM] = useState("AM");
  const [endHour, setEndHour] = useState("08");
  const [endMinute, setEndMinute] = useState("00");
  const [endAMPM, setEndAMPM] = useState("AM");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formatTime = (hour, minute, ampm) => {
    return `${hour}:${minute} ${ampm}`;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!sport || !date) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const bookingData = {
      CourtId: court?.CourtId,
      CourtName: court?.CourtName,
      UserEmail: "thameeshisenade@gmail.com",
      UserName: "Thameeshi Senadheera",
      Date: date,
      StartTime: formatTime(startHour, startMinute, startAMPM),
      EndTime: formatTime(endHour, endMinute, endAMPM),
    };

    try {
      const response = await courtService.createBooking(bookingData);

      console.log("Booking response:", response);

      if (response.success) {
        setSuccessMessage("Booking successful!");
        setTimeout(() => {
          navigate("/UserBookings");
        }, 2000);
      } else if (response.error) {
        setErrorMessage(response.error); // show booking conflict or other errors
      } else {
        setErrorMessage("Unexpected server response.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setErrorMessage("Server error occurred while booking.");
    }
  };

  return (
    <div className="confirm-booking-container">
      <h2>Confirm Your Booking</h2>
      <form onSubmit={handleBookingSubmit}>
        <div>
          <label>Court Name:</label>
          <input type="text" value={court?.CourtName || "Unknown"} readOnly />
        </div>
        <div>
          <label>Sport:</label>
          <input type="text" value={sport} onChange={(e) => setSport(e.target.value)} />
        </div>
        <div>
          <label>Date:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label>Start Time:</label>
          <select value={startHour} onChange={(e) => setStartHour(e.target.value)}>
            {HOURS.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          :
          <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>
            {MINUTES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select value={startAMPM} onChange={(e) => setStartAMPM(e.target.value)}>
            {AM_PM.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label>End Time:</label>
          <select value={endHour} onChange={(e) => setEndHour(e.target.value)}>
            {HOURS.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          :
          <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)}>
            {MINUTES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select value={endAMPM} onChange={(e) => setEndAMPM(e.target.value)}>
            {AM_PM.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button type="submit">Confirm Booking</button>

        {errorMessage && (
          <div className="alert alert-danger mt-3">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="alert alert-success mt-3">{successMessage}</div>
        )}
      </form>
    </div>
  );
};

export default ConfirmBooking;
