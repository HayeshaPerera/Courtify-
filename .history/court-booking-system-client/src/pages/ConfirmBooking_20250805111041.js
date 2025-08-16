import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import { useSelector } from "react-redux";
import "../styles/ConfirmBooking.css";

const HOURS = [...Array(12)].map((_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};

  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    date: "",
    startHour: "",
    startMinute: "",
    startPeriod: "",
    endHour: "",
    endMinute: "",
    endPeriod: "",
  });

  const { provider } = useSelector((state) => state.auth);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPaymentRedirect, setShowPaymentRedirect] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [cancellingSlot, setCancellingSlot] = useState(null);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [cancelledSlotInfo, setCancelledSlotInfo] = useState(null);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (court && bookingDetails.date) {
        try {
          const response = await courtService.getCourtBookingsByDate(
            court.Id,
            bookingDetails.date
          );
          
          if (Array.isArray(response)) {
            setBookedSlots(response);
          } else if (response && response.success && Array.isArray(response.success)) {
            setBookedSlots(response.success);
          } else {
            setBookedSlots([]);
          }
        } catch (err) {
          setBookedSlots([]);
        }
      }
    };
    fetchBookedSlots();
  }, [court, bookingDetails.date]);

  const to24Hour = (hour, minute, period) => {
    let h = parseInt(hour, 10);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  const parseTime = (timeStr) => {
    try {
      const [hm, period] = timeStr.split(" ");
      const [hour, minute] = hm.split(":");
      return [hour, minute, period];
    } catch (error) {
      return ["", "", ""];
    }
  };

  const isSlotBooked = (
    startHour,
    startMinute,
    startPeriod,
    endHour,
    endMinute,
    endPeriod
  ) => {
    if (
      !startHour ||
      !startMinute ||
      !startPeriod ||
      !endHour ||
      !endMinute ||
      !endPeriod
    ) {
      return false;
    }

    const start = to24Hour(startHour, startMinute, startPeriod);
    const end = to24Hour(endHour, endMinute, endPeriod);

    return bookedSlots.some((b) => {
      // Check if the slot is cancelled or completed (available for booking)
      const status = b.Status?.toLowerCase();
      const isCancelled = status === 'cancelled' || status === 'canceled' || status === 'completed';
      
      // If the slot is cancelled/completed, it's available for booking
      if (isCancelled) {
        return false;
      }
      
      // Only consider active bookings for conflict detection
      const bStart = b.StartTime ? to24Hour(...parseTime(b.StartTime)) : "";
      const bEnd = b.EndTime ? to24Hour(...parseTime(b.EndTime)) : "";
      
      return start < bEnd && end > bStart;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({ ...bookingDetails, [name]: value });
  };

  const showNotification = (title, body, icon = "/favicon.ico") => {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      try {
        const notification = new Notification(title, { body, icon });
        notification.onclick = () => {
          window.focus();
        };
        return true;
      } catch (error) {
        return false;
      }
    } else if (Notification.permission === "denied") {
      return false;
    } else {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body, icon });
        }
      });
      return false;
    }
  };

  const resetProcessingState = () => {
    setIsProcessing(false);
    setShowPaymentRedirect(false);
  };

  const handleCancelBooking = async (booking) => {
    if (!window.confirm(`Are you sure you want to cancel the booking from ${booking.StartTime} to ${booking.EndTime}?`)) {
      return;
    }

    setCancellingSlot(booking.Id || `${booking.StartTime}-${booking.EndTime}`);
    
    try {
      // Assuming there's a cancelBooking method in courtService
      const response = await courtService.cancelBooking(booking.Id);
      
      if (response && (response.success || response.message === "Booking cancelled successfully")) {
        // Store cancelled slot info for display
        setCancelledSlotInfo({
          startTime: booking.StartTime,
          endTime: booking.EndTime,
          date: bookingDetails.date
        });
        
        setShowCancelSuccess(true);
        
        // Show notification
        showNotification(
          "✅ Booking Cancelled",
          `Slot ${booking.StartTime} - ${booking.EndTime} is now available`
        );
        
        // Refresh booked slots
        const updatedResponse = await courtService.getCourtBookingsByDate(
          court.Id,
          bookingDetails.date
        );
        
        if (Array.isArray(updatedResponse)) {
          setBookedSlots(updatedResponse);
        } else if (updatedResponse && updatedResponse.success && Array.isArray(updatedResponse.success)) {
          setBookedSlots(updatedResponse.success);
        } else {
          setBookedSlots([]);
        }
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowCancelSuccess(false);
          setCancelledSlotInfo(null);
        }, 5000);
        
      } else {
        const errorMsg = response?.error || "Failed to cancel booking. Please try again.";
        setErrorMessage(errorMsg);
        showNotification("❌ Cancellation Failed", errorMsg);
        setTimeout(() => setErrorMessage(""), 5000);
      }
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || "Failed to cancel booking. Please try again.";
      setErrorMessage(message);
      showNotification("❌ Cancellation Error", message);
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setCancellingSlot(null);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const startTime = `${bookingDetails.startHour}:${bookingDetails.startMinute} ${bookingDetails.startPeriod}`;
    const endTime = `${bookingDetails.endHour}:${bookingDetails.endMinute} ${bookingDetails.endPeriod}`;

    setErrorMessage("");

    const slotConflict = isSlotBooked(
      bookingDetails.startHour,
      bookingDetails.startMinute,
      bookingDetails.startPeriod,
      bookingDetails.endHour,
      bookingDetails.endMinute,
      bookingDetails.endPeriod
    );

    if (slotConflict) {
      const errorMsg = "This time slot is already booked. Please choose another slot.";
      setErrorMessage(errorMsg);
      showNotification("❌ Booking Conflict", errorMsg);
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    setIsProcessing(true);
    setShowPaymentRedirect(true);
    
    showNotification(
      "💳 Processing Payment",
      `Court "${court?.Name || 'Unknown'}" - ${startTime} to ${endTime} on ${bookingDetails.date}`
    );

    const payload = {
      CourtId: court?.Id,
      CourtName: court?.Name,
      UserEmail: bookingDetails.email,
      UserName: bookingDetails.name,
      Date: bookingDetails.date,
      StartTime: startTime,
      EndTime: endTime,
    };

    try {
      const response = await courtService.createBooking(payload);
      
      setTimeout(() => {
        if (isProcessing) {
          resetProcessingState();
          setErrorMessage("Request timeout. Please try again.");
        }
      }, 15000);
      
      if (response && response.error) {
        resetProcessingState();
        setErrorMessage(response.error);
        showNotification("❌ Booking Failed", response.error);
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }
      
      if (response && (response.success || response.message === "Booking created successfully" || response.id)) {
        setShowSuccess(true);
        resetProcessingState();

        showNotification(
          `✅ Court "${court?.Name || 'Unknown'}" booked successfully!`,
          "Redirecting to My Bookings page..."
        );

        setTimeout(() => {
          navigate("/mybookings");
        }, 2000);
      } else if (response === null || response === undefined) {
        setTimeout(async () => {
          try {
            const checkResponse = await courtService.getCourtBookingsByDate(court.Id, bookingDetails.date);
            const updatedSlots = Array.isArray(checkResponse) ? checkResponse : (checkResponse?.success || []);
            
            const ourBookingExists = updatedSlots.some(slot => 
              slot.UserEmail === bookingDetails.email && 
              slot.Date === bookingDetails.date &&
              slot.StartTime === startTime
            );
            
            if (ourBookingExists) {
              setShowSuccess(true);
              resetProcessingState();
              showNotification(`✅ Court "${court?.Name}" booked successfully!`, "Redirecting to My Bookings page...");
              setTimeout(() => navigate("/mybookings"), 2000);
            } else {
              resetProcessingState();
              setErrorMessage("Booking status unclear. Please check My Bookings page.");
            }
          } catch (checkError) {
            resetProcessingState();
            setErrorMessage("Booking status unclear. Please check My Bookings page.");
          }
        }, 2000);
        
      } else {
        resetProcessingState();
        const errorMsg = "Unexpected response from server. Please try again.";
        setErrorMessage(errorMsg);
        showNotification("⚠️ Booking Error", errorMsg);
        setTimeout(() => setErrorMessage(""), 5000);
      }
    } catch (error) {
      resetProcessingState();
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Booking failed. Please try again.";
      setErrorMessage(message);
      
      showNotification("❌ Connection Error", message);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const renderTimeOptions = (type) => {
    const hourKey = `${type}Hour`;
    const minuteKey = `${type}Minute`;
    const periodKey = `${type}Period`;

    return (
      <>
        <select
          name={hourKey}
          className="form-select"
          value={bookingDetails[hourKey]}
          onChange={handleInputChange}
          required
          disabled={isProcessing}
        >
          <option value="">HH</option>
          {HOURS.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
        <select
          name={minuteKey}
          className="form-select"
          value={bookingDetails[minuteKey]}
          onChange={handleInputChange}
          required
          disabled={isProcessing}
        >
          <option value="">MM</option>
          {MINUTES.map((min) => (
            <option key={min} value={min}>
              {min}
            </option>
          ))}
        </select>
        <select
          name={periodKey}
          className="form-select"
          value={bookingDetails[periodKey]}
          onChange={handleInputChange}
          required
          disabled={isProcessing}
        >
          <option value="">AM/PM</option>
          {PERIODS.map((period) => (
            <option key={period} value={period}>
              {period}
            </option>
          ))}
        </select>
      </>
    );
  };

  return (
    <div className="confirm-booking-container">
      {showSuccess && (
        <div 
          className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow" 
          style={{ zIndex: 1050, minWidth: "300px", textAlign: "center" }}
        >
          ✅ Court "{court?.Name}" booked successfully! Redirecting...
        </div>
      )}

      {showCancelSuccess && cancelledSlotInfo && (
        <div 
          className="alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3 shadow" 
          style={{ zIndex: 1050, minWidth: "300px", textAlign: "center" }}
        >
          🔄 Slot {cancelledSlotInfo.startTime} - {cancelledSlotInfo.endTime} is now available for booking!
        </div>
      )}

      {showPaymentRedirect && (
        <div 
          className="alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3 shadow" 
          style={{ zIndex: 1050, minWidth: "300px", textAlign: "center" }}
        >
          💳 Processing payment request...
        </div>
      )}

      {errorMessage && (
        <div 
          className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3 shadow" 
          style={{ zIndex: 1050, minWidth: "300px", textAlign: "center" }}
        >
          ❌ {errorMessage}
        </div>
      )}

      <div className="confirm-booking-header">
        <h2>Book Court: {court ? court.Name : "Unknown Court"}</h2>
      </div>

      <form onSubmit={handleBookingSubmit}>
        <div className="confirm-form-item">
          <label htmlFor="name" className="form-label">Your Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={bookingDetails.name} 
            onChange={handleInputChange} 
            className="form-control" 
            required 
            disabled={isProcessing}
          />
        </div>

        <div className="confirm-form-item">
          <label htmlFor="email" className="form-label">Your Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={bookingDetails.email} 
            onChange={handleInputChange} 
            className="form-control" 
            required 
            disabled={isProcessing}
          />
        </div>

        <div className="confirm-form-item">
          <label htmlFor="date" className="form-label">Booking Date</label>
          <input 
            type="date" 
            id="date" 
            name="date" 
            value={bookingDetails.date} 
            onChange={handleInputChange} 
            className="form-control" 
            required 
            min={new Date().toISOString().split("T")[0]} 
            disabled={isProcessing}
          />
        </div>

        <div className="confirm-form-item">
          <label className="form-label">Booking Time</label>
          <div className="row g-3">
            {['start', 'end'].map((type) => (
              <div className="col-md-6" key={type}>
                <label className="form-label">{type.charAt(0).toUpperCase() + type.slice(1)} Time</label>
                <div className="d-flex gap-2">{renderTimeOptions(type)}</div>
              </div>
            ))}
          </div>
          <small className="text-muted mt-2 d-block">
            Make sure the end time is later than the start time. Booked slots will be blocked automatically.
          </small>
        </div>

        <div className="proceed-to-payment">
          <button
            type="submit"
            className={`btn w-100 ${isProcessing ? 'btn-warning' : 'btn-success'}`}
            disabled={isProcessing || isSlotBooked(
              bookingDetails.startHour,
              bookingDetails.startMinute,
              bookingDetails.startPeriod,
              bookingDetails.endHour,
              bookingDetails.endMinute,
              bookingDetails.endPeriod
            )}
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing Payment...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </button>

          {!errorMessage && !isProcessing && isSlotBooked(
            bookingDetails.startHour,
            bookingDetails.startMinute,
            bookingDetails.startPeriod,
            bookingDetails.endHour,
            bookingDetails.endMinute,
            bookingDetails.endPeriod
          ) && (
            <div className="alert alert-warning mt-3">
              ⚠️ This time slot is already booked. Please choose another slot.
            </div>
          )}

          <button 
            type="button" 
            className="btn btn-secondary w-100 mt-2" 
            onClick={() => navigate("/")}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Booked Slots Display */}
      {bookedSlots.length > 0 && bookingDetails.date && (
        <div className="booked-slots mt-4">
          <h5>Booked Slots for {bookingDetails.date}:</h5>
          <ul className="list-group">
            {bookedSlots.map((b, idx) => {
              const status = b.Status?.toLowerCase();
              const isCancelled = status === 'cancelled' || status === 'canceled' || status === 'completed';
              return (
                <li key={idx} className={`list-group-item d-flex justify-content-between align-items-center ${isCancelled ? 'cancelled-slot' : ''}`}>
                  <span>🕐 {b.StartTime} - {b.EndTime}</span>
                  <div className="d-flex align-items-center gap-2">
                    <div className="slot-badges">
                      {isCancelled ? (
                        <>
                          <span className="badge bg-secondary rounded-pill me-2">{b.Status}</span>
                          <span className="badge bg-success rounded-pill">Available</span>
                        </>
                      ) : (
                        <span className="badge bg-danger rounded-pill">Booked</span>
                      )}
                    </div>
                    {/* Only show cancel button if the booking belongs to current user and is not already cancelled */}
                    {!isCancelled && b.UserEmail === bookingDetails.email && bookingDetails.email && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleCancelBooking(b)}
                        disabled={cancellingSlot === (b.Id || `${b.StartTime}-${b.EndTime}`)}
                      >
                        {cancellingSlot === (b.Id || `${b.StartTime}-${b.EndTime}`) ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Cancelling...
                          </>
                        ) : (
                          "Cancel"
                        )}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <small className="text-muted mt-2 d-block">
            ℹ️ Cancelled slots are available for booking again.
            {bookingDetails.email && " You can cancel your own active bookings using the Cancel button."}
          </small>
        </div>
      )}

      {bookedSlots.length === 0 && bookingDetails.date && (
        <div className="available-slots mt-4">
          <div className="alert alert-success">
            🎉 All slots are available for {bookingDetails.date}! Choose your preferred time above.
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmBooking;
