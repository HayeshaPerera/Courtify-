import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/ConfirmBooking.css";

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};

  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({ ...bookingDetails, [name]: value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      CourtId: court.Id,
      CourtName: court.Name,
      UserEmail: bookingDetails.email,
      UserName: bookingDetails.name, // Adding name to payload
      Date: bookingDetails.date,
      StartTime: bookingDetails.startTime,
      EndTime: bookingDetails.endTime,
    };
    console.log("Payload being sent:", payload);

    try {
      // Use courtService's createBooking method instead of directly using hotPocketService
      const response = await courtService.createBooking(payload);

      if (response && response.success) {
        alert(`Court "${court.Name}" booked successfully!`);
        navigate("/");
      } else {
        alert(`Booking failed: ${response.error || "Please try again."}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(`An error occurred during booking: ${error.message}`);
    }

    setBookingDetails({ name: "", email: "", date: "", startTime: "", endTime: "" });
  };

  return (
    <div className="confirm-booking-container">
      <h2>Book Court: {court ? court.Name : "Unknown Court"}</h2>
      <form onSubmit={handleBookingSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={bookingDetails.name}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Your Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={bookingDetails.email}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="date" className="form-label">Booking Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={bookingDetails.date}
            onChange={handleInputChange}
            className="form-control"
            required
            min={new Date().toISOString().split("T")[0]} // ✅ This blocks dates before today
          />
        </div>
<div className="mb-3">
  <label className="form-label">Booking Time</label>
  <div className="row g-3 align-items-end">
    {/* Start Time */}
    <div className="col-md-6">
      <label className="form-label">Start Time</label>
      <div className="d-flex gap-2">
        <select
          name="startHour"
          className="form-select"
          value={bookingDetails.startHour}
          onChange={handleInputChange}
          required
        >
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}</option>
          ))}
        </select>

        <select
          name="startMinute"
          className="form-select"
          value={bookingDetails.startMinute}
          onChange={handleInputChange}
          required
        >
          <option value="00">00</option>
          <option value="15">15</option>
          <option value="30">30</option>
          <option value="45">45</option>
        </select>

        <select
          name="startPeriod"
          className="form-select"
          value={bookingDetails.startPeriod}
          onChange={handleInputChange}
          required
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>

    {/* End Time */}
    <div className="col-md-6">
      <label className="form-label">End Time</label>
      <div className="d-flex gap-2">
        <select
          name="endHour"
          className="form-select"
          value={bookingDetails.endHour}
          onChange={handleInputChange}
          required
        >
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}</option>
          ))}
        </select>

        <select
          name="endMinute"
          className="form-select"
          value={bookingDetails.endMinute}
          onChange={handleInputChange}
          required
        >
          <option value="00">00</option>
          <option value="15">15</option>
          <option value="30">30</option>
          <option value="45">45</option>
        </select>

        <select
          name="endPeriod"
          className="form-select"
          value={bookingDetails.endPeriod}
          onChange={handleInputChange}
          required
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  </div>

  <small className="text-muted mt-2 d-block">
    Please ensure the end time is later than the start time.
  </small>
</div>

        <button type="submit" className="btn btn-success">Confirm Booking</button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate("/")}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ConfirmBooking;