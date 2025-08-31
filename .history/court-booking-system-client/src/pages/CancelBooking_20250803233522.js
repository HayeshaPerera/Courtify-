import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/CancelBooking.css";

const CancelBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;
  const bookingId = booking?.Id;
  
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [cancellationStage, setCancellationStage] = useState("initial"); // initial, processing, cancelled

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

    setLoading(true);
    setCancellationStage("processing");
    setError("");
    setMessage("");

    try {
      const response = await courtService.cancelBooking({ bookingId, reason });
      
      if (response?.success) {
        setCancelled(true);
        setCancellationStage("cancelled");
        setMessage("✅ Your booking has been cancelled successfully.");
        
        // Update booking status in memory if needed
        if (booking) booking.status = "cancelled";
        
        setTimeout(() => {
          setLoading(false);
          // Don't navigate immediately, let user see the success state
        }, 1000);
        
      } else {
        setError(response?.message || "❌ Could not cancel booking. Please try again.");
        setLoading(false);
        setCancellationStage("initial");
      }
    } catch (err) {
      setError(err.message || "❌ Error while cancelling booking.");
      setLoading(false);
      setCancellationStage("initial");
    }
  };

  const handleGoToBookings = () => {
    navigate("/mybookings");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const getButtonContent = () => {
    switch (cancellationStage) {
      case "processing":
        return (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Cancelling Booking...
          </>
        );
      case "cancelled":
        return (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Booking Cancelled
          </>
        );
      default:
        return "Confirm Cancellation";
    }
  };

  const getButtonClass = () => {
    switch (cancellationStage) {
      case "processing":
        return "btn btn-warning w-100 mt-3";
      case "cancelled":
        return "btn btn-success w-100 mt-3";
      default:
        return "btn btn-danger w-100 mt-3";
    }
  };

  return (
    <div className="cancel-booking-container">
      <div className="cancel-header">
        <h2>Cancel Booking</h2>
        {booking && (
          <div className="booking-details">
            <p><strong>Court:</strong> {booking.CourtName}</p>
            <p><strong>Date:</strong> {booking.Date}</p>
            <p><strong>Time:</strong> {booking.StartTime} - {booking.EndTime}</p>
          </div>
        )}
      </div>

      {!cancelled ? (
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
              disabled={loading}
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
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="confirm"
                  value="yes"
                  checked={confirm === "yes"}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={loading}
                />
                <span className="radio-custom"></span>
                Yes
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="confirm"
                  value="no"
                  checked={confirm === "no"}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={loading}
                />
                <span className="radio-custom"></span>
                No
              </label>
            </div>
          </div>

          <div className="warning-notice">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>
              Cancellations must be made at least 24 hours before the booking start time to be eligible for a refund.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger mt-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={getButtonClass()}
            disabled={loading || cancellationStage === "cancelled"}
          >
            {getButtonContent()}
          </button>

          <button
            type="button"
            className="btn btn-secondary w-100 mt-2"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Go Back
          </button>
        </form>
      ) : (
        <div className="cancellation-success">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h3>Booking Cancelled Successfully!</h3>
          
          <div className="cancellation-details">
            <p><strong>Cancellation Reason:</strong> {reason}</p>
            <p><strong>Status:</strong> <span className="status-cancelled">Cancelled</span></p>
          </div>

          {message && (
            <div className="alert alert-success mt-3">
              {message}
            </div>
          )}

          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={handleGoToBookings}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              View My Bookings
            </button>
            
            <button
              className="btn btn-outline-primary"
              onClick={handleGoHome}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Go to Homepage
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelBooking;