import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/UserBookingPage.css";

const UserBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [existingBookings, setExistingBookings] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({
    sport: court?.SportType || "",
    date: "",
    startHour: "08",
    startMinute: "00",
    startPeriod: "AM",
    endHour: "09",
    endMinute: "00",
    endPeriod: "AM",
  });

  // Fetch existing bookings on mount
  useEffect(() => {
    if (court?.CourtId) {
      courtService
        .getBookingsByCourtId(court.CourtId)
        .then((bookings) => setExistingBookings(bookings))
        .catch((error) => console.error("Error fetching bookings:", error));
    }
  }, [court]);

  // Convert 12hr to 24hr time
  const convertTo24Hour = (hour, minute, period) => {
    let h = parseInt(hour, 10);
    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  // Slot conflict check
  const isSlotBooked = (startHour, startMinute, startPeriod, endHour, endMinute, endPeriod) => {
    const selectedStart = convertTo24Hour(startHour, startMinute, startPeriod);
    const selectedEnd = convertTo24Hour(endHour, endMinute, endPeriod);
    return existingBookings.some(
      (booking) =>
        booking.Date === bookingDetails.date &&
        !(
          selectedEnd <= booking.StartTime || selectedStart >= booking.EndTime
        )
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const {
      sport,
      date,
      startHour,
      startMinute,
      startPeriod,
      endHour,
      endMinute,
      endPeriod,
    } = bookingDetails;

    if (!sport || !date) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    const startTime = convertTo24Hour(startHour, startMinute, startPeriod);
    const endTime = convertTo24Hour(endHour, endMinute, endPeriod);

    if (startTime >= endTime) {
      setErrorMessage("Start time must be earlier than end time.");
      return;
    }

    if (isSlotBooked(startHour, startMinute, startPeriod, endHour, endMinute, endPeriod)) {
      setErrorMessage("This time slot is already booked. Please choose another slot.");
      return;
    }

    const newBooking = {
      UserEmail: "user@example.com", // Replace with actual user
      CourtId: court.CourtId,
      SportType: sport,
      Date: date,
      StartTime: startTime,
      EndTime: endTime,
    };

    try {
      await courtService.createBooking(newBooking);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/user/my-bookings");
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message || "Booking failed. Try again later.");
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];
  const periods = ["AM", "PM"];

  return (
    <div className="user-booking-page">
      <h2>Book {court?.Name}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Sport</label>
          <input
            type="text"
            name="sport"
            value={bookingDetails.sport}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={bookingDetails.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group time-select">
          <label>Start Time</label>
          <div className="time-row">
            <select name="startHour" value={bookingDetails.startHour} onChange={handleChange}>
              {hours.map((h) => <option key={h}>{h}</option>)}
            </select>
            <span>:</span>
            <select name="startMinute" value={bookingDetails.startMinute} onChange={handleChange}>
              {minutes.map((m) => <option key={m}>{m}</option>)}
            </select>
            <select name="startPeriod" value={bookingDetails.startPeriod} onChange={handleChange}>
              {periods.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group time-select">
          <label>End Time</label>
          <div className="time-row">
            <select name="endHour" value={bookingDetails.endHour} onChange={handleChange}>
              {hours.map((h) => <option key={h}>{h}</option>)}
            </select>
            <span>:</span>
            <select name="endMinute" value={bookingDetails.endMinute} onChange={handleChange}>
              {minutes.map((m) => <option key={m}>{m}</option>)}
            </select>
            <select name="endPeriod" value={bookingDetails.endPeriod} onChange={handleChange}>
              {periods.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* 🔥 Error & Warning Section */}
        {errorMessage && (
          <div className="alert alert-danger mt-3">
            {errorMessage}
          </div>
        )}

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

        <button type="submit" className="btn btn-primary mt-3">
          Proceed to Payment
        </button>
      </form>

      {/* ✅ Success Notification */}
      {showSuccess && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow">
          ✅ Court "{court?.Name}" booked successfully! Redirecting...
        </div>
      )}
    </div>
  );
};

export default UserBookingPage;
