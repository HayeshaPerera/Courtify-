import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CartPage.css";

const CartPage = () => {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("courtCart") || "[]")
  );
  const navigate = useNavigate();

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("courtCart", JSON.stringify(cart));
  }, [cart]);

  // Add quantity to existing item or add new item with quantity 1
  const handleAddToCart = (court) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.Id === court.Id);
      
      if (existingItem) {
        // If item exists, increase quantity
        return prevCart.map(item =>
          item.Id === court.Id 
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        // If new item, add with quantity 1
        return [...prevCart, { ...court, quantity: 1 }];
      }
    });
  };

  // Decrease quantity or remove if quantity becomes 0
  const handleDecreaseQuantity = (courtId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.Id === courtId);
      
      if (existingItem && (existingItem.quantity || 1) > 1) {
        // Decrease quantity if more than 1
        return prevCart.map(item =>
          item.Id === courtId 
            ? { ...item, quantity: (item.quantity || 1) - 1 }
            : item
        );
      } else {
        // Remove item completely if quantity is 1 or less
        return prevCart.filter(item => item.Id !== courtId);
      }
    });
  };

  // Remove entire item from cart (regardless of quantity)
  const handleRemove = (courtId) => {
    if (window.confirm("Are you sure you want to remove this court from your cart?")) {
      const updatedCart = cart.filter(court => court.Id !== courtId);
      setCart(updatedCart);
    }
  };

  // Book a specific quantity of courts
  const handleBookNow = (court) => {
    navigate("/confirmbooking", { 
      state: { 
        court: {
          ...court,
          quantity: court.quantity || 1
        }
      } 
    });
  };

  // Get total number of items in cart
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  // Get total price of all items
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.PricePerHour * (item.quantity || 1)), 0);
  };

  // Migrate old cart items to include quantity (for backward compatibility)
  useEffect(() => {
    const needsMigration = cart.some(item => !item.hasOwnProperty('quantity'));
    if (needsMigration) {
      const migratedCart = cart.map(item => ({
        ...item,
        quantity: item.quantity || 1
      }));
      setCart(migratedCart);
    }
  }, []);

  return (
    <div className="cart-page-container">
      <div className="cart-header">
        <h2 className="cart-title">YOUR CART</h2>
        {cart.length > 0 && (
          <div className="cart-summary">
            <span className="cart-items-count">{getTotalItems()} items</span>
            <span className="cart-total-price">Total: Rs.{getTotalPrice()}</span>
          </div>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <img src="/cart.png" alt="Empty Cart" className="empty-cart-img" />
          <p>No courts in cart.</p>
        </div>
      ) : (
        <>
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
                  <div className="cart-court-price">Rs.{court.PricePerHour}/hr</div>
                  <div className="cart-item-total">
                    Subtotal: Rs.{court.PricePerHour * (court.quantity || 1)}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="quantity-controls">
                  <button
                    className="quantity-btn decrease-btn"
                    onClick={() => handleDecreaseQuantity(court.Id)}
                    title="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="quantity-display">{court.quantity || 1}</span>
                  <button
                    className="quantity-btn increase-btn"
                    onClick={() => handleAddToCart(court)}
                    title="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="cart-actions">
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
              </div>
            ))}
          </div>

          {/* Cart Footer with Total and Checkout */}
          <div className="cart-footer">
            <div className="cart-total-section">
              <div className="total-breakdown">
                <div className="total-items">Total Items: {getTotalItems()}</div>
                <div className="total-amount">Total Amount: Rs.{getTotalPrice()}</div>
              </div>
              <button 
                className="checkout-all-btn"
                onClick={() => navigate("/confirmbooking", { 
                  state: { 
                    courts: cart,
                    isMultiple: true 
                  } 
                })}
              >
                Book All Courts
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;