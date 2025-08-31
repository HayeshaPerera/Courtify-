import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import { useSelector } from "react-redux";

const HOURS = [...Array(12)].map((_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};
  const { provider } = useSelector((state) => state.auth);

  const [booking, setBooking] = useState({
    name: "",
    email: "",
    date: "",
    startHour: "09",
    startMinute: "00",
    startPeriod: "AM",
    endHour: "10",
    endMinute: "00",
    endPeriod: "AM",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const to24Hour = (h, m, p) => {
    let hour = parseInt(h, 10);
    if (p === "PM" && hour !== 12) hour += 12;
    if (p === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${m}`;
  };

  const isValidTime = () => {
    const start = to24Hour(booking.startHour, booking.startMinute, booking.startPeriod);
    const end = to24Hour(booking.endHour, booking.endMinute, booking.endPeriod);
    return start < end;
  };

  const handleChange = (e) => {
    setBooking({ ...booking, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidTime()) {
      setError("End time must be after start time");
      return;
    }

    const payload = {
      CourtId: court.Id,
      CourtName: court.Name,
      UserName: booking.name,
      UserEmail: booking.email,
      Date: booking.date,
      StartTime: `${booking.startHour}:${booking.startMinute} ${booking.startPeriod}`,
      EndTime: `${booking.endHour}:${booking.endMinute} ${booking.endPeriod}`,
    };

    try {
      setIsProcessing(true);
      const res = await courtService.createBooking(payload);
      if (res?.id || res?.bookingId) {
        navigate("/payment", {
          state: {
            booking: { ...payload, Id: res.id || res.bookingId },
            court,
            totalAmount: court.PricePerHour || 50,
          },
        });
      } else {
        setError("Booking failed. Please try again.");
      }
    } catch (err) {
      setError("Error creating booking.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Book Court: {court?.Name || "N/A"}</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input name="name" className="form-control my-2" placeholder="Your Name" onChange={handleChange} required />
        <input name="email" type="email" className="form-control my-2" placeholder="Your Email" onChange={handleChange} required />
        <input name="date" type="date" className="form-control my-2" onChange={handleChange} required />

        <div className="d-flex gap-2">
          <label>Start:</label>
          <select name="startHour" value={booking.startHour} onChange={handleChange}>{HOURS.map(h => <option key={h}>{h}</option>)}</select>
          <select name="startMinute" value={booking.startMinute} onChange={handleChange}>{MINUTES.map(m => <option key={m}>{m}</option>)}</select>
          <select name="startPeriod" value={booking.startPeriod} onChange={handleChange}>{PERIODS.map(p => <option key={p}>{p}</option>)}</select>
        </div>

        <div className="d-flex gap-2 mt-2">
          <label>End:</label>
          <select name="endHour" value={booking.endHour} onChange={handleChange}>{HOURS.map(h => <option key={h}>{h}</option>)}</select>
          <select name="endMinute" value={booking.endMinute} onChange={handleChange}>{MINUTES.map(m => <option key={m}>{m}</option>)}</select>
          <select name="endPeriod" value={booking.endPeriod} onChange={handleChange}>{PERIODS.map(p => <option key={p}>{p}</option>)}</select>
        </div>

        <button type="submit" className={`btn mt-4 w-100 ${isProcessing ? "btn-warning" : "btn-success"}`} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Creating Booking...
            </>
          ) : (
            "Create Booking & Proceed to Payment"
          )}
        </button>
      </form>
    </div>
  );
};

export default ConfirmBooking;
