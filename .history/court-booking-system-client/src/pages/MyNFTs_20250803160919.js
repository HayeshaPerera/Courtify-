import React, { useEffect, useState } from "react";
import "../styles/MyNFTs.css";
import mintedNFTs from "../services/initdb"; // ✅ Adjust the path as necessary

const MyNFTsPage = () => {
  const [allNFTs, setAllNFTs] = useState([]);
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  const [courtIdFilter, setCourtIdFilter] = useState("");
  const [tokenIdSearch, setTokenIdSearch] = useState("");
  const [showLatestFirst, setShowLatestFirst] = useState(true);

  useEffect(() => {
    setAllNFTs(mintedNFTs); // ✅ Fetch from initdb instead of localStorage
  }, []);

  useEffect(() => {
    applyFilters();
  }, [courtIdFilter, tokenIdSearch, allNFTs, showLatestFirst]);

  const applyFilters = () => {
    let result = [...allNFTs];

    if (showLatestFirst) {
      result.reverse();
    }

    if (courtIdFilter) {
      result = result.filter((nft) =>
        nft.courtId.toLowerCase().includes(courtIdFilter.toLowerCase())
      );
    }

    if (tokenIdSearch) {
      result = result.filter((nft) =>
        nft.tokenId.toLowerCase().includes(tokenIdSearch.toLowerCase())
      );
    }

    setFilteredNFTs(result);
  };

  const copyTokenIdToClipboard = (tokenId) => {
    navigator.clipboard.writeText(tokenId);
    alert("Token ID copied to clipboard!");
  };

  const clearHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear your NFT minting history? This action cannot be undone."
      )
    ) {
      setAllNFTs([]); // Clear current state
      setFilteredNFTs([]);
      setCourtIdFilter("");
      setTokenIdSearch("");
    }
  };

  return (
    <div className="nfts-container">
      <h2>My Minted NFTs</h2>

      {/* Filters */}
      <div className="filters">
        <label>
          Court ID:
          <input
            type="text"
            value={courtIdFilter}
            onChange={(e) => setCourtIdFilter(e.target.value)}
            placeholder="Enter court ID"
          />
        </label>

        <label>
          Token ID:
          <input
            type="text"
            value={tokenIdSearch}
            onChange={(e) => setTokenIdSearch(e.target.value)}
            placeholder="Search token ID"
          />
        </label>

        <label>
          Show:
          <select
            value={showLatestFirst ? "latest" : "oldest"}
            onChange={(e) => setShowLatestFirst(e.target.value === "latest")}
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </label>

        <button className="clear-btn" onClick={clearHistory}>
          Clear History
        </button>
      </div>

      {filteredNFTs.length === 0 ? (
        <p className="no-nfts">No NFTs match the filters.</p>
      ) : (
        <table className="nft-table">
          <thead>
            <tr>
              <th>Court ID</th>
              <th>Token ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNFTs.map(({ courtId, tokenId }, idx) => (
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
      )}
    </div>
  );
};

export default MyNFTsPage;
