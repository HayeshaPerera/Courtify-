import React, { useState } from "react";
import { useSelector } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";

const ProfileInfo = () => {
  const provider = useSelector((state) => state.auth.provider);
  const userDetails = useSelector((state) => state.user.userDetails);

  // Sell Offer
  const [nftTokenId, setNftTokenId] = useState("");
  const [sellLoading, setSellLoading] = useState(false);
  const [sellMessage, setSellMessage] = useState("");

  // Burn NFT
  const [tokenId, setTokenId] = useState("");
  const [burnLoading, setBurnLoading] = useState(false);
  const [burnNotification, setBurnNotification] = useState(null);

  // Buy Offer
  const [offerId, setOfferId] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyNotification, setBuyNotification] = useState(null);

  const handleCreateSellOffer = async () => {
    setSellMessage("");
    if (!nftTokenId) {
      alert("Please enter a valid NFT Token ID.");
      return;
    }
    try {
      setSellLoading(true);
      const xrpl = new XrplService(provider);
      await xrpl.createSellOffer(nftTokenId, 1.0, "Court booking sell offer");
      setSellMessage("Sell offer created successfully!");
      setNftTokenId("");
    } catch (err) {
      setSellMessage("Failed to create sell offer.");
    } finally {
      setSellLoading(false);
    }
  };

  const handleBurnNFT = async () => {
    setBurnNotification(null);
    if (!tokenId) {
      setBurnNotification({ type: "error", message: "Please enter a valid Token ID" });
      return;
    }
    try {
      setBurnLoading(true);
      const rpc = new XrplService(provider);
      await rpc.burnNFT(tokenId);
      setBurnNotification({ type: "success", message: "NFT burned successfully" });
      setTokenId("");
    } catch (error) {
      setBurnNotification({ type: "error", message: "Failed to burn NFT" });
    } finally {
      setBurnLoading(false);
    }
  };

  const handleBuySellOffer = async () => {
    setBuyNotification(null);
    if (!offerId) {
      setBuyNotification({ type: "error", message: "Please enter a valid Offer ID" });
      return;
    }
    try {
      setBuyLoading(true);
      const rpc = new XrplService(provider);
      await rpc.acceptSellOffer(offerId);
      setBuyNotification({ type: "success", message: "Sell offer accepted successfully" });
      setOfferId("");
    } catch (error) {
      setBuyNotification({ type: "error", message: "Failed to buy sell offer" });
    } finally {
      setBuyLoading(false);
    }
  };

  if (!userDetails) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 18,
          color: "#555",
        }}
      >
        No user details found.
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "rgba(14, 99, 4, 0.1)",
        padding: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 20,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.1)",
          maxWidth: 900,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          overflow: "hidden",
        }}
      >
        {/* Left panel: profile picture */}
        <div
          style={{
            backgroundColor: "rgba(14, 99, 4, 0.15)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          <img
            src={userDetails.imageUrl || "/default-user.png"}
            alt="Profile"
            style={{ borderRadius: "50%", width: 140, height: 140, objectFit: "cover" }}
          />
        </div>

        {/* Right panel: profile details and actions */}
        <div style={{ padding: "40px 60px", color: "#0e6304" }}>
          <section
            style={{
              marginBottom: 40,
              borderBottom: "2px solid rgba(14, 99, 4, 0.3)",
              paddingBottom: 20,
            }}
          >
            <h2 style={{ fontSize: "1.4rem", marginBottom: 18, fontWeight: "600" }}>
              Profile Information
            </h2>
            <dl style={{ fontSize: 18, lineHeight: 1.6 }}>
              <dt style={{ fontWeight: "700" }}>Name:</dt>
              <dd style={{ marginBottom: 12 }}>{userDetails.Name}</dd>
              <dt style={{ fontWeight: "700" }}>Email:</dt>
              <dd style={{ marginBottom: 12 }}>{userDetails.Email}</dd>
              <dt style={{ fontWeight: "700" }}>Role:</dt>
              <dd style={{ marginBottom: 12 }}>{userDetails.UserRole}</dd>
              <dt style={{ fontWeight: "700" }}>XRPL Address:</dt>
              <dd>{userDetails.XrplAddress}</dd>
            </dl>
          </section>

          {/* Fund XRPL */}
          <section>
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: 20,
                fontWeight: "600",
                borderBottom: "2px solid rgba(14, 99, 4, 0.3)",
                paddingBottom: 10,
              }}
            >
              Fund Your XRPL Account
            </h3>
            <a
              href={`https://test.xrplexplorer.com/en/faucet?address=${userDetails.XrplAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                backgroundColor: "#850c0cff",
                color: "#fff",
                padding: "14px 32px",
                borderRadius: 12,
                fontWeight: "600",
                fontSize: 18,
                textDecoration: "none",
                marginBottom: 20,
              }}
            >
              Fund Account
            </a>
          </section>

          {/* Create Sell Offer */}
          <section style={{ marginTop: 30 }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              Create Sell Offer
            </h3>
            <input
              type="text"
              placeholder="Enter NFT Token ID"
              value={nftTokenId}
              onChange={(e) => setNftTokenId(e.target.value)}
              style={{
                padding: 10,
                fontSize: 16,
                borderRadius: 8,
                border: "1px solid #ccc",
                width: "100%",
                marginBottom: 10,
              }}
            />
            <button
              onClick={handleCreateSellOffer}
              disabled={!nftTokenId || sellLoading}
              style={{
                backgroundColor: "#143da2ff",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: 8,
                fontWeight: "600",
                fontSize: 16,
                border: "none",
                cursor: "pointer",
              }}
            >
              {sellLoading ? "Creating..." : "Create Sell Offer"}
            </button>
            {sellMessage && (
              <p style={{ marginTop: 10, fontSize: 14, color: sellMessage.includes("success") ? "green" : "red" }}>
                {sellMessage}
              </p>
            )}
          </section>

          {/* Burn NFT */}
          <section style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: 12 }}>Burn NFT</h3>
            <input
              type="text"
              placeholder="Enter Token ID to Burn"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              style={{
                padding: 10,
                fontSize: 16,
                borderRadius: 8,
                border: "1px solid #ccc",
                width: "100%",
                marginBottom: 10,
              }}
            />
            <button
              onClick={handleBurnNFT}
              disabled={burnLoading}
              style={{
                backgroundColor: "#dc3545",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: 8,
                fontWeight: "600",
                fontSize: 16,
                border: "none",
                cursor: "pointer",
              }}
            >
              {burnLoading ? "Burning..." : "Burn NFT"}
            </button>
            {burnNotification && (
              <p style={{ color: burnNotification.type === "success" ? "green" : "red", marginTop: 10 }}>
                {burnNotification.message}
              </p>
            )}
          </section>

          {/* Buy Offer */}
          <section style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: 12 }}>Buy Sell Offer</h3>
            <input
              type="text"
              placeholder="Enter Offer ID"
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
              style={{
                padding: 10,
                fontSize: 16,
                borderRadius: 8,
                border: "1px solid #ccc",
                width: "100%",
                marginBottom: 10,
              }}
            />
            <button
              onClick={handleBuySellOffer}
              disabled={buyLoading}
              style={{
                backgroundColor: "#198754",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: 8,
                fontWeight: "600",
                fontSize: 16,
                border: "none",
                cursor: "pointer",
              }}
            >
              {buyLoading ? "Buying..." : "Buy Offer"}
            </button>
            {buyNotification && (
              <p style={{ color: buyNotification.type === "success" ? "green" : "red", marginTop: 10 }}>
                {buyNotification.message}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
export default ProfileInfo;
