import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
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

  const [errorMessage, setErrorMessage] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (court && bookingDetails.date) {
        try {
          const res = await courtService.getCourtBookingsByDate(
            court.Id,
            bookingDetails.date
          );
          if (res?.success && Array.isArray(res.success)) {
            setBookedSlots(res.success);
          } else {
            setBookedSlots([]);
          }
        } catch {
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

  const parseTime = (t) => {
    const [hm, p] = t.split(" ");
    const [h, m] = hm.split(":");
    return [h, m, p];
  };

  const isSlotBooked = (sH, sM, sP, eH, eM, eP) => {
    if (!sH || !sM || !sP || !eH || !eM || !eP) return false;
    const start = to24Hour(sH, sM, sP);
    const end = to24Hour(eH, eM, eP);
    return bookedSlots.some((b) => {
      const bStart = b.StartTime ? to24Hour(...parseTime(b.StartTime)) : "";
      const bEnd = b.EndTime ? to24Hour(...parseTime(b.EndTime)) : "";
      return start < bEnd && end > bStart;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const { name, email, date, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod } = bookingDetails;

    if (
      isSlotBooked(startHour, startMinute, startPeriod, endHour, endMinute, endPeriod)
    ) {
      setErrorMessage("This time slot is already booked.");
      return;
    }

    const payload = {
      CourtId: court.Id,
      CourtName: court.Name,
      UserEmail: email,
      UserName: name,
      Date: date,
      StartTime: `${startHour}:${startMinute} ${startPeriod}`,
      EndTime: `${endHour}:${endMinute} ${endPeriod}`,
    };

    try {
      const res = await courtService.createBooking(payload);
      if (res?.success) {
        // ✅ Native Notification on localhost
        if (window.location.hostname === "localhost" && Notification.permission === "granted") {
          new Notification(`✅ Court "${court.Name}" booked successfully!`, {
            body: "Redirecting to My Bookings...",
            icon: "/favicon.ico",
          });
        }
        setTimeout(() => navigate("/mybookings"), 2000);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err) {
      setErrorMessage("Booking failed. Try again.");
    }
  };

  const renderTimeSelect = (type) => {
    const hourKey = `${type}Hour`;
    const minuteKey = `${type}Minute`;
    const periodKey = `${type}Period`;

    return (
      <div className="d-flex gap-2">
        <select name={hourKey} value={bookingDetails[hourKey]} onChange={handleInputChange} required>
          <option value="">HH</option>
          {HOURS.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <select name={minuteKey} value={bookingDetails[minuteKey]} onChange={handleInputChange} required>
          <option value="">MM</option>
          {MINUTES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select name={periodKey} value={bookingDetails[periodKey]} onChange={handleInputChange} required>
          <option value="">AM/PM</option>
          {PERIODS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="confirm-booking-container">
      <h2>Book Court: {court?.Name}</h2>
      <form onSubmit={handleBookingSubmit}>
        <div>
          <label>Your Name</label>
          <input type="text" name="name" value={bookingDetails.name} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Your Email</label>
          <input type="email" name="email" value={bookingDetails.email} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Date</label>
          <input type="date" name="date" value={bookingDetails.date} onChange={handleInputChange} required min={new Date().toISOString().split("T")[0]} />
        </div>
        <div>
          <label>Start Time</label>
          {renderTimeSelect("start")}
        </div>
        <div>
          <label>End Time</label>
          {renderTimeSelect("end")}
        </div>

        {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}

        <button type="submit" className="btn btn-primary mt-3">
          Book Now
        </button>
      </form>

      {bookedSlots.length > 0 && (
        <div className="mt-4">
          <strong>Booked Slots:</strong>
          <ul>
            {bookedSlots.map((b, i) => (
              <li key={i}>{b.StartTime} - {b.EndTime}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConfirmBooking;
