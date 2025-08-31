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
      <h1> If you use Crypto Payment & NFT Workflow please prefer this.</h1>
      <p className="intro">
        Courtify integrates XRPL's NFT Sell Offer mechanism to enable secure, transparent,
        and verifiable court bookings via cryptocurrency.
      </p>

      <Section title="🏦 How It Works">
        <Section title="🔹 1. Court Owner Creates NFT (Court Slot)">
          <ul>
            <li>Minted when a court owner adds availability.</li>
            <li>Stored on XRPL as a unique NFT representing a slot.</li>
            <li>Metadata includes:
              <ul>
                <li>Court ID</li>
                <li>Date & Time</li>
                <li>Sport Type</li>
                <li>Pricing</li>
                <li>Court Name & Location</li>
              </ul>
            </li>
          </ul>
        </Section>

        <Section title="🔹 2. Court Owner Creates a Sell Offer">
          <ul>
            <li>Sell offer created with Token ID of the NFT.</li>
            <li>Price set in XRP or selected crypto.</li>
            <li>Offer can be public or targeted to a specific wallet.</li>
            <li>Visible and verifiable on the XRPL ledger.</li>
          </ul>
        </Section>

        <Section title="🔹 3. User Accepts Sell Offer (Crypto Payment Booking)">
          <ul>
            <li>User uses Sell Offer ID to complete payment.</li>
            <li>NFT ownership transfers to user.</li>
            <li>Booking becomes tamper-proof and is shown on user dashboard.</li>
          </ul>
        </Section>

        <Section title="🔹 4. NFT Burn by Court Owner (Optional)">
          <ul>
            <li>Used in cases like maintenance or cancellations.</li>
            <li>Owner calls burn function with Token ID.</li>
            <li>Booking is invalidated and removed from ledger.</li>
          </ul>
        </Section>

        <Section title="🔹 5. Refund and Notification Logic">
          <ul>
            <li>System notifies user of cancellation.</li>
            <li>Refund triggered if eligible.</li>
            <li>Admin logs reason (e.g., "court unavailable due to rain").</li>
          </ul>
        </Section>
      </Section>

      <Section title="🔐 Security and Transparency">
        <ul>
          <li>All actions happen directly on XRPL ledger.</li>
          <li>Immutable, transparent, and verifiable NFT records.</li>
          <li>HotPocket smart contracts manage business logic & storage.</li>
        </ul>
      </Section>
    </div>
  );
};

export default MoreInfo;