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
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (court && bookingDetails.date) {
        try {
          const response = await courtService.getCourtBookingsByDate(
            court.Id,
            bookingDetails.date
          );
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

  const isSlotBooked = (
    startHour,
    startMinute,
    startPeriod,
    endHour,
    endMinute,
    endPeriod
  ) => {
    if (!startHour || !startMinute || !startPeriod || !endHour || !endMinute || !endPeriod)
      return false;

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
        navigate("/mybookings");
      }
    } catch (error) {
      // Silent fail for now
    }
  };

  const renderTimeOptions = (type) => {
    const hourKey = `${type}Hour`;
    const minuteKey = `${type}Minute`;
    const periodKey = `${type}Period`;

    return (
      <>
        <select name={hourKey} value={bookingDetails[hourKey]} onChange={handleInputChange} required>
          <option value="">HH</option>
          {HOURS.map((hour) => (
            <option key={hour} value={hour}>{hour}</option>
          ))}
        </select>
        <select name={minuteKey} value={bookingDetails[minuteKey]} onChange={handleInputChange} required>
          <option value="">MM</option>
          {MINUTES.map((min) => (
            <option key={min} value={min}>{min}</option>
          ))}
        </select>
        <select name={periodKey} value={bookingDetails[periodKey]} onChange={handleInputChange} required>
          <option value="">AM/PM</option>
          {PERIODS.map((period) => (
            <option key={period} value={period}>{period}</option>
          ))}
        </select>
      </>
    );
  };

  return (
    <div>
      <h2>Book Court: {court ? court.Name : "Unknown Court"}</h2>
      <form onSubmit={handleBookingSubmit}>
        <input type="text" name="name" value={bookingDetails.name} onChange={handleInputChange} required placeholder="Your Name" />
        <input type="email" name="email" value={bookingDetails.email} onChange={handleInputChange} required placeholder="Your Email" />
        <input type="date" name="date" value={bookingDetails.date} onChange={handleInputChange} required min={new Date().toISOString().split("T")[0]} />

        <div>
          <label>Start Time</label>
          {renderTimeOptions("start")}
        </div>
        <div>
          <label>End Time</label>
          {renderTimeOptions("end")}
        </div>

        <button type="submit">Book Court</button>
      </form>

      {bookedSlots.length > 0 && (
        <div>
          <h4>Booked Slots for {bookingDetails.date}:</h4>
          <ul>
            {bookedSlots.map((b, idx) => (
              <li key={idx}>{b.StartTime} - {b.EndTime}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConfirmBooking;
