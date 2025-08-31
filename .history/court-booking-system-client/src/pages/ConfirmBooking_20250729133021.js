import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import XrplService from "../services/common-services/XrplService.ts";
import { useSelector } from "react-redux";
import "../styles/ConfirmBooking.css";

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};
  const user = useSelector((state) => state.auth.user);

  const [bookingDetails, setBookingDetails] = useState({
    sport: court?.sport || "",
    date: "",
    startHour: "",
    startMinute: "",
    startPeriod: "AM",
    endHour: "",
    endMinute: "",
    endPeriod: "AM",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatTime = (hour, minute, period) => {
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")} ${period}`;
  };

  const isSlotBooked = (startHour, startMinute, startPeriod, endHour, endMinute, endPeriod) => {
    // Just an example check for valid fields. You can customize this.
    return (
      !startHour || !startMinute || !startPeriod ||
      !endHour || !endMinute || !endPeriod
    );
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const { date, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod } = bookingDetails;

    if (!date || !startHour || !startMinute || !endHour || !endMinute) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const startTime = formatTime(startHour, startMinute, startPeriod);
    const endTime = formatTime(endHour, endMinute, endPeriod);

    const bookingData = {
      CourtId: court.id,
      CourtName: court.name,
      UserEmail: user?.email,
      UserName: user?.username,
      Date: date,
      StartTime: startTime,
      EndTime: endTime,
    };

    try {
      const response = await courtService.createBooking(bookingData);
      if (response.error) {
        setErrorMessage(response.error); // Shows "This time slot is already booked." etc.
        return;
      }

      // Proceed to XRPL or navigate to success page
      await XrplService.lockTimeslotNFT(bookingData); // Optional
      navigate("/user/mybookings", { state: { bookingData } });

    } catch (error) {
      console.error("Booking error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="confirm-booking-container">
      <h2 className="text-center mb-4">Confirm Booking</h2>
      <form onSubmit={handleBookingSubmit} className="booking-form">

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            className="form-control"
            value={bookingDetails.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Start Time</label>
          <div className="time-input-group">
            <input
              type="text"
              name="startHour"
              placeholder="HH"
              maxLength="2"
              className="form-control time-field"
              value={bookingDetails.startHour}
              onChange={handleChange}
            />
            <span>:</span>
            <input
              type="text"
              name="startMinute"
              placeholder="MM"
              maxLength="2"
              className="form-control time-field"
              value={bookingDetails.startMinute}
              onChange={handleChange}
            />
            <select
              name="startPeriod"
              className="form-control time-select"
              value={bookingDetails.startPeriod}
              onChange={handleChange}
            >
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>End Time</label>
          <div className="time-input-group">
            <input
              type="text"
              name="endHour"
              placeholder="HH"
              maxLength="2"
              className="form-control time-field"
              value={bookingDetails.endHour}
              onChange={handleChange}
            />
            <span>:</span>
            <input
              type="text"
              name="endMinute"
              placeholder="MM"
              maxLength="2"
              className="form-control time-field"
              value={bookingDetails.endMinute}
              onChange={handleChange}
            />
            <select
              name="endPeriod"
              className="form-control time-select"
              value={bookingDetails.endPeriod}
              onChange={handleChange}
            >
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </div>

        {/* Submit button and error message */}
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

          {/* Show error message below the button */}
          {errorMessage && (
            <div className="alert alert-danger mt-2 mb-0">
              {errorMessage}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ConfirmBooking;
