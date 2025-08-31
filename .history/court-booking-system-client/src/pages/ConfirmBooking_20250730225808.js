import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import { useSelector } from "react-redux";
import "../styles/ConfirmBooking.css"; // Ensure you have styling

const HOURS = [...Array(12)].map((_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const AMPM = ["AM", "PM"];

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};
  const userEmail = useSelector((state) => state.auth.email);
  const [sport, setSport] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState({ hour: "09", minute: "00", ampm: "AM" });
  const [endTime, setEndTime] = useState({ hour: "10", minute: "00", ampm: "AM" });
  const [bookingError, setBookingError] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    if (court?.CourtId) {
      courtService.getBookingsByCourtId(court.CourtId)
        .then((slots) => setBookedSlots(slots))
        .catch((err) => console.error("Failed to fetch bookings:", err));
    }
  }, [court?.CourtId]);

  const convertTo24Hour = ({ hour, minute, ampm }) => {
    let h = parseInt(hour, 10);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  const isOverlapping = (newStart, newEnd) => {
    return bookedSlots.some(({ Date, StartTime, EndTime }) =>
      Date === date &&
      !(newEnd <= StartTime || newStart >= EndTime)
    );
  };

  const showNotification = (title, body) => {
    if (!("Notification" in window)) {
      alert(`${title}\n${body}`);
      return;
    }
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
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
      showNotification("Booking Confirmed ✅", `Court booked on ${date} from ${newStart} to ${newEnd}`);
      navigate("/user/home");
    } catch (err) {
      setBookingError(err.message || "Failed to book court.");
    }
  };

  return (
    <div className="confirm-booking-container">
      <h2>Confirm Booking</h2>
      {court ? (
        <>
          <div className="court-info">
            <p><strong>Name:</strong> {court.Name}</p>
            <p><strong>Location:</strong> {court.Location}</p>
          </div>

          <form className="booking-form" onSubmit={handleBookingSubmit}>
            <label>
              Sport:
              <input
                type="text"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                required
              />
            </label>

            <label>
              Date:
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </label>

            <label>
              Start Time:
              <div className="time-select">
                <select value={startTime.hour} onChange={(e) => setStartTime({ ...startTime, hour: e.target.value })}>
                  {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <span>:</span>
                <select value={startTime.minute} onChange={(e) => setStartTime({ ...startTime, minute: e.target.value })}>
                  {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={startTime.ampm} onChange={(e) => setStartTime({ ...startTime, ampm: e.target.value })}>
                  {AMPM.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </label>

            <label>
              End Time:
              <div className="time-select">
                <select value={endTime.hour} onChange={(e) => setEndTime({ ...endTime, hour: e.target.value })}>
                  {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <span>:</span>
                <select value={endTime.minute} onChange={(e) => setEndTime({ ...endTime, minute: e.target.value })}>
                  {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={endTime.ampm} onChange={(e) => setEndTime({ ...endTime, ampm: e.target.value })}>
                  {AMPM.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </label>

            {bookingError && <p className="error-message">{bookingError}</p>}

            <button type="submit">Confirm Booking</button>
          </form>

          {bookedSlots.length > 0 && (
            <div className="booked-slots">
              <h3>Already Booked Slots</h3>
              <ul>
                {bookedSlots.map((slot, i) => (
                  <li key={i}>
                    {slot.Date}: {slot.StartTime} - {slot.EndTime}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p>No court selected.</p>
      )}
    </div>
  );
};

export default ConfirmBooking;
