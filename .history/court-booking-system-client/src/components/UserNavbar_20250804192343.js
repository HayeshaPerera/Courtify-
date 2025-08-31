import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout as authLogout } from "../store/slices/authSlice";
import { clearUserDetails } from "../store/slices/userSlice";
import "../styles/UserNavbar.css";

const UserNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  
  const userDetails = useSelector((state) => state.user.userDetails);
  const { xrpBalance } = useSelector((state) => state.wallet);
  const { web3auth } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Function to calculate total items in cart
  const calculateCartItems = () => {
    const cart = JSON.parse(localStorage.getItem("courtCart") || "[]");
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartItemCount(totalItems);
  };

  // Update cart count on component mount and when localStorage changes
  useEffect(() => {
    calculateCartItems();

    // Listen for storage changes (when cart is updated from other components)
    const handleStorageChange = (e) => {
      if (e.key === "courtCart") {
        calculateCartItems();
      }
    };

    // Listen for custom cart update events
    const handleCartUpdate = () => {
      calculateCartItems();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    // Set up interval to check for cart changes (fallback)
    const interval = setInterval(calculateCartItems, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      clearInterval(interval);
    };
  }, []);

  // Debugging: Log userDetails on each render
  console.log("UserNavbar userDetails:", userDetails);

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
    <div className="user-navbar-container">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="brand" onClick={handleLogoClick} role="button" tabIndex={0}>
          <img src="/logo.png" alt="Courtify Logo" className="logo" />
          <span
            className="title_user"
            style={{
              fontSize: "1.2rem",
              fontWeight: 500,
              margin: 0,
              color: "white",
            }}
          >
            Courtify
          </span>
        </div>

        <div className="balance-info">
          <span className="user-name">👤 {userDetails?.Name || "User"}</span>
          <span className="wallet-amount">💰 {(xrpBalance / 1000000).toFixed(6)} XRP</span>
        </div>

        <div className="nav-links">
          <Link to="/userdashboard/booking">Book a Court</Link>
          <Link to="/cart" className="view-cart-btn">
            <div className="cart-icon-container">
              <img
                src="/cart.png"
                alt="View Cart"
                style={{
                  width: "22px",
                  height: "22px",
                  verticalAlign: "middle",
                }}
              />
              {cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
            </div>
          </Link>
          <Link to="/userdashboard/payment">Payments</Link>
          <Link to="/userdashboard/myBookings">My Bookings</Link>
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
              <Link to="/userdashboard/myNFTs" onClick={() => setSidebarOpen(false)}>
                My NFTs
              </Link>
            </li>
            <li>
              <Link to="/userdashboard/profile/edit" onClick={() => setSidebarOpen(false)}>
                Edit Profile
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

export default UserNavbar;