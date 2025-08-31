import React, { useState } from "react";
import "../styles/MoreInfo.css";

const Section = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="info-section">
      <div className="info-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>{title}</h3>
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && <div className="info-content">{children}</div>}
    </div>
  );
};

const MoreInfo = () => {
  return (
    <div className="more-info-container">
      <h1>Experience Seamless Court Booking with Crypto Payments</h1>
      <p className="intro">
        Courtify enables direct, secure, and verifiable bookings using cryptocurrency through the XRPL ledger.
      </p>

      <Section title="💳 Booking with Crypto">
        <ul>
          <li>Users can browse available court slots represented by NFTs.</li>
          <li>Each slot has fixed metadata like date, time, location, and price in XRP.</li>
          <li>Users make payments directly using crypto (XRP or compatible token).</li>
          <li>On successful payment, the NFT is transferred to the user’s wallet.</li>
          <li>This acts as proof of booking and can be viewed on the dashboard.</li>
        </ul>
      </Section>

      <Section title="🔁 Cancellations & Refunds">
        <ul>
          <li>If a booking is canceled, users are notified instantly.</li>
          <li>Eligible users are refunded in the same crypto.</li>
          <li>All booking statuses are updated on-chain for transparency.</li>
        </ul>
      </Section>

      <Section title="🔐 Security and Transparency">
        <ul>
          <li>Payments and bookings are recorded on the XRPL ledger.</li>
          <li>Each transaction is immutable and publicly verifiable.</li>
          <li>No centralized authority can alter the booking data.</li>
        </ul>
      </Section>
    </div>
  );
};

export default MoreInfo;
