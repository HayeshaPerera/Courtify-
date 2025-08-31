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

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (court && bookingDetails.date) {
        try {
          const response = await courtService.getCourtBookingsByDate(
            court.Id,
            bookingDetails.date
          );
          if (response && response.success && Array.isArray(response.success)) {
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
    const [hm, period] = timeStr.split(" ");
    const [hour, minute] = hm.split(":");
    return [hour, minute, period];
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
    )
      return false;

    const start = to24Hour(startHour, startMinute, startPeriod);
    const end = to24Hour(endHour, endMinute, endPeriod);

    return bookedSlots.some((b) => {
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
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, { body, icon });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body, icon });
          }
        });
      }
    }
  };

  const resetProcessingState = () => {
    setIsProcessing(false);
    setShowPaymentRedirect(false);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const startTime = `${bookingDetails.startHour}:${bookingDetails.startMinute} ${bookingDetails.startPeriod}`;
    const endTime = `${bookingDetails.endHour}:${bookingDetails.endMinute} ${bookingDetails.endPeriod}`;

    // Clear any existing error messages
    setErrorMessage("");

    if (
      isSlotBooked(
        bookingDetails.startHour,
        bookingDetails.startMinute,
        bookingDetails.startPeriod,
        bookingDetails.endHour,
        bookingDetails.endMinute,
        bookingDetails.endPeriod
      )
    ) {
      setErrorMessage("This time slot is already booked. Please choose another slot.");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    // Start processing state
    setIsProcessing(true);
    setShowPaymentRedirect(true);
    
    // Show immediate notification
    showNotification(
      "💳 Processing Payment",
      `Court "${court.Name}" - ${startTime} to ${endTime} on ${bookingDetails.date}`,
      "/favicon.ico"
    );

    const payload = {
      CourtId: court.Id,
      CourtName: court.Name,
      UserEmail: bookingDetails.email,
      UserName: bookingDetails.name,
      Date: bookingDetails.date,
      StartTime: startTime,
      EndTime: endTime,
    };

    try {
      const response = await courtService.createBooking(payload);
      
      // Check if the response contains an error
      if (response && response.error) {
        resetProcessingState();
        setErrorMessage(response.error);
        
        // Show error notification
        showNotification(
          "❌ Booking Failed",
          response.error,
          "/favicon.ico"
        );
        
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }
      
      // Check for successful booking
      if (response && response.success) {
        setShowSuccess(true);
        resetProcessingState();

        showNotification(
          `✅ Court "${court.Name}" booked successfully!`,
          "Redirecting to My Bookings page...",
          "/favicon.ico"
        );

        setTimeout(() => navigate("/mybookings"), 2000);
      } else {
        // Handle unexpected response format
        resetProcessingState();
        setErrorMessage("Unexpected response from server. Please try again.");
        
        showNotification(
          "⚠️ Booking Error",
          "Unexpected response from server. Please try again.",
          "/favicon.ico"
        );
        
        setTimeout(() => setErrorMessage(""), 5000);
      }
    } catch (error) {
      resetProcessingState();
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Booking failed. Please try again.";
      setErrorMessage(message);
      
      showNotification(
        "❌ Connection Error",
        message,
        "/favicon.ico"
      );
      
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

      <h2>Book Court: {court ? court.Name : "Unknown Court"}</h2>
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

      {bookedSlots.length > 0 && (
        <div className="booked-slots mt-4">
          <h5>Booked Slots for {bookingDetails.date}:</h5>
          <ul className="list-group">
            {bookedSlots.map((b, idx) => (
              <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                <span>🕐 {b.StartTime} - {b.EndTime}</span>
                <span className="badge bg-danger rounded-pill">Booked</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConfirmBooking;