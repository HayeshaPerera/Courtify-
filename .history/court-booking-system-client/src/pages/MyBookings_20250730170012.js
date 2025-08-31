import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import courtService from "../services/domain-services/CourtService";
import Footer from "../components/Footer";
import "../styles/MyBookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation();
  const successMessage = location.state?.successMessage;
  const userEmail = useSelector((state) => state.user.userDetails?.Email);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await courtService.getUserBookings(userEmail);
        if (Array.isArray(response)) {
          setBookings(response);
        } else {
          setError("No bookings found or failed to fetch.");
        }
      } catch (err) {
        setError(err.message || "Error fetching bookings.");
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchBookings();
    } else {
      setLoading(false);
      setError("User email not found.");
    }
  }, [userEmail]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await courtService.cancelBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.Id !== bookingId));
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  return (
    <>
      <div className="mybookings-container">
        <h1 className="mybookings-title">My Bookings</h1>
        <p className="mybookings-caption">
          View your reserved courts below. Cancel any upcoming booking easily.
        </p>

        {successMessage && (
          <div className="alert alert-success text-center mb-3">
            {successMessage}
          </div>
        )}

        {loading && <p className="text-info">Loading bookings...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && bookings.length === 0 && !error && (
          <p className="text-warning">No bookings found.</p>
        )}

        {!loading && bookings.length > 0 && (
          <ul className="mybookings-list">
            {bookings.map((booking) => (
              <li key={booking.Id} className="mybookings-item">
                <div className="booking-info">
                  <h5>{booking.CourtName || `Court ID: ${booking.CourtId}`}</h5>
                  <p><strong>Date:</strong> {booking.Date}</p>
                  <p><strong>Time:</strong> {booking.StartTime} - {booking.EndTime}</p>
                  <p><strong>Status:</strong> {booking.Status}</p>
                  <p><strong>Type:</strong> {booking.BookingType}</p>
                </div>
                <button
                  className="cancel-btn"
                  onClick={() => handleCancelBooking(booking.Id)}
                  disabled={booking.Status === "Cancelled"}
                >
                  {booking.Status === "Cancelled" ? "Cancelled" : "Cancel Booking"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MyBookings;
