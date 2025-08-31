import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import { useSelector } from "react-redux";
import "../styles/ConfirmBooking.css";

const HOURS = [...Array(12)].map((_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const AMPM = ["AM", "PM"];

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};
  const user = useSelector((state) => state.auth.user);
  const userEmail = user?.email || "";

  const [sport, setSport] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState({ hour: "08", minute: "00", ampm: "AM" });
  const [endTime, setEndTime] = useState({ hour: "09", minute: "00", ampm: "AM" });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (!court || !court.CourtId) return;
    courtService.getBookingsByCourtAndDate(court.CourtId, date).then(setBookedSlots);
  }, [court, date]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const convertTo24Hour = ({ hour, minute, ampm }) => {
    let h = parseInt(hour);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  const isOverlapping = (start, end) => {
    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    return bookedSlots.some((b) => {
      const bStart = toMinutes(b.StartTime);
      const bEnd = toMinutes(b.EndTime);
      return startMin < bEnd && endMin > bStart;
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!court || !court.CourtId) return;

    const newStart = convertTo24Hour(startTime);
    const newEnd = convertTo24Hour(endTime);

    if (newStart >= newEnd) {
      setBookingError("Start time must be before end time.");
      return;
    }

    if (isOverlapping(newStart, newEnd)) {
      setBookingError("This time slot overlaps with an existing booking.");
      return;
    }

    const booking = {
      CourtId: court.CourtId,
      UserEmail: userEmail,
      Sport: sport,
      Date: date,
      StartTime: newStart,
      EndTime: newEnd,
    };

    try {
      await courtService.createBooking(booking);

      // Notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("✅ Booking Confirmed", {
          body: `Court booked on ${date} from ${newStart} to ${newEnd}`,
          icon: "/favicon.ico",
        });
      }

      navigate("/payment", { state: { booking } });
    } catch (err) {
      setBookingError(err.message || "Booking failed.");
    }
  };

  return (
    <div className="confirm-booking-container">
      <h2>Confirm Booking</h2>
      <form onSubmit={handleBookingSubmit} className="booking-form">
        <label>Sport</label>
        <input
          type="text"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          required
        />

        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <label>Start Time</label>
        <div className="time-select">
          <select
            value={startTime.hour}
            onChange={(e) => setStartTime({ ...startTime, hour: e.target.value })}
          >
            {HOURS.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
          <span>:</span>
          <select
            value={startTime.minute}
            onChange={(e) => setStartTime({ ...startTime, minute: e.target.value })}
          >
            {MINUTES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select
            value={startTime.ampm}
            onChange={(e) => setStartTime({ ...startTime, ampm: e.target.value })}
          >
            {AMPM.map((ap) => (
              <option key={ap}>{ap}</option>
            ))}
          </select>
        </div>

        <label>End Time</label>
        <div className="time-select">
          <select
            value={endTime.hour}
            onChange={(e) => setEndTime({ ...endTime, hour: e.target.value })}
          >
            {HOURS.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
          <span>:</span>
          <select
            value={endTime.minute}
            onChange={(e) => setEndTime({ ...endTime, minute: e.target.value })}
          >
            {MINUTES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select
            value={endTime.ampm}
            onChange={(e) => setEndTime({ ...endTime, ampm: e.target.value })}
          >
            {AMPM.map((ap) => (
              <option key={ap}>{ap}</option>
            ))}
          </select>
        </div>

        {bookingError && <p className="error">{bookingError}</p>}

        <button type="submit">Proceed to Payment</button>
      </form>
    </div>
  );
};

export default ConfirmBooking;
