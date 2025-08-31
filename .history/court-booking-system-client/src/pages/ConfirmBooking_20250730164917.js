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

  const [bookedSlots, setBookedSlots] = useState([]);

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

  const isSlotBooked = (startHour, startMinute, startPeriod, endHour, endMinute, endPeriod) => {
    if (!startHour || !startMinute || !startPeriod || !endHour || !endMinute || !endPeriod) return false;
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

      // If booking was successful
      if (response && response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      // Catch booking rejection (including from backend)
      const message =
        error?.response?.data?.error || // in case you use axios or fetch with a backend response
        error?.message ||               // from new Error("...")
        "Booking failed. Please try again.";

      setErrorMessage(message);
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

        {/* ✅ Error message shown inside the form */}
        {errorMessage && (
          <div className="alert alert-danger mt-3">
            {errorMessage}
          </div>
        )}

        <div className="mt-3">
        <button
            type="submit"
            className="btn btn-success w-100"
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

          {/* ERROR MESSAGE AREA (only appears if there's an error) */}
          {errorMessage && (
            <div className="alert alert-danger mt-3">
              {errorMessage}
            </div>
          )}

          {/* Show overlap error even if backend hasn't responded */}
          {!errorMessage &&
            isSlotBooked(
              bookingDetails.startHour,
              bookingDetails.startMinute,
              bookingDetails.startPeriod,
              bookingDetails.endHour,
              bookingDetails.endMinute,
              bookingDetails.endPeriod
            ) && (
              <div className="alert alert-warning mt-3">
                This time slot is already booked. Please choose another slot.
              </div>
          )}
        </div>

        <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => navigate("/cancelbooking")}>
          Cancel
        </button>
      </form>

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
