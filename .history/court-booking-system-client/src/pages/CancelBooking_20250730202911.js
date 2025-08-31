import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/CancelBooking.css";

const CancelBooking = () => {
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const reasons = [
    "Change of plans",
    "Found a better option",
    "Incorrect booking",
    "Double booking",
    "Other",
  ];

  const handleCancel = async (e) => {
    e.preventDefault();

    if (!bookingId || !email || !reason) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await courtService.cancelBooking({ bookingId, email, reason });
      if (response && response.success) {
        setMessage(
          "Your booking has been cancelled. If the cancellation is made at least 24 hours before the start time, a refund will be issued."
        );
        setError("");
      } else {
        setError("Could not cancel booking. Please check your details or try again later.");
      }
    } catch (err) {
      setError(err.message || "Error while cancelling booking.");
    }
  };

  return (
    <div className="cancel-booking-container">
      <h2>Cancel Booking</h2>
      <form onSubmit={handleCancel}>
        <div className="cancel-form-item">
          <label htmlFor="bookingId" className="form-label">Booking ID</label>
          <input
            type="text"
            id="bookingId"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="cancel-form-item">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="cancel-form-item">
          <label htmlFor="reason" className="form-label">Reason for Cancellation</label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Select a reason</option>
            {reasons.map((r, idx) => (
              <option key={idx} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <p className="text-warning mt-2">
          ⚠️ Cancellations must be made at least 24 hours before the booking start time to be eligible for a refund.
        </p>

        {error && <div className="alert alert-danger mt-2">{error}</div>}
        {message && <div className="alert alert-success mt-2">{message}</div>}

        <button type="submit" className="btn btn-danger w-100 mt-3">
          Confirm
        </button>
        <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => navigate("/")}>Go Back</button>
      </form>
    </div>
  );
};

export default CancelBooking;