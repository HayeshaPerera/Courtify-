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
  const [cancellingBooking, setCancellingBooking] = useState(null);
  
  const location = useLocation();
  const successMessage = location.state?.successMessage;
  const userEmail = useSelector((state) => state.user.userDetails?.Email);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await courtService.getUserBookings(userEmail);
      if (response && Array.isArray(response)) {
        // Sort bookings to show pending/active first, then cancelled
        const sortedBookings = response.sort((a, b) => {
          const statusOrder = {
            'pending': 1,
            'confirmed': 2,
            'active': 3,
            'completed': 4,
            'cancelled': 5,
            'canceled': 5
          };
          
          const aStatus = (a.Status || 'pending').toLowerCase();
          const bStatus = (b.Status || 'pending').toLowerCase();
          
          return (statusOrder[aStatus] || 6) - (statusOrder[bStatus] || 6);
        });
        
        setBookings(sortedBookings);
      } else {
        setError("No bookings found or failed to fetch.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchBookings();
    } else {
      setLoading(false);
      setError("User email not found.");
    }
  }, [userEmail]);

  // Auto-refresh bookings every 30 seconds to catch status updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (userEmail && !loading) {
        fetchBookings();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userEmail, loading]);

  const handleCancelBooking = async (booking) => {
    if (!window.confirm(`Are you sure you want to cancel the booking for ${booking.CourtName} on ${booking.Date} from ${booking.StartTime} to ${booking.EndTime}?`)) {
      return;
    }

    setCancellingBooking(booking.Id);
    
    try {
      const response = await courtService.cancelBooking(booking.Id);
      
      if (response && (response.success || response.message === "Booking cancelled successfully")) {
        // Refresh bookings to show updated status
        await fetchBookings();
        
        // Show success message
        setError("");
        // You could also show a success notification here
      } else {
        setError(response?.error || "Failed to cancel booking. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to cancel booking. Please try again.");
    } finally {
      setCancellingBooking(null);
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
        return <span className="badge badge-warning">⏳ Pending</span>;
      case 'confirmed':
        return <span className="badge badge-success">✅ Confirmed</span>;
      case 'active':
        return <span className="badge badge-primary">🎾 Active</span>;
      case 'completed':
        return <span className="badge badge-secondary">✅ Completed</span>;
      case 'cancelled':
      case 'canceled':
        return <span className="badge badge-danger">❌ Cancelled</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const canCancelBooking = (booking) => {
    const status = (booking.Status || 'pending').toLowerCase();
    return status !== 'cancelled' && status !== 'canceled' && status !== 'completed';
  };

  const getBookingMessage = (booking) => {
    const status = (booking.Status || 'pending').toLowerCase();
    
    if (status === 'pending') {
      return (
        <small className="booking-message text-info">
          🔄 This booking is being processed. You will receive confirmation shortly.
        </small>
      );
    }
    
    return null;
  };

  return (
    <div className="home">
      <div className="mybookings-container">
        <h1 className="mybookings-title">MY BOOKINGS</h1>
        <p className="mybookings-caption">
          Easily view all your reserved courts below. New bookings start as "Pending" and will be confirmed shortly.
        </p>

        {successMessage && (
          <div className="alert alert-success text-center mb-3">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center mb-3">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading bookings...</span>
            </div>
            <p>Loading bookings...</p>
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="no-bookings">
            <p>No bookings found.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate("/")}
            >
              Book a Court
            </button>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="bookings-grid">
            {bookings.map((booking) => {
              const status = (booking.Status || 'pending').toLowerCase();
              const isCancelled = status === 'cancelled' || status === 'canceled';
              
              return (
                <div key={booking.Id} className={`mybookings-item ${isCancelled ? 'cancelled-booking' : ''}`}>
                  <div className="booking-header">
                    <h5>{booking.CourtName || `Court ID: ${booking.CourtId}`}</h5>
                    {getStatusBadge(booking.Status)}
                  </div>
                  
                  <div className="booking-details">
                    <p><strong>📅 Date:</strong> {booking.Date}</p>
                    <p><strong>🕐 Time:</strong> {booking.StartTime} - {booking.EndTime}</p>
                    <p><strong>📋 Type:</strong> {booking.BookingType || 'Standard'}</p>
                    
                    {booking.UserName && (
                      <p><strong>👤 Name:</strong> {booking.UserName}</p>
                    )}
                  </div>

                  {getBookingMessage(booking)}

                  <div className="booking-actions">
                    {canCancelBooking(booking) && (
                      <button
                        className={`cancel-btn ${cancellingBooking === booking.Id ? 'cancelling' : ''}`}
                        onClick={() => handleCancelBooking(booking)}
                        disabled={cancellingBooking === booking.Id}
                      >
                        {cancellingBooking === booking.Id ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Cancelling...
                          </>
                        ) : (
                          "Cancel Booking"
                        )}
                      </button>
                    )}
                    
                    {isCancelled && (
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate("/", { state: { court: { Id: booking.CourtId, Name: booking.CourtName } } })}
                      >
                        Book Again
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="booking-legend mt-4">
            <h6>Status Legend:</h6>
            <div className="legend-items">
              <span>⏳ <strong>Pending:</strong> Booking submitted, awaiting confirmation</span>
              <span>✅ <strong>Confirmed:</strong> Booking confirmed and ready</span>
              <span>🎾 <strong>Active:</strong> Currently in use</span>
              <span>✅ <strong>Completed:</strong> Booking finished</span>
              <span>❌ <strong>Cancelled:</strong> Booking cancelled</span>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyBookings;
