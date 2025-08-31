import React, { useState, useEffect } from "react";
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
  const currentUser = useSelector((state) => state.auth.user);

  const [sport, setSport] = useState("");
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("10");
  const [endMinute, setEndMinute] = useState("00");
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);

  useEffect(() => {
    if (!court || !currentUser) {
      navigate("/");
    }
  }, [court, currentUser, navigate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!sport || !date || !startHour || !startMinute || !endHour || !endMinute) {
      alert("Please fill all fields");
      return;
    }

    const startTime = `${startHour}:${startMinute}`;
    const endTime = `${endHour}:${endMinute}`;

    // Check if end time is later than start time
    const start = parseInt(startHour) * 60 + parseInt(startMinute);
    const end = parseInt(endHour) * 60 + parseInt(endMinute);
    if (end <= start) {
      alert("End time must be after start time");
      return;
    }

    const newBooking = {
      userId: currentUser.Id,
      courtId: court.Id,
      sport,
      date,
      startTime,
      endTime,
    };

    try {
      setIsProcessing(true);
      setSubmitDisabled(true);
      const response = await courtService.createBooking(newBooking);
      if (response?.bookingId) {
        alert("Booking created successfully!");
        navigate("/user/payment", {
          state: {
            bookingId: response.bookingId,
            court,
            newBooking,
          },
        });
      } else {
        alert("Failed to create booking.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Error creating booking.");
    } finally {
      setIsProcessing(false);
      setSubmitDisabled(false);
    }
  };

  return (
    <div className="confirm-booking-container">
      <h2>Confirm Your Booking</h2>
      <form onSubmit={handleBookingSubmit}>
        <label className="form-label">Sport</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter sport"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
        />

        <label className="form-label">Date</label>
        <input
          type="date"
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label className="form-label">Start Time</label>
        <div className="time-select">
          <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="form-control">
            {HOURS.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
          <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)} className="form-control">
            {MINUTES.map((minute) => (
              <option key={minute} value={minute}>
                {minute}
              </option>
            ))}
          </select>
        </div>

        <label className="form-label">End Time</label>
        <div className="time-select">
          <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="form-control">
            {HOURS.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
          <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)} className="form-control">
            {MINUTES.map((minute) => (
              <option key={minute} value={minute}>
                {minute}
              </option>
            ))}
          </select>
        </div>

        <div className="proceed-to-payment">
          <button
            type="submit"
            className={`btn w-100 ${isProcessing ? "btn-warning" : "btn-success"}`}
            disabled={submitDisabled}
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating Booking...
              </>
            ) : (
              "Create Booking & Proceed to Payment"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfirmBooking;
