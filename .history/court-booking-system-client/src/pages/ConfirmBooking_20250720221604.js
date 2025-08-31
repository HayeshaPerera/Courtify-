import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/ConfirmBooking.css";

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};

  const [bookingDetails, setBookingDetails] = useState({
    courtId: court?.id || "",
    sport: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false); // ✅ success alert state

  const handleInputChange = (e) => {
    setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Optional: Client-side time validation
    if (bookingDetails.endTime <= bookingDetails.startTime) {
      setErrorMessage("End time must be later than start time.");
      return;
    }

    try {
      const response = await courtService.createBooking(bookingDetails);
      if (response && response.success) {
        setShowSuccess(true); // ✅ show success popup
        setTimeout(() => {
          navigate("/"); // ✅ redirect to homepage
        }, 2000);
      } else {
        setErrorMessage("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setErrorMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Confirm Your Booking</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="sport" className="form-label">Sport</label>
          <input
            type="text"
            id="sport"
            name="sport"
            value={bookingDetails.sport}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="date" className="form-label">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={bookingDetails.date}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Booking Time</label>
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <label htmlFor="startTime" className="form-label">Start Time</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={bookingDetails.startTime}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="endTime" className="form-label">End Time</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={bookingDetails.endTime}
                onChange={handleInputChange}
                className="form-control"
                required
                min={bookingDetails.startTime || "00:00"}
              />
            </div>
          </div>
          <small className="text-muted mt-2 d-block">
            Please ensure the end time is later than the start time.
          </small>
        </div>

        {errorMessage && (
          <div className="alert alert-danger mt-3">{errorMessage}</div>
        )}

        <button type="submit" className="btn btn-primary mt-3">
          Confirm Booking
        </button>
      </form>

      {/* ✅ Success popup message */}
      {showSuccess && (
        <div
          className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow"
          style={{ zIndex: 1050, width: "fit-content" }}
        >
          ✅ Booking Confirmed! Redirecting...
        </div>
      )}
    </div>
  );
};

export default ConfirmBooking;
