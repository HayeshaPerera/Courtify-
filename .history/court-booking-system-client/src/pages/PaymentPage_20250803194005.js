import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import courtService from "../services/domain-services/CourtService";

const PaymentPage = () => {
  const navigate = useNavigate();
  const userEmail = useSelector((state) => state.auth.userInfo?.email);

  const [booking, setBooking] = useState(null);
  const [court, setCourt] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLatestBooking = async () => {
      try {
        if (!userEmail) return;

        const bookings = await courtService.getUserBookings(userEmail);

        if (!bookings || bookings.length === 0) return;

        const latest = bookings[0];
        setBooking(latest);

        const courtData = await courtService.getCourtById(latest.CourtId);
        setCourt(courtData);

        let total = 0;
        try {
          total = calculateTotalAmount(latest.StartTime, latest.EndTime, courtData.PricePerHour);
          if (!total || total <= 0) throw new Error("Invalid total");
        } catch (calcErr) {
          console.warn("Failed to calculate total, using dummy value:", calcErr);
          total = 10;
        }

        setTotalAmount(total);
      } catch (err) {
        console.error("Error loading booking/payment info:", err);
        setTotalAmount(100);
      } finally {
        setLoading(false);
      }
    };

    loadLatestBooking();
  }, [userEmail]);

  const calculateTotalAmount = (start, end, pricePerHour) => {
    const to24 = (timeStr) => {
      if (!timeStr) throw new Error("Invalid time string");
      const [time, period] = timeStr.split(" ");
      if (!time || !period) throw new Error("Malformed time string");
      let [hour, minute] = time.split(":").map(Number);
      if (isNaN(hour) || isNaN(minute)) throw new Error("Invalid hour or minute");
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      return hour + minute / 60;
    };

    const startHour = to24(start);
    const endHour = to24(end);
    const duration = Math.max(0, endHour - startHour);

    if (duration === 0) throw new Error("Duration cannot be zero");

    if (!pricePerHour || pricePerHour <= 0) throw new Error("Invalid price per hour");

    return Math.round(duration * pricePerHour);
  };

  const handleVisaMaster = () => {
    navigate("/payment/stripe", { state: { booking, totalAmount } });
  };

  const handleCrypto = () => {
    navigate("/payment/crypto", { state: { booking, totalAmount } });
  };

  return (
    <div>
      <style>{`
        .payment-container {
          max-width: 480px;
          margin: 60px auto;
          padding: 40px;
          border-radius: 16px;
          background-color: #ffffff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          font-family: 'Roboto', sans-serif;
        }
        h2 {
          font-size: 22px;
          margin-bottom: 16px;
          font-weight: 700;
          color: #0e6304;
        }
        h3 {
          font-size: 16px;
          margin-bottom: 12px;
          font-weight: 700;
          color: #0e6304;
        }
        .booking-summary {
          background-color: #e6f9e6;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          font-size: 16px;
          color: #1a1a1a;
        }
        .booking-summary p {
          margin: 8px 0;
        }
        .payment-methods {
          text-align: center;
        }
        .payment-images {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-top: 20px;
        }
        .payment-images img {
          width: 90px;
          height: auto;
          cursor: pointer;
          border-radius: 12px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .payment-images img:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(14, 99, 4, 0.25);
        }
        p.loading-text {
          font-size: 16px;
          color: #555;
          text-align: center;
          margin-top: 20px;
        }
        p.no-bookings {
          font-size: 16px;
          color: #999;
          text-align: center;
          margin-top: 20px;
        }
      `}</style>

      <div className="payment-container">
        <h2>Confirm Your Payment</h2>

        {loading && <p className="loading-text">Loading latest booking...</p>}

        {!loading && booking && court && (
          <>
            <div className="booking-summary">
              <p><strong>Court:</strong> {court.Name}</p>
              <p><strong>Date:</strong> {booking.Date}</p>
              <p><strong>Time:</strong> {booking.StartTime} - {booking.EndTime}</p>
              <p><strong>Price per Hour:</strong> ${court.PricePerHour}</p>
              <p><strong>Total Amount:</strong> ${totalAmount}</p>
            </div>

            <div className="payment-methods">
              <h3>Select Payment Method</h3>
              <div className="payment-images">
                <img src="/visamaster.png" alt="Visa/Master" onClick={handleVisaMaster} />
                <img src="/bitcoin.png" alt="Bitcoin" onClick={handleCrypto} />
              </div>
            </div>
          </>
        )}

        {!loading && !booking && <p className="no-bookings">No bookings found.</p>}
      </div>
    </div>
  );
};

export default PaymentPage;