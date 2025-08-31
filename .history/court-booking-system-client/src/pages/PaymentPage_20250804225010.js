import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import courtService from "../services/domain-services/CourtService";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = useSelector((state) => state.auth.userInfo?.email);

  const [booking, setBooking] = useState(null);
  const [court, setCourt] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        setLoading(true);
        setError("");

        // First, try to get data from navigation state (from ConfirmBooking)
        const { booking: navBooking, court: navCourt } = location.state || {};
        
        if (navBooking && navCourt) {
          // Use data passed from ConfirmBooking
          setBooking(navBooking);
          setCourt(navCourt);
          
          let total = 0;
          try {
            total = calculateTotalAmount(navBooking.StartTime, navBooking.EndTime, navCourt.PricePerHour);
            if (!total || total <= 0) throw new Error("Invalid total calculated");
          } catch (calcErr) {
            console.warn("Failed to calculate total from nav data, using fallback:", calcErr);
            total = navCourt.PricePerHour || 50; // Use hourly rate as fallback
          }
          
          setTotalAmount(total);
          setLoading(false);
          return;
        }

        // Fallback: Load latest booking from user's bookings
        if (!userEmail) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const bookings = await courtService.getUserBookings(userEmail);

        if (!bookings || bookings.length === 0) {
          setError("No bookings found. Please create a booking first.");
          setLoading(false);
          return;
        }

        // Get the most recent booking (assuming it's the first one)
        const latestBooking = bookings[0];
        setBooking(latestBooking);

        // Get court details
        const courtData = await courtService.getCourtById(latestBooking.CourtId);
        if (!courtData) {
          throw new Error("Court data not found");
        }
        setCourt(courtData);

        // Calculate total amount
        let total = 0;
        try {
          total = calculateTotalAmount(latestBooking.StartTime, latestBooking.EndTime, courtData.PricePerHour);
          if (!total || total <= 0) throw new Error("Invalid total calculated");
        } catch (calcErr) {
          console.warn("Failed to calculate total from booking data, using fallback:", calcErr);
          total = courtData.PricePerHour || 50; // Use hourly rate as fallback
        }

        setTotalAmount(total);
      } catch (err) {
        console.error("Error loading booking/payment info:", err);
        setError(err.message || "Failed to load booking information");
        // Set a fallback amount for display
        setTotalAmount(100);
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, [userEmail, location.state]);

  const calculateTotalAmount = (start, end, pricePerHour) => {
    const to24Hour = (timeStr) => {
      if (!timeStr) throw new Error("Invalid time string");
      
      const parts = timeStr.trim().split(" ");
      if (parts.length !== 2) throw new Error("Malformed time string");
      
      const [time, period] = parts;
      const timeParts = time.split(":");
      if (timeParts.length !== 2) throw new Error("Invalid time format");
      
      let [hour, minute] = timeParts.map(Number);
      if (isNaN(hour) || isNaN(minute)) throw new Error("Invalid hour or minute");
      
      // Convert to 24-hour format
      if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
      if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
      
      return hour + minute / 60;
    };

    const startHour = to24Hour(start);
    const endHour = to24Hour(end);
    const duration = Math.max(0, endHour - startHour);

    if (duration === 0) throw new Error("Duration cannot be zero");
    if (!pricePerHour || pricePerHour <= 0) throw new Error("Invalid price per hour");

    return Math.round(duration * pricePerHour * 100) / 100; // Round to 2 decimal places
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return dateStr; // Return original if formatting fails
    }
  };

  const calculateDuration = (start, end) => {
    try {
      const startHour = calculateTotalAmount(start, end, 1); // Use price 1 to get duration
      return `${startHour} hour${startHour !== 1 ? 's' : ''}`;
    } catch (err) {
      return "Duration calculation failed";
    }
  };

  const handleVisaMaster = () => {
    if (!booking || !totalAmount) {
      setError("Missing booking information for payment");
      return;
    }
    navigate("/payment/stripe", { 
      state: { 
        booking, 
        court,
        totalAmount,
        paymentMethod: 'stripe'
      } 
    });
  };

  const handleCrypto = () => {
    if (!booking || !totalAmount) {
      setError("Missing booking information for payment");
      return;
    }
    navigate("/payment/crypto", { 
      state: { 
        booking, 
        court,
        totalAmount,
        paymentMethod: 'crypto'
      } 
    });
  };

  const handleBackToBooking = () => {
    navigate("/", { replace: true });
  };

  const handleViewBookings = () => {
    navigate("/userdashboard/myBookings", { replace: true });
  };

  return (
    <div>
      <style>{`
        .payment-container {
          max-width: 480px;
          margin: 60px auto;
          padding: 40px;
          border-radius: 16px;
          background-color: #ffffff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          font-family: 'Roboto', sans-serif;
        }
        
        h2 {
          font-size: 24px;
          margin-bottom: 20px;
          font-weight: 700;
          color: #0e6304;
          text-align: center;
        }
        
        h3 {
          font-size: 18px;
          margin-bottom: 16px;
          font-weight: 600;
          color: #0e6304;
        }
        
        .booking-summary {
          background: linear-gradient(135deg, #e6f9e6 0%, #f0fdf0 100%);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          font-size: 16px;
          color: #1a1a1a;
          border: 1px solid #d1fae5;
        }
        
        .booking-summary h4 {
          color: #0e6304;
          margin-bottom: 16px;
          font-size: 18px;
          font-weight: 600;
        }
        
        .booking-detail {
          display: flex;
          justify-content: space-between;
          margin: 12px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .booking-detail:last-child {
          border-bottom: none;
          font-weight: 600;
          font-size: 18px;
          color: #0e6304;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 2px solid #0e6304;
        }
        
        .booking-detail .label {
          font-weight: 600;
          color: #374151;
        }
        
        .booking-detail .value {
          color: #1f2937;
        }
        
        .payment-methods {
          text-align: center;
        }
        
        .payment-images {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin: 24px 0;
        }
        
        .payment-option {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
        }
        
        .payment-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(14, 99, 4, 0.15);
          border-color: #0e6304;
        }
        
        .payment-option img {
          width: 80px;
          height: auto;
          margin-bottom: 8px;
        }
        
        .payment-option .payment-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }
        
        .loading-container, .error-container, .no-bookings-container {
          text-align: center;
          padding: 40px 20px;
        }
        
        .loading-text, .error-text, .no-bookings-text {
          font-size: 16px;
          margin-bottom: 20px;
        }
        
        .loading-text {
          color: #6b7280;
        }
        
        .error-text {
          color: #dc2626;
        }
        
        .no-bookings-text {
          color: #6b7280;
        }
        
        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        
        .btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }
        
        .btn-primary {
          background-color: #0e6304;
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #0c5503;
        }
        
        .btn-secondary {
          background-color: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }
        
        .btn-secondary:hover {
          background-color: #e5e7eb;
        }
        
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #e5e7eb;
          border-radius: 50%;
          border-top-color: #0e6304;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="payment-container">
        <h2>Payment Confirmation</h2>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading booking details...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-container">
            <p className="error-text">⚠️ {error}</p>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleBackToBooking}>
                Create New Booking
              </button>
              <button className="btn btn-secondary" onClick={handleViewBookings}>
                View My Bookings
              </button>
            </div>
          </div>
        )}

        {!loading && !error && booking && court && (
          <>
            <div className="booking-summary">
              <h4>📋 Booking Summary</h4>
              
              <div className="booking-detail">
                <span className="label">🏟️ Court:{court.Name}</span>

              </div>
              
              <div className="booking-detail">
                <span className="label">📅 Date:</span>
                <span className="value">{formatDate(booking.Date)}</span>
              </div>
              
              <div className="booking-detail">
                <span className="label">🕐 Time:</span>
                <span className="value">{booking.StartTime} - {booking.EndTime}</span>
              </div>
              
              <div className="booking-detail">
                <span className="label">⏱️ Duration:</span>
                <span className="value">{(() => {
                  try {
                    const duration = calculateTotalAmount(booking.StartTime, booking.EndTime, 1);
                    return `${duration} hour${Math.abs(duration) !== 1 ? 's' : ''}`;
                  } catch {
                    return "Duration unavailable";
                  }
                })()}</span>
              </div>
              

            </div>

            <div className="payment-methods">
              <h3>💳 Select Payment Method</h3>
              <div className="payment-images">
                <div className="payment-option" onClick={handleVisaMaster}>
                  <img src="/visamaster.jpg" alt="Visa/Mastercard" />
                  <div className="payment-label"></div>
                </div>
                <div className="payment-option" onClick={handleCrypto}>
                  <img src="/bitcoin.jpg" alt="Cryptocurrency" />
                  <div className="payment-label">Cryptocurrency</div>
                </div>
              </div>
              
              <div className="action-buttons">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                  ← Back
                </button>
                <button className="btn btn-secondary" onClick={handleViewBookings}>
                  My Bookings
                </button>
              </div>
            </div>
          </>
        )}

        {!loading && !error && !booking && (
          <div className="no-bookings-container">
            <p className="no-bookings-text">🔍 No booking information found.</p>
            <p className="no-bookings-text">Please create a booking first to proceed with payment.</p>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleBackToBooking}>
                Create New Booking
              </button>
              <button className="btn btn-secondary" onClick={handleViewBookings}>
                View My Bookings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;