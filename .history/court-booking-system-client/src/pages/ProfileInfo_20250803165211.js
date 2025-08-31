import React, { useState } from "react";
import { useSelector } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";

const ProfileInfo = () => {
  const userDetails = useSelector((state) => state.user.userDetails);
  const provider = useSelector((state) => state.auth.provider);

  const [nftTokenId, setNftTokenId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreateSellOffer = async () => {
    if (!nftTokenId) {
      alert("Please enter a valid NFT Token ID.");
      return;
    }
    try {
      setLoading(true);
      const xrpl = new XrplService(provider);
      const response = await xrpl.createSellOffer(nftTokenId, 1.0, "Court booking sell offer");
      console.log("Sell offer response:", response);
      setMessage("Sell offer created successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to create sell offer.");
    } finally {
      setLoading(false);
      setNftTokenId("");
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
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
        <div
          style={{
            backgroundColor: "rgba(14, 99, 4, 0.15)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          {/* Use profile picture if available, otherwise fallback */}
          <img
            src={userDetails.imageUrl || "/default-user.png"}
            alt="Profile"
            style={{ borderRadius: "50%", width: 140, height: 140, objectFit: "cover" }}
          />
        </div>

        <div style={{ padding: "40px 60px", color: "#0e6304" }}>
          <h1 style={{ marginBottom: 24, fontWeight: "700", fontSize: "2.8rem" }}>
            My Profile
          </h1>

          <section style={{ marginBottom: 40, borderBottom: "2px solid rgba(14, 99, 4, 0.3)", paddingBottom: 20 }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: 18, fontWeight: "600" }}>Profile Information</h2>
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

          <section>
            <h3 style={{ fontSize: "1.6rem", marginBottom: 20, fontWeight: "600", borderBottom: "2px solid rgba(14, 99, 4, 0.3)", paddingBottom: 10 }}>
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

          <section style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: "1.6rem", marginBottom: 20, fontWeight: "600", borderBottom: "2px solid rgba(14, 99, 4, 0.3)", paddingBottom: 10 }}>
              Create Sell Offer
            </h3>

            <input
              type="text"
              placeholder="Enter NFT Token ID"
              value={nftTokenId}
              onChange={(e) => setNftTokenId(e.target.value)}
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: "1px solid #ccc", marginBottom: 10, width: "100%" }}
            />

            <button
              onClick={handleCreateSellOffer}
              disabled={!nftTokenId || loading}
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
              {loading ? "Creating..." : "Create Sell Offer"}
            </button>

            {message && <p style={{ marginTop: 12 }}>{message}</p>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;