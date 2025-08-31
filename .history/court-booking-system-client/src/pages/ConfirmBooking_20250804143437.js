import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import bookingService from "../services/domain-services/BookingService";
import "../styles/ConfirmBooking.css";

const ConfirmBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const court = location.state?.court;
  const userId = location.state?.userId;
  const selectedDate = location.state?.selectedDate;
  const selectedTime = location.state?.selectedTime;
  const selectedDuration = location.state?.selectedDuration;

  const [price, setPrice] = useState(0);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (court && selectedDuration) {
      const totalPrice = court.Price * parseInt(selectedDuration);
      setPrice(totalPrice);
    }
  }, [court, selectedDuration]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitDisabled(true);
    setIsProcessing(true);

    try {
      const newBooking = {
        CourtId: court.Id,
        UserId: userId,
        Date: selectedDate,
        Time: selectedTime,
        Duration: selectedDuration,
        TotalPrice: price,
      };

      const response = await bookingService.createBooking(newBooking);

      if (response?.bookingId) {
        navigate("/payment", {
          state: {
            bookingId: response.bookingId,
            totalPrice: price,
            court,
            selectedDate,
            selectedTime,
            selectedDuration,
          },
        });
      } else {
        alert("Failed to create booking. Please try again.");
      }
    } catch (err) {
      console.error("Booking Error:", err);
      alert("An error occurred while creating the booking.");
    } finally {
      setSubmitDisabled(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="confirm-booking-container">
      <h2>Confirm Booking</h2>
      <form onSubmit={handleBookingSubmit}>
        <div className="court-info">
          <div className="court-name">
            <strong>Court:</strong> {court?.CourtName}
          </div>
          <div className="court-location">
            <img src="/pin.png" alt="Location Pin" width="18" style={{ marginRight: "5px" }} />
            {court?.Location}
          </div>
          <div className="court-price">
            <strong>Price per hour:</strong> ${court?.Price}
          </div>
        </div>

        <div className="booking-summary">
          <p>
            <strong>Date:</strong> {selectedDate}
          </p>
          <p>
            <strong>Time:</strong> {selectedTime}
          </p>
          <p>
            <strong>Duration:</strong> {selectedDuration} hour(s)
          </p>
          <p>
            <strong>Total Price:</strong> ${price}
          </p>
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
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary w-100 mt-2"
            onClick={() => navigate("/")}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfirmBooking;
