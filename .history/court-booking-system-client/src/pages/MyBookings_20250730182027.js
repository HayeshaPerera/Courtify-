import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate(); // ✅ For redirection

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await courtService.getUserBookings(userEmail);
        if (response && Array.isArray(response)) {
          setBookings(response);
        } else {
          setError("No bookings found or failed to fetch.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching bookings.");
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

  return (
    <div className="home">
      <div className="mybookings-container">
        <h1 className="mybookings-title">MY BOOKINGS</h1>
        <p className="mybookings-caption">
          Easily view all your reserved courts below. Click cancel to go to cancellation page.
        </p>

        {successMessage && (
          <div className="alert alert-success text-center mb-3">
            {successMessage}
          </div>
        )}

        {loading && <p>Loading bookings...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && bookings.length === 0 && <p>No bookings found.</p>}

        {!loading && bookings.length > 0 && (
          <ul className="mybookings-list">
            {bookings.map((booking) => (
              <li key={booking.Id} className="mybookings-item">
                <h5>{booking.CourtName || `Court ID: ${booking.CourtId}`}</h5>
                <p>Date: {booking.Date}</p>
                <p>Time: {booking.StartTime} - {booking.EndTime}</p>
                <p>Status: {booking.Status}</p>
                <p>Type: {booking.BookingType}</p>

                {/* ✅ Cancel button redirects to CancelBooking page */}
                <button
                  className="cancel-btn"
                  onClick={() => navigate("/cancelbooking", { state: { booking } })}
                >
                  Cancel Booking
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyBookings;
