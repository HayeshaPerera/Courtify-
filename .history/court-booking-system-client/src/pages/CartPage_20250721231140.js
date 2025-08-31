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

  return (
    <div className="cart-page-container">
      <h2 className="cart-title">YOUR CART</h2>
      {cart.length === 0 ? (
        <div className="empty-cart">
          <img src="/cart.png" alt="Empty Cart" className="empty-cart-img" />
          <p>No courts in cart.</p>
        </div>
      ) : (
        <div className="cart-list">
          {cart.map(court => (
            <div key={court.Id} className="cart-card">
              <img
                src={court.Image}
                alt={court.Name}
                className="cart-court-img"
              />
              <div className="cart-court-info">
                <div className="cart-court-name">{court.Name}</div>
                <div className="cart-court-location">{court.Location}</div>
                <div className="cart-court-price">${court.PricePerHour}/hr</div>
              </div>
              <button
                className="cart-remove-btn"
                onClick={() => handleRemove(court.Id)}
              >
                🗑 Remove
              </button>
              <button
                className="cart-book-btn"
                onClick={() => handleBookNow(court)}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartPage;