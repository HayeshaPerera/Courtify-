import React, { useState } from "react";
import { useSelector } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";

// Popup Toast Component
const ToastPopup = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div className={`toast-popup ${type}`}>
      {message}
      <button onClick={onClose}>&times;</button>
    </div>
  );
};

const ProfileInfo = () => {
  const { provider } = useSelector((state) => state.auth);
  const userDetails = useSelector((state) => state.user.userDetails);

  const [tokenId, setTokenId] = useState("");
  const [sellOfferTokenId, setSellOfferTokenId] = useState("");

  const [burnNotification, setBurnNotification] = useState(null);
  const [sellNotification, setSellNotification] = useState(null);

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
      setTimeout(() => setBurnNotification(null), 3000);
      setTokenId("");
    } catch (error) {
      console.error("Error burning NFT:", error);
      setBurnNotification({ type: "error", message: "Failed to burn NFT" });
    }
  };

  const handleCreateSellOffer = async () => {
    setSellNotification(null);
    if (!sellOfferTokenId) {
      setSellNotification({ type: "error", message: "Please enter a valid Token ID" });
      return;
    }

    try {
      const rpc = new XrplService(provider);
      await rpc.createSellOffer(sellOfferTokenId);
      setSellNotification({ type: "success", message: "Sell offer created successfully" });
      setTimeout(() => setSellNotification(null), 3000);
      setSellOfferTokenId("");
    } catch (error) {
      console.error("Error creating sell offer:", error);
      setSellNotification({ type: "error", message: "Failed to create sell offer" });
    }
  };

  if (!userDetails) {
    return <div className="alert alert-warning">No user details found.</div>;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-4">Profile Information</h2>

          <div className="mb-3">
            <p><strong>Name:</strong> {userDetails.Name}</p>
            <p><strong>Email:</strong> {userDetails.Email}</p>
            <p><strong>Role:</strong> {userDetails.UserRole}</p>
            <p><strong>Description:</strong> {userDetails.Description}</p>
            <p><strong>XRPL Address:</strong> {userDetails.XrplAddress}</p>
          </div>

          <hr />
          <h3 className="mb-3">Dev Tools</h3>

          {/* Burn NFT section */}
          <div className="mb-4">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Enter Token ID to Burn"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
            <button className="btn btn-danger" onClick={handleBurnNFT}>
              Burn NFT
            </button>
          </div>

          {/* Create Sell Offer section */}
          <div className="mb-4">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Enter Token ID to Create Sell Offer"
              value={sellOfferTokenId}
              onChange={(e) => setSellOfferTokenId(e.target.value)}
            />
            <button className="btn btn-success" onClick={handleCreateSellOffer}>
              Create Sell Offer
            </button>
          </div>

          {/* Faucet link */}
          <div className="mb-3">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://test.xrplexplorer.com/en/faucet?address=${userDetails.XrplAddress}`}
              className="btn btn-primary"
            >
              Fund Account
            </a>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <ToastPopup
        message={burnNotification?.message || sellNotification?.message}
        type={burnNotification?.type || sellNotification?.type}
        onClose={() => {
          setBurnNotification(null);
          setSellNotification(null);
        }}
      />
    </div>
  );
};

export default ProfileInfo;
