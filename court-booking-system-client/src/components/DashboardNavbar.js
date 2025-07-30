import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout as authLogout } from "../store/slices/authSlice";
import { clearUserDetails } from "../store/slices/userSlice";
import "../styles/DashboardNavbar.css";

const DashboardNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userDetails = useSelector((state) => state.user.userDetails);
  const { xrpBalance } = useSelector((state) => state.wallet);
  const { web3auth } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Debugging: Log userDetails on each render
  console.log("DashboardNavbar userDetails:", userDetails);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    if (web3auth) {
      await web3auth.logout();
    }
    dispatch(authLogout());
    dispatch(clearUserDetails());
    localStorage.removeItem("userDetails");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div
          className="brand"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogoClick();
          }}
        >
          <img src="/logo.png" alt="Courtify Logo" className="logo" />
          <span className="title">Courtify</span>
        </div>

        <div className="balance-info">
          <span className="user-name">👤 {userDetails?.Name || "User"}</span>
          <span className="xrp-balance">
            💰 {(xrpBalance / 1000000).toFixed(6)} XRP
          </span>
        </div>

        <div className="nav-links">
          <Link to="/dashboard/court">Add Court</Link>
          <Link to="/dashboard/myCourts">Manage Court</Link>
          <Link to="/dashboard/myNFTs">My NFTs</Link>
          <Link to="/dashboard/booking-stats">Booking Stats</Link> {/* Added Booking Stats here */}
          <Link to="/dashboard/profile">Profile</Link>
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          <div className="profile">
            <img
              key={userDetails?.imageUrl} // Force re-render when image URL changes
              src={userDetails?.imageUrl || "/default-user.png"}
              alt="User"
              className="profile-img"
            />
            <div className="profile-name">{userDetails?.Name || "User"}</div>
            {userDetails?.bio && (
              <div className="profile-bio">
                <p>{userDetails.bio}</p>
              </div>
            )}
          </div>
          <ul>
           
            <li>
              <Link
                to="/dashboard/profile/edit"
                onClick={() => setSidebarOpen(false)}
              >
                Edit Profile
              </Link>
            </li>
            <li>
              <Link to="/dashboard/myNFTs" onClick={() => setSidebarOpen(false)}>
                My NFTs
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/booking-stats"
                onClick={() => setSidebarOpen(false)}
              >
                Booking Stats
              </Link>
            </li>
          </ul>
        </div>
        <div className="sidebar-logout">
          <button
            className="logout-btn"
            onClick={async () => {
              setSidebarOpen(false);
              await handleLogout();
            }}
            style={{
              background: "#e74c3c",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              marginTop: "10px",
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardNavbar;
