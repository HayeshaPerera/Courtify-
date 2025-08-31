import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/CourtBooking.css";
import Footer from "../components/Footer";

// CourtBooking page component
const CourtBooking = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchSport, setSearchSport] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const response = await courtService.getAllCourts();
        if (response.success) {
          setCourts(response.success);
        } else {
          setError("Failed to fetch courts.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching courts.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, []);

  const handleView = (court) => {
    navigate("/viewcourt", { state: { court } });
  };

  const handleBookNow = (court) => {
    navigate("/confirmbooking", { state: { court } });
  };

    const filteredCourts = courts.filter(
      (court) =>
        (court.Name?.toLowerCase() || "").includes(searchName.toLowerCase()) &&
        (court.Type?.toLowerCase() || "").includes(searchSport.toLowerCase())
    );


  return (
    <>
      <h1 className="court-booking-title">BOOK A COURT</h1>
      <p className="court-booking-caption">
        Choose your preferred court and book instantly
      </p>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by court name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Search by sport type"
          value={searchSport}
          onChange={(e) => setSearchSport(e.target.value)}
          className="search-input"
        />
      </div>

      {loading && <p>Loading courts...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && filteredCourts.length === 0 && (
        <p>No courts match your search.</p>
      )}

      {!loading && filteredCourts.length > 0 && (
        <div className="court-grid">
          {filteredCourts.map((court) => (
            <div key={court.Id} className="court-card">
              <div className="court-card-image" style={{ marginTop: "30px" }}>
                <img
                  src={`/${court.Image}`}
                  alt={court.Name}
                  className="court-card-imag"
                  style={{
                    width: "330px",
                    height: "330px",
                    objectFit: "cover",
                    borderRadius: "2px",
                    background: "#eaeaea",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                />
              </div>
              <div className="court-card-title">{court.Name}</div>
              <div className="court-card-details">
                <strong>Location:</strong> {court.Location} <br />
                <strong>Sport:</strong> {court.Type} <br />
                <strong>Price Per Hour:</strong> ${court.PricePerHour}
              </div>
              <div className="court-card-actions">
                <button
                  className="btn-primary btn-sm"
                  onClick={() => handleView(court)}
                >
                  <span className="view-text">View</span>
                </button>
                <button
                  className="book-btn-success"
                  onClick={() => handleBookNow(court)}
                >
                  <span className="book-text">Book Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </>
  );
};

export default CourtBooking;
