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
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

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
          console.error("Error fetching booked slots:", err);
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

  const isValidTimeRange = (startHour, startMinute, startPeriod, endHour, endMinute, endPeriod) => {
    if (!startHour || !startMinute || !startPeriod || !endHour || !endMinute || !endPeriod) {
      return { valid: false, message: "Please fill in all time fields" };
    }

    const start = to24Hour(startHour, startMinute, startPeriod);
    const end = to24Hour(endHour, endMinute, endPeriod);
    
    if (start >= end) {
      return { valid: false, message: "End time must be later than start time" };
    }

    // Check minimum booking duration (e.g., 30 minutes)
    const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
    const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
    const duration = endMinutes - startMinutes;
    
    if (duration < 30) {
      return { valid: false, message: "Minimum booking duration is 30 minutes" };
    }

    return { valid: true, message: "" };
  };

  const isSlotBooked = (startHour, startMinute, startPeriod, endHour, endMinute, endPeriod) => {
    const timeValidation = isValidTimeRange(startHour, startMinute, startPeriod, endHour, endMinute, endPeriod);
    if (!timeValidation.valid) {
      return false; // Don't show as booked if time range is invalid
    }

    const start = to24Hour(startHour, startMinute, startPeriod);
    const end = to24Hour(endHour, endMinute, endPeriod);

    return bookedSlots.some((b) => {
      // Skip cancelled/completed bookings
      const status = b.Status?.toLowerCase();
      if (status === 'cancelled' || status === 'canceled' || status === 'completed') {
        return false;
      }

      const bStart = b.StartTime ? to24Hour(...parseTime(b.StartTime)) : "";
      const bEnd = b.EndTime ? to24Hour(...parseTime(b.EndTime)) : "";
      
      // Check for time overlap
      return start < bEnd && end > bStart;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({ ...bookingDetails, [name]: value });
    
    // Clear error message when user makes changes
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const showNotification = (title, body, icon = "/favicon.ico") => {
    if (!("Notification" in window)) return false;
    
    if (Notification.permission === "granted") {
      try {
        const notification = new Notification(title, { body, icon });
        notification.onclick = () => window.focus();
        return true;
      } catch (error) {
        console.error("Notification error:", error);
        return false;
      }
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body, icon });
        }
      });
    }
    return false;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    const { startHour, startMinute, startPeriod, endHour, endMinute, endPeriod } = bookingDetails;
    
    // Validate time range
    const timeValidation = isValidTimeRange(startHour, startMinute, startPeriod, endHour, endMinute, endPeriod);
    if (!timeValidation.valid) {
      setErrorMessage(timeValidation.message);
      return;
    }

    // Check for slot conflicts
    const slotConflict = isSlotBooked(startHour, startMinute, startPeriod, endHour, endMinute, endPeriod);
    if (slotConflict) {
      const errorMsg = "This time slot is already booked. Please choose another slot.";
      setErrorMessage(errorMsg);
      showNotification("❌ Booking Conflict", errorMsg);
      return;
    }

    const startTime = `${startHour}:${startMinute} ${startPeriod}`;
    const endTime = `${endHour}:${endMinute} ${endPeriod}`;

    setIsProcessing(true);
    setErrorMessage("");

    showNotification(
      "🔄 Creating Booking",
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

      // Set timeout for request
      const timeout = setTimeout(() => {
        if (isProcessing) {
          setIsProcessing(false);
          setErrorMessage("Request timeout. Please try again.");
        }
      }, 15000);

      if (response?.error) {
        clearTimeout(timeout);
        setIsProcessing(false);
        setErrorMessage(response.error);
        showNotification("❌ Booking Failed", response.error);
        return;
      }

      if (response && (response.success || response.message === "Booking created successfully" || response.id)) {
        clearTimeout(timeout);
        setIsProcessing(false);
        setShowSuccess(true);
        
        showNotification(
          `✅ Booking Created!`,
          `Court "${court?.Name || 'Unknown'}" booked successfully. Redirecting to payment...`
        );

        // Navigate to payment page with booking details immediately after successful booking creation
        navigate("/userdashboard/payment", {
          state: {
            booking: {
              ...payload,
              StartTime: startTime,
              EndTime: endTime,
              Id: response.id || response.bookingId || Date.now()
            },
            court: court
          }
        });
      } else {
        // Handle unclear response by checking if booking was created
        setTimeout(async () => {
          try {
            const checkResponse = await courtService.getCourtBookingsByDate(court.Id, bookingDetails.date);
            const updatedSlots = Array.isArray(checkResponse) ? checkResponse : (checkResponse?.success || []);
            
            const ourBookingExists = updatedSlots.some(slot =>
              slot.UserEmail === bookingDetails.email &&
              slot.Date === bookingDetails.date &&
              slot.StartTime === startTime
            );

            clearTimeout(timeout);
            setIsProcessing(false);

            if (ourBookingExists) {
              setShowSuccess(true);
              showNotification(`✅ Booking Created!`, "Redirecting to payment...");
              
            // And also replace the second navigate call in the setTimeout:
            navigate("/userdashboard/payment", {
              state: {
                booking: {
                  ...payload,
                  StartTime: startTime,
                  EndTime: endTime
                },
                court: court
              }
            });
            } else {
              setErrorMessage("Booking status unclear. Please check My Bookings page.");
            }
          } catch (checkError) {
            clearTimeout(timeout);
            setIsProcessing(false);
            setErrorMessage("Booking status unclear. Please check My Bookings page.");
          }
        }, 2000);
      }
    } catch (error) {
      setIsProcessing(false);
      const message = error?.response?.data?.error || error?.message || "Booking failed. Please try again.";
      setErrorMessage(message);
      showNotification("❌ Connection Error", message);
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
            <option key={hour} value={hour}>{hour}</option>
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
            <option key={min} value={min}>{min}</option>
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
            <option key={period} value={period}>{period}</option>
          ))}
        </select>
      </>
    );
  };

  // Check if current time selection is valid and available
  const timeValidation = isValidTimeRange(
    bookingDetails.startHour,
    bookingDetails.startMinute, 
    bookingDetails.startPeriod,
    bookingDetails.endHour,
    bookingDetails.endMinute,
    bookingDetails.endPeriod
  );

  const slotBooked = timeValidation.valid && isSlotBooked(
    bookingDetails.startHour,
    bookingDetails.startMinute,
    bookingDetails.startPeriod,
    bookingDetails.endHour,
    bookingDetails.endMinute,
    bookingDetails.endPeriod
  );

  const submitDisabled = isProcessing || !timeValidation.valid || slotBooked;

  return (
    <div className="confirm-booking-container">
      {/* Success Alert */}
      {showSuccess && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow" style={{ zIndex: 1050, minWidth: "300px", textAlign: "center" }}>
          ✅ Booking created successfully! Redirecting to payment...
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3 shadow" style={{ zIndex: 1050, minWidth: "300px", textAlign: "center" }}>
          ❌ {errorMessage}
        </div>
      )}

      <h2>{court ? court.Name : "Unknown Court"}</h2>
      
      {court && (
        <div className="court-info mb-4 p-3 bg-light rounded">
          <p><strong>Price per Hour:</strong> LKR {court.PricePerHour}</p>
        </div>
      )}

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
                <label className="form-label">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Time
                </label>
                <div className="d-flex gap-2">
                  {renderTimeOptions(type)}
                </div>
              </div>
            ))}
          </div>

          {/* Time Validation Messages */}
          {!timeValidation.valid && timeValidation.message && (
            <div className="alert alert-warning mt-2">
              ⚠️ {timeValidation.message}
            </div>
          )}

          {timeValidation.valid && slotBooked && (
            <div className="alert alert-warning mt-2">
              ⚠️ This time slot is already booked. Please choose another slot.
            </div>
          )}

          <small className="text-muted mt-2 d-block">
            Minimum booking duration is 30 minutes. End time must be later than start time.
          </small>
        </div>

        <div className="proceed-to-payment">
          <button
            type="submit"
            className={`btn w-100 ${isProcessing ? 'btn-warning' : 'btn-success'}`}
            disabled={submitDisabled}
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating Booking...
              </>
            ) : (
              " Proceed to Payment"
            )}
          </button>

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
                  <div className="slot-badges">
                    {isCancelled ? (
                      <>
                        <span className="badge bg-secondary rounded-pill me-2">{b.Status}</span>
                        <span className="badge bg-success rounded-pill">Available</span>
                      </>
                    ) : (
                      <span className="badge bg-danger rounded-pill"></span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <small className="text-muted mt-2">
            ℹ️ Cancelled slots are available for booking again.
          </small>
        </div>
      )}
    </div>
  );
};

export default ConfirmBooking;
