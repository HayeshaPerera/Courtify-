import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import courtService from "../services/domain-services/CourtService";
import "../styles/HomePage.css";
import "../styles/CourtBooking.css";


const CourtHome = () => {
  const navigate = useNavigate();

  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="home">
      <header className="header" style={{ backgroundImage: "url('/image 1.jpg')" }}>
        <div className="header-content-wrapper">
          <div className="header-content">
            <div className="header-text">
              <h1 className="animated-text">
                <span>Find</span> | <span>Book</span> <span>and</span> <span>Play</span>
                <span> Anytime,</span> <span>Anywhere</span>
              </h1>
              <button className="get-started-btn" onClick={() => navigate("/booking")}>Get Started</button>
              <button className="more-info-btn" onClick={() => navigate("/moreinfo")}>
                Learn More
              </button>

            </div>
          </div>
        </div>
      </header>

      <section className="welcome-section flex flex-col md:flex-row items-center justify-center gap-8 p-8 bg-gray-50">
        <div className="relative w-full md:w-1/2 flex justify-center">
          <div className="relative flex">
            <img src="/image 3.jpg" alt="Background" className="image3" />
            <div className="image2-wrapper absolute top-0 left-0">
              <img src="/image2.jpg" alt="Foreground" className="image2" />
            </div>
          </div>
        </div>

        <div className="welcome-text-box">
          <p className="text-black">
            <span className="text-green-600">WELCOME TO COURTIFY</span>
          </p>
          <p className="text-black1 font-semibold italic text-xl mt-2">
            COURTS AT YOUR <span className="text-green-600">FINGERTIPS</span>
          </p>
          <p className="text-black2 font-semibold italic text-xl mt-4">
            At <span className="text-green-600">COURTIFY</span>, we’re rewriting the rules of sports court bookings.
            Say goodbye to the hassle – with just a few clicks, you can find, book, and play. From real-time availability
            to secure NFT confirmations, we’re here to turn your game-time dreams into reality. Let’s make every play
            unforgettable!
          </p>
          <button className="about-us-btn mt-6" onClick={() => navigate("/about-us")}>
            ABOUT US
          </button>
        </div>
      </section>

      {/* --- COURTS GRID SECTION --- */}
      <section className="userhome-courts-section" style={{ padding: "2rem 0" }}>
        <h2 className="court-booking-title">COURTS FOR YOU</h2>
        <p className="court-booking-caption">
          Choose your preferred court and book instantly
        </p>
        {loading && <p>Loading courts...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && courts.length === 0 && <p>No courts available for booking.</p>}

        {!loading && courts.length > 0 && (
          <div className="court-grid">
            {courts.slice(0, 6).map((court) => (
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
                      transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                  />
                </div>
                <div className="court-card-title">{court.Name}</div>
                <div className="court-card-details">
                  <div className="court-location">
                    <img
                      src="/pin.png"
                      alt="Location Pin"
                      style={{ width: "16px", marginRight: "5px" }}
                    />
                    {court.Location}
                  </div>
                  <div className="court-type">  
                    <img src="/ball.png"  alt="sport"
                    style={{ width: "16px", marginRight: "5px" }}   /> 
                    {court.Type} <br />
                  </div>
                  <div className="court-price">
                    <img src="/money-back.png"  alt="sport"
                    style={{ width: "16px", marginRight: "5px" }}  /> 
                    LKR {court.PricePerHour}
                  </div>
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

        {/* Optional: View All Courts Button */}
        {!loading && courts.length > 6 && (
          <div className="flex justify-center mt-6">
            <button
              className="about-us-btn"
              onClick={() => navigate("/courts")}
            >
              VIEW ALL COURTS
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default CourtHome;
