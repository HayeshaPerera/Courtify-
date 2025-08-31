<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Crypto & NFT Booking Info</title>
  <style>
    body {
      font-family: "Segoe UI", sans-serif;
      background-color: #f8f9fb;
      margin: 0;
      padding: 2rem;
      line-height: 1.6;
      color: #333;
    }

    .container {
      max-width: 1000px;
      margin: auto;
      background: #fff;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    h1 {
      text-align: center;
      font-size: 2rem;
      color: #111;
      margin-bottom: 1rem;
    }

    .section {
      margin-bottom: 2.5rem;
    }

    .section h2 {
      font-size: 1.4rem;
      color: #1e3a8a;
      margin-bottom: 0.5rem;
      border-left: 4px solid #3b82f6;
      padding-left: 0.5rem;
    }

    .section p,
    .section ul {
      padding-left: 1rem;
    }

    ul {
      list-style: disc;
    }

    .highlight {
      background-color: #ecfdf5;
      border-left: 4px solid #10b981;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 8px;
      font-weight: 500;
    }

    .ledger-tag {
      display: inline-block;
      background: #dbeafe;
      color: #1e40af;
      font-size: 0.85rem;
      padding: 0.3rem 0.6rem;
      border-radius: 8px;
      margin-right: 0.5rem;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>💸 Crypto Payment & NFT Workflow</h1>

    <div class="section">
      <h2>🏦 How It Works</h2>
      <p>Courtify uses XRPL NFTs and Smart Contracts to securely manage court slot bookings.</p>
    </div>

    <div class="section">
      <h2>🔹 1. Court Owner Creates NFT (Court Slot)</h2>
      <p>When adding availability, a court owner mints an NFT on XRPL representing a time slot.</p>
      <ul>
        <li><strong>Court ID</strong></li>
        <li><strong>Date and Time</strong></li>
        <li><strong>Sport Type</strong></li>
        <li><strong>Pricing</strong></li>
        <li><strong>Court Name & Location</strong></li>
      </ul>
      <div class="highlight">This NFT acts as proof of availability and right to book.</div>
    </div>

    <div class="section">
      <h2>🔹 2. Court Owner Creates a Sell Offer</h2>
      <p>After minting, the court owner creates a sell offer on XRPL using:</p>
      <ul>
        <li>Token ID (NFT ID)</li>
        <li>Price in XRP</li>
        <li>Targeted wallet (optional)</li>
      </ul>
      <p>The offer becomes visible on the ledger for users to purchase.</p>
    </div>

    <div class="section">
      <h2>🔹 3. User Accepts Sell Offer</h2>
      <p>Users use the offer ID to complete the crypto payment. Once confirmed:</p>
      <div class="highlight">The NFT ownership is transferred to the user — acting as booking proof.</div>
      <p>Displayed in their dashboard, usable during check-in.</p>
    </div>

    <div class="section">
      <h2>🔹 4. NFT Burn by Court Owner</h2>
      <p>If the slot needs to be invalidated (weather, maintenance, double-booked):</p>
      <ul>
        <li>Owner calls burn function with Token ID</li>
        <li>Booking is removed from circulation</li>
      </ul>
      <div class="highlight">Burning signals the slot is no longer valid.</div>
    </div>

    <div class="section">
      <h2>🔹 5. Refund & Notification</h2>
      <p>Post-burn, the system:</p>
      <ul>
        <li>Notifies affected user</li>
        <li>Initiates refund (if eligible)</li>
        <li>Logs reason for admin</li>
      </ul>
    </div>

    <div class="section">
      <h2>🔐 Security & Transparency</h2>
      <p>
        All actions — minting, offering, burning — happen on XRPL.
        Every booking is:
      </p>
      <ul>
        <li>Verifiable</li>
        <li>Tamper-proof</li>
        <li>Stored with metadata</li>
      </ul>
      <p><span class="ledger-tag">XRPL</span> <span class="ledger-tag">NFT</span> <span class="ledger-tag">SellOffer</span> <span class="ledger-tag">Smart Contracts</span></p>
    </div>
  </div>
</body>
</html>
