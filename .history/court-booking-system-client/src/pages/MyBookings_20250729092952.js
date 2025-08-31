import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import courtService from "../services/domain-services/CourtService";
import Footer from "../components/Footer";
import "../styles/MyBookings.css";

// MyBookings component
const MyBookings = () => {
  // State for bookings, loading, and error
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get navigation state and user email from Redux
  const location = useLocation();
  const successMessage = location.state?.successMessage;
  const userEmail = useSelector((state) => state.user.userDetails?.Email);

  // Fetch user bookings on mount or when userEmail changes
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log("userEmail", userEmail);
        const response = await courtService.getUserBookings(userEmail);
        console.log("response", response);

        if (response && Array.isArray(response)) {
          setBookings(response); // Set bookings if fetch is successful
        } else {
          setError("No bookings found or failed to fetch."); // Set error if fetch fails
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching bookings."); // Handle fetch error
      } finally {
        setLoading(false); // Always stop loading
      }
    };

    if (userEmail) {
      fetchBookings();
    } else {
      setLoading(false);
      setError("User email not found.");
    }
  }, [userEmail]);

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    try {
      await courtService.cancelBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.Id !== bookingId)); // Remove cancelled booking from list
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  // Render bookings list and messages
  return (
    <>
      <div className="mybookings-container">
        <h1 className="mybookings-title">MY BOOKING</h1>
        {/* Show success message if present */}
        {successMessage && (
          <div className="alert alert-success text-center mb-3">
            {successMessage}
          </div>
        )}
        {/* Loading, error, and empty state messages */}
        {loading && <p>Loading bookings...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && bookings.length === 0 && <p>No bookings found.</p>}
        {/* Bookings list */}
        {!loading && bookings.length > 0 && (
          <ul className="mybookings-list">
            {bookings.map((booking) => (
              <li key={booking.Id} className="mybookings-item">
                <h5>{booking.CourtName || `Court ID: ${booking.CourtId}`}</h5>
                <p>Date: {booking.Date}</p>
                <p>Time: {booking.StartTime} - {booking.EndTime}</p>
                <p>Status: {booking.Status}</p>
                <p>Type: {booking.BookingType}</p>
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
      {/* Footer component */}
      <Footer />
    </>
  );
};

export default MyBookings;
