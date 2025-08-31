import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import { useSelector } from "react-redux";
import "../styles/ConfirmBooking.css";

const HOURS = [...Array(12)].map((_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};

  const user = useSelector((state) => state.auth.user);
  const [bookingDetails, setBookingDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    date: "",
    startHour: "02",
    startMinute: "00",
    startPeriod: "PM",
    endHour: "04",
    endMinute: "00",
    endPeriod: "PM",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const isSlotBooked = (
    startHour,
    startMinute,
    startPeriod,
    endHour,
    endMinute,
    endPeriod
  ) => {
    // Add your custom logic here for checking slot conflicts
    return false;
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
      if (response && response.success) {
        setShowSuccess(true);

        // ✅ Show browser notification ONLY on localhost
        if (window.location.hostname === "localhost" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("Redirecting to payment page...");
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification("Redirecting to payment page...");
              }
            });
          }
        }

        setTimeout(() => navigate("/mybookings"), 2000);
      } else if (response.error) {
        setErrorMessage(response.error);
      }
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Booking failed. Please try again.";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div className="confirm-booking-container">
      <h2>Confirm Booking for {court?.Name}</h2>
      <form onSubmit={handleBookingSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={bookingDetails.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={bookingDetails.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Date:
          <input
            type="date"
            name="date"
            value={bookingDetails.date}
            onChange={handleChange}
            required
          />
        </label>

        <div className="time-selection">
          <div>
            <label>Start Time:</label>
            <select name="startHour" value={bookingDetails.startHour} onChange={handleChange}>
              {HOURS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            :
            <select name="startMinute" value={bookingDetails.startMinute} onChange={handleChange}>
              {MINUTES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select name="startPeriod" value={bookingDetails.startPeriod} onChange={handleChange}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <div>
            <label>End Time:</label>
            <select name="endHour" value={bookingDetails.endHour} onChange={handleChange}>
              {HOURS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            :
            <select name="endMinute" value={bookingDetails.endMinute} onChange={handleChange}>
              {MINUTES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select name="endPeriod" value={bookingDetails.endPeriod} onChange={handleChange}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {errorMessage && <p className="error">{errorMessage}</p>}
        {showSuccess && <p className="success">Booking successful! Redirecting...</p>}

        <button type="submit">Confirm Booking</button>
      </form>
    </div>
  );
};

export default ConfirmBooking;
