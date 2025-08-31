import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import { useSelector } from "react-redux";
import "../styles/ConfirmBooking.css";

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};

  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    date: "",
    startHour: "",
    startMinute: "",
    startPeriod: "",
    endHour: "",
    endMinute: "",
    endPeriod: "",
  });

  const { provider } = useSelector((state) => state.auth);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({ ...bookingDetails, [name]: value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const startTime = `${bookingDetails.startHour}:${bookingDetails.startMinute} ${bookingDetails.startPeriod}`;
    const endTime = `${bookingDetails.endHour}:${bookingDetails.endMinute} ${bookingDetails.endPeriod}`;

    const payload = {
      CourtId: court.Id,
      CourtName: court.Name,
      UserEmail: bookingDetails.email,
      UserName: bookingDetails.name,
      Date: bookingDetails.date,
      StartTime: startTime,
      EndTime: endTime,
    };
    console.log("Payload being sent:", payload);

    try {
      const response = await courtService.createBooking(payload);

      if (response && response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        alert(`Booking failed: ${response.error || "Please try again."}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(`An error occurred during booking: ${error.message}`);
    }

    setBookingDetails({
      name: "",
      email: "",
      date: "",
      startHour: "",
      startMinute: "",
      startPeriod: "",
      endHour: "",
      endMinute: "",
      endPeriod: "",
    });
  };

  return (
    <div className="confirm-booking-container">
      {showSuccess && (
        <div
          className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow"
          style={{ zIndex: 1050, width: "fit-content" }}
        >
          ✅ Court "{court?.Name}" booked successfully! Redirecting...
        </div>
      )}

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
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Booking Time</label>
          <div className="row g-3">
            {["Start", "End"].map((label) => (
              <div className="col-md-6" key={label}>
                <label className="form-label">{label} Time</label>
                <div className="d-flex gap-2">
                  <select
                    name={`${label.toLowerCase()}Hour`}
                    className="form-select"
                    value={bookingDetails[`${label.toLowerCase()}Hour`]}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">HH</option>
                    {[...Array(12)].map((_, i) => {
                      const hour = i + 1;
                      return (
                        <option key={hour} value={hour}>
                          {hour.toString().padStart(2, "0")}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    name={`${label.toLowerCase()}Minute`}
                    className="form-select"
                    value={bookingDetails[`${label.toLowerCase()}Minute`]}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">MM</option>
                    {["00", "15", "30", "45"].map((min) => (
                      <option key={min} value={min}>{min}</option>
                    ))}
                  </select>

                  <select
                    name={`${label.toLowerCase()}Period`}
                    className="form-select"
                    value={bookingDetails[`${label.toLowerCase()}Period`]}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">AM/PM</option>
                    {["AM", "PM"].map((period) => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <small className="text-muted mt-2 d-block">
            Make sure the end time is later than the start time.
          </small>
        </div>

        <button type="submit" className="btn btn-success w-100 mt-3">
          Confirm Booking
        </button>
        <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => navigate("/")}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ConfirmBooking;
