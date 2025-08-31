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
  const [errorMessage, setErrorMessage] = useState("");

  // State for booked slots
  const [bookedSlots, setBookedSlots] = useState([]);

  // Fetch booked slots when court or date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (court && bookingDetails.date) {
        try {
          const response = await courtService.getCourtBookingsByDate(court.Id, bookingDetails.date);
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

  // Helper to convert to 24-hour time for comparison
  const to24Hour = (hour, minute, period) => {
    let h = parseInt(hour, 10);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  // Helper to check if a slot is booked (overlap logic)
  const isSlotBooked = (startHour, startMinute, startPeriod, endHour, endMinute, endPeriod) => {
    if (!startHour || !startMinute || !startPeriod || !endHour || !endMinute || !endPeriod) return false;
    const start = to24Hour(startHour, startMinute, startPeriod);
    const end = to24Hour(endHour, endMinute, endPeriod);

    return bookedSlots.some((b) => {
      const bStart = b.StartTime ? to24Hour(...parseTime(b.StartTime)) : "";
      const bEnd = b.EndTime ? to24Hour(...parseTime(b.EndTime)) : "";
      // Overlap: start < bEnd && end > bStart
      return start < bEnd && end > bStart;
    });
  };

  // Helper to parse "HH:MM AM/PM" to [hour, minute, period]
  const parseTime = (timeStr) => {
    // Example: "10:15 AM"
    const [hm, period] = timeStr.split(" ");
    const [hour, minute] = hm.split(":");
    return [hour, minute, period];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({ ...bookingDetails, [name]: value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const startTime = `${bookingDetails.startHour}:${bookingDetails.startMinute} ${bookingDetails.startPeriod}`;
    const endTime = `${bookingDetails.endHour}:${bookingDetails.endMinute} ${bookingDetails.endPeriod}`;

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
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

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

      // Check for backend error
      if (response && response.error) {
        setErrorMessage(response.error);
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }

      if (response && response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setErrorMessage("Booking failed. Please try again.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (error) {
      setErrorMessage(error?.message || "Booking failed. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }

    setBookingDetails({
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
  };

  // Generate available start/end time options (disable those that overlap)
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
        >
          <option value="">AM/PM</option>
          {PERIODS.map((period) => (
            <option key={period} value={period}>{period}</option>
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
          style={{ zIndex: 1050, width: "fit-content" }}
        >
          ✅ Court "{court?.Name}" booked successfully! Redirecting...
        </div>
      )}

      {errorMessage && (
        <div
          className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3 shadow"
          style={{ zIndex: 1060, width: "fit-content" }}
        >
          {errorMessage}
        </div>
      )}

      <h2>Book Court: {court ? court.Name : "Unknown Court"}</h2>
      <form onSubmit={handleBookingSubmit}>
        <div className="form-item">
          <label htmlFor="name" className="form-label">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={bookingDetails.name}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-item">
          <label htmlFor="email" className="form-label">Your Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={bookingDetails.email}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-item">
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
          />
        </div>
        <div className="form-item">
          <label className="form-label">Booking Time</label>
          <div className="row g-3">
            {["start", "end"].map((type) => (
              <div className="col-md-6" key={type}>
                <label className="form-label">{type.charAt(0).toUpperCase() + type.slice(1)} Time</label>
                <div className="d-flex gap-2">
                  {renderTimeOptions(type)}
                </div>
              </div>
            ))}
          </div>
          <small className="text-muted mt-2 d-block">
            Make sure the end time is later than the start time. Booked slots will be blocked automatically.
          </small>
        </div>

        <button
          type="submit"
          className="btn btn-success w-100 mt-3"
          disabled={
            isSlotBooked(
              bookingDetails.startHour,
              bookingDetails.startMinute,
              bookingDetails.startPeriod,
              bookingDetails.endHour,
              bookingDetails.endMinute,
              bookingDetails.endPeriod
            )
          }
        >
          Proceed to Payment
        </button>
        <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => navigate("/")}>
          Cancel
        </button>
      </form>
      {/* Optionally, show booked slots for the selected date */}
      {bookedSlots.length > 0 && (
        <div className="booked-slots mt-4">
          <h5>Booked Slots for {bookingDetails.date}:</h5>
          <ul>
            {bookedSlots.map((b, idx) => (
              <li key={idx}>
                {b.StartTime} - {b.EndTime}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConfirmBooking;
