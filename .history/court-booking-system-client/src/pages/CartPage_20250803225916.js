import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CartPage.css";

const CartPage = () => {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("courtCart") || "[]")
  );
  const navigate = useNavigate();

  const handleRemove = (courtId) => {
    if (window.confirm("Are you sure you want to remove this court from your cart?")) {
      const updatedCart = cart.filter(court => court.Id !== courtId);
      setCart(updatedCart);
      localStorage.setItem("courtCart", JSON.stringify(updatedCart));
    }
  };

  const handleBookNow = (court) => {
    navigate("/confirmbooking", { state: { court } });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, court) => total + parseFloat(court.PricePerHour || 0), 0);
  };

  return (
    <div className="cart-page-container">
      <div className="cart-header">
        <div className="cart-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="cart-title">Your Cart</h2>
        <div className="cart-count">{cart.length} {cart.length === 1 ? 'Court' : 'Courts'}</div>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Your cart is empty</h3>
          <p>Add some courts to get started with your booking!</p>
          <button 
            className="browse-courts-btn"
            onClick={() => navigate("/")}
          >
            Browse Courts
          </button>
        </div>
      ) : (
        <>
          <div className="cart-summary">
            <div className="summary-item">
              <span className="summary-label">Total Courts:</span>
              <span className="summary-value">{cart.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Estimated Total:</span>
              <span className="summary-value">LKR {getTotalPrice().toLocaleString()}</span>
            </div>
          </div>

          <div className="cart-list">
            {cart.map((court, index) => (
              <div key={court.Id} className="cart-card" style={{"--delay": `${index * 0.1}s`}}>
                <div className="card-number">{index + 1}</div>
                
                <div className="cart-court-img-container">
                  <img
                    src={court.Image}
                    alt={court.Name}
                    className="cart-court-img"
                  />
                  <div className="img-overlay"></div>
                </div>

                <div className="cart-court-info">
                  <div className="court-header">
                    <h3 className="cart-court-name">{court.Name}</h3>
                    <div className="court-badge">Available</div>
                  </div>
                  
                  <div className="court-details">
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span className="cart-court-location">{court.Location}</span>
                    </div>
                    
                    <div className="detail-item price-detail">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 8L12 12L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 6V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="cart-court-price">LKR {parseFloat(court.PricePerHour || 0).toLocaleString()}/hr</span>
                    </div>
                  </div>
                </div>

                <div className="cart-actions">
                  <button
                    className="cart-remove-btn"
                    onClick={() => handleRemove(court.Id)}
                    title="Remove from cart"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Remove
                  </button>
                  
                  <button
                    className="cart-book-btn"
                    onClick={() => handleBookNow(court)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>

 
        </>
      )}
    </div>
  );
};

export default CartPage;