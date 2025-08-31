import React, { useEffect, useState } from "react";
import "../styles/MyNFTs.css";

const MyNFTsPage = () => {
  const [mintedNFTs, setMintedNFTs] = useState([]);

  useEffect(() => {
    const savedNFTs = JSON.parse(localStorage.getItem("mintedNFTs") || "[]");
    setMintedNFTs(savedNFTs);
  }, []);

  const copyTokenIdToClipboard = (tokenId) => {
    navigator.clipboard.writeText(tokenId);
    alert("Token ID copied to clipboard!");
  };

  if (mintedNFTs.length === 0) {
    return <p className="no-nfts">No minted NFTs found.</p>;
  }

  return (
    <div className="nfts-container">
      <h2>My Minted NFTs</h2>
      <table className="nft-table">
        <thead>
          <tr>
            <th>Court ID</th>
            <th>Token ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mintedNFTs.map(({ courtId, tokenId }, idx) => (
            <tr key={idx}>
              <td>{courtId}</td>
              <td>{tokenId}</td>
              <td>
                <button
                  className="copy-btn"
                  onClick={() => copyTokenIdToClipboard(tokenId)}
                >
                  Copy Token ID
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyNFTsPage;
