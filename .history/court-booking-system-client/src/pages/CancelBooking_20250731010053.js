import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/CancelBooking.css";

const CancelBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingId = location?.state?.bookingId;

  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
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

    if (!reason || confirm !== "yes") {
      setError("Please select a reason and confirm the cancellation.");
      return;
    }

    if (!bookingId) {
      setError("Booking ID not found. Cannot proceed with cancellation.");
      return;
    }

    try {
      const response = await courtService.cancelBooking({
        bookingId,
        reason,
      });

      if (response && response.success) {
        setMessage(
          "Your booking has been cancelled. If the cancellation is made at least 24 hours before the start time, a refund will be issued."
        );
        setError("");
      } else {
        setError(response.message || "Could not cancel booking. Please try again later.");
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
          <label htmlFor="reason" className="form-label">
            Reason for Cancellation
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Select a reason</option>
            {reasons.map((r, idx) => (
              <option key={idx} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="cancel-form-item mt-3">
          <label className="form-label">
            Are you sure you want to cancel this booking?
          </label>
          <div>
            <label className="me-3">
              <input
                type="radio"
                name="confirm"
                value="yes"
                checked={confirm === "yes"}
                onChange={(e) => setConfirm(e.target.value)}
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="confirm"
                value="no"
                checked={confirm === "no"}
                onChange={(e) => setConfirm(e.target.value)}
              />{" "}
              No
            </label>
          </div>
        </div>

        <p className="text-warning mt-2">
          ⚠️ Cancellations must be made at least 24 hours before the booking start time to be eligible for a refund.
        </p>

        {error && <div className="alert alert-danger mt-2">{error}</div>}
        {message && <div className="alert alert-success mt-2">{message}</div>}

        <button type="submit" className="btn btn-danger w-100 mt-3">
          Confirm Cancellation
        </button>
        <button
          type="button"
          className="btn btn-secondary w-100 mt-2"
          onClick={() => navigate("/")}
        >
          Go Back
        </button>
      </form>
    </div>
  );
};

export default CancelBooking;
