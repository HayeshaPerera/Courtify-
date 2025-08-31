import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/CancelBooking.css";

const CancelBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Get CourtId from route state
  const { courtId } = location.state || {};

  const handleCancelBooking = async () => {
    if (!courtId) {
      setError("Missing Court ID. Cannot cancel this booking.");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for cancellation.");
      return;
    }

    try {
      const response = await courtService.cancelBooking({ CourtId: courtId, reason });

      if (response.success) {
        setSuccessMessage("Booking cancelled successfully.");
        setTimeout(() => navigate("/user/bookings"), 2000); // redirect after 2s
      } else {
        setError(response.message || "Failed to cancel booking.");
      }
    } catch (err) {
      setError("An error occurred while cancelling the booking.");
      console.error(err);
    }
  };

  return (
    <div className="cancel-booking-container">
      <h2>Cancel Booking</h2>

      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <textarea
        placeholder="Reason for cancellation"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
      />

      <button onClick={handleCancelBooking}>Cancel Booking</button>
    </div>
  );
};

export default CancelBooking;
