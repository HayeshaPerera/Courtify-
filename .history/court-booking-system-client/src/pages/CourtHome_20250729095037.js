import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "../styles/CourtHome.css";

const CourtHome = () => {
  const navigate = useNavigate();

  const buttonStyle = {
    padding: "16px 30px",
    fontSize: "1.2rem",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    color: "white",
    border: "2px solid white",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "180px",
  };

  return (
    <div className="page-wrapper">
      <div className="hero-section">
        <div className="content-container">
          <h1 className="heading">Welcome, Court Owner!</h1>
          <p className="subheading">
            Effortlessly manage your courts, bookings, and profile from your
            personalized dashboard.
          </p>

          <div className="btn-group">
            <button
              style={buttonStyle}
              className="btn"
              onClick={() => navigate("/dashboard/myCourts")}
            >
              <i className="bi bi-collection me-2"></i> Manage My Courts
            </button>

            <button
              style={buttonStyle}
              className="btn"
              onClick={() => navigate("/dashboard/court")}
            >
              <i className="bi bi-plus-circle me-2"></i> Add New Court
            </button>

            <button
              style={buttonStyle}
              className="btn"
              onClick={() => navigate("/dashboard/profile")}
            >
              <i className="bi bi-person-circle me-2"></i> My Profile
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tips Section */}
      <div className="quick-tips-container">
        <div className="quick-tip-card">
          <i className="bi bi-gear quick-tip-icon"></i>
          <div className="quick-tip-title">Manage My Courts</div>
          <div className="quick-tip-desc">
            Monitor bookings, edit court details, and manage availability
            seamlessly.
          </div>
        </div>

        <div className="quick-tip-card">
          <i className="bi bi-plus-circle quick-tip-icon"></i>
          <div className="quick-tip-title">Add New Court</div>
          <div className="quick-tip-desc">
            List new courts with complete details including pricing and
            amenities.
          </div>
        </div>

        <div className="quick-tip-card">
          <i className="bi bi-person quick-tip-icon"></i>
          <div className="quick-tip-title">My Profile</div>
          <div className="quick-tip-desc">
            Keep your contact, payment, and profile details updated for better
            trust.
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourtHome;
