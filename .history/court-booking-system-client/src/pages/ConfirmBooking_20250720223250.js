import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import courtService from "../services/domain-services/CourtService";
import "../styles/ConfirmBooking.css";

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};

  const user = useSelector((state) => state.auth.user);

  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    startHour: "9",
    startMinute: "00",
    startPeriod: "AM",
    endHour: "10",
    endMinute: "00",
    endPeriod: "AM",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const convertTo24Hour = (hour, minute, period) => {
    let h = parseInt(hour);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const { date, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod } = bookingDetails;

    const startTime = convertTo24Hour(startHour, startMinute, startPeriod);
    const endTime = convertTo24Hour(endHour, endMinute, endPeriod);

    // Ensure all required data is present
    if (!user?.email || !court?.id || !date || !startTime || !endTime) {
      setErrorMessage("Please fill in all fields correctly.");
      return;
    }

    try {
      await courtService.createBooking({
        userEmail: user.email,
        courtId: court.id,
        date,
        startTime,
        endTime,
      });

      setSuccessMessage("Booking confirmed!");
      setErrorMessage("");

      setTimeout(() => {
        navigate("/user/bookings");
      }, 2000);
    } catch (error) {
      console.error("Booking error:", error);
      setErrorMessage("Booking failed. Please try again.");
    }
  };

  return (
    <div className="container confirm-booking">
      <h2 className="mb-4">Confirm Booking</h2>
      {court && (
        <div className="mb-4">
          <h4>{court.name}</h4>
          <p>{court.location}</p>
        </div>
      )}

      <form onSubmit={handleBookingSubmit}>
        {/* Date Picker */}
        <div className="mb-3">
          <label className="form-label">Select Date</label>
          <input
            type="date"
            name="date"
            className="form-control"
            value={bookingDetails.date}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Time Picker Section */}
        <div className="mb-3">
          <label className="form-label">Booking Time</label>
          <div className="row g-2">
            {/* Start Time */}
            <div className="col-md-6">
              <label className="form-label">Start</label>
              <div className="d-flex gap-2">
                <select name="startHour" value={bookingDetails.startHour} onChange={handleInputChange} className="form-select">
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                <select name="startMinute" value={bookingDetails.startMinute} onChange={handleInputChange} className="form-select">
                  {["00", "15", "30", "45"].map((min) => (
                    <option key={min} value={min}>{min}</option>
                  ))}
                </select>
                <select name="startPeriod" value={bookingDetails.startPeriod} onChange={handleInputChange} className="form-select">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* End Time */}
            <div className="col-md-6">
              <label className="form-label">End</label>
              <div className="d-flex gap-2">
                <select name="endHour" value={bookingDetails.endHour} onChange={handleInputChange} className="form-select">
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                <select name="endMinute" value={bookingDetails.endMinute} onChange={handleInputChange} className="form-select">
                  {["00", "15", "30", "45"].map((min) => (
                    <option key={min} value={min}>{min}</option>
                  ))}
                </select>
                <select name="endPeriod" value={bookingDetails.endPeriod} onChange={handleInputChange} className="form-select">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>
          <small className="text-muted mt-1 d-block">* End time must be later than start time</small>
        </div>

        {/* Feedback Messages */}
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <button type="submit" className="btn btn-success mt-3">Confirm Booking</button>
      </form>
    </div>
  );
};

export default ConfirmBooking;
