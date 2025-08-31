import React, { useState } from "react";
import { useSelector } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";

const ProfileInfo = () => {
  const { provider } = useSelector((state) => state.auth);
  const userDetails = useSelector((state) => state.user.userDetails);

  const [nftTokenId, setNftTokenId] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [offerId, setOfferId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [burnNotification, setBurnNotification] = useState(null);
  const [buyNotification, setBuyNotification] = useState(null);

  const handleCreateSellOffer = async () => {
    if (!nftTokenId) {
      alert("Please enter a valid NFT Token ID.");
      return;
    }
    try {
      setLoading(true);
      const xrpl = new XrplService(provider);
      await xrpl.createSellOffer(nftTokenId, 1.0, "Court booking sell offer");
      setMessage("Sell offer created successfully!");
      setNftTokenId("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to create sell offer.");
    } finally {
      setLoading(false);
    }
  };

  const handleBurnNFT = async () => {
    setBurnNotification(null);
    if (!tokenId) {
      setBurnNotification({ type: "error", message: "Please enter a valid Token ID" });
      return;
    }
    try {
      const rpc = new XrplService(provider);
      await rpc.burnNFT(tokenId);
      setBurnNotification({ type: "success", message: "NFT burned successfully" });
      setTokenId("");
    } catch (error) {
      console.error("Error burning NFT:", error);
      setBurnNotification({ type: "error", message: "Failed to burn NFT" });
    }
  };

  const handleBuySellOffer = async () => {
    setBuyNotification(null);
    if (!offerId) {
      setBuyNotification({ type: "error", message: "Please enter a valid Offer ID" });
      return;
    }
    try {
      const rpc = new XrplService(provider);
      await rpc.acceptSellOffer(offerId);
      setBuyNotification({ type: "success", message: "Sell offer accepted successfully" });
      setOfferId("");
    } catch (error) {
      console.error("Error buying offer:", error);
      setBuyNotification({ type: "error", message: "Failed to buy sell offer" });
    }
  };

  if (!userDetails) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 18,
        color: "#555",
      }}>
        No user details found.
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "rgba(14, 99, 4, 0.1)",
      padding: 40,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 20,
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.1)",
        maxWidth: 900,
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        overflow: "hidden",
      }}>
        <div style={{
          backgroundColor: "rgba(14, 99, 4, 0.15)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
        }}>
          <img
            src={userDetails.imageUrl || "/default-user.png"}
            alt="Profile"
            style={{ borderRadius: "50%", width: 140, height: 140, objectFit: "cover" }}
          />
        </div>

        <div style={{ padding: "40px 60px", color: "#0e6304" }}>

          <section style={{ marginBottom: 40, borderBottom: "2px solid rgba(14, 99, 4, 0.3)", paddingBottom: 20 }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: 18, fontWeight: "600" }}>Profile Information</h2>
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
            <h3 style={{ fontSize: "1.3rem", marginBottom: 20, fontWeight: "600", borderBottom: "2px solid rgba(14, 99, 4, 0.3)", paddingBottom: 10 }}>
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


          {/* Burn NFT */}
          <section style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: 12 }}>Burn NFT</h3>
            <input
              type="text"
              placeholder="Enter Token ID to Burn"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: "1px solid #ccc", width: "100%", marginBottom: 10 }}
            />
            <button
              onClick={handleBurnNFT}
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
              Burn NFT
            </button>
            {burnNotification && (
              <p style={{ color: burnNotification.type === "success" ? "green" : "red", marginTop: 10 }}>
                {burnNotification.message}
              </p>
            )}
          </section>

          {/* Buy Offer */}
          <section style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: 12 }}>Buy Sell Offer</h3>
            <input
              type="text"
              placeholder="Enter Offer ID"
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: "1px solid #ccc", width: "100%", marginBottom: 10 }}
            />
            <button
              onClick={handleBuySellOffer}
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
              Buy Offer
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
