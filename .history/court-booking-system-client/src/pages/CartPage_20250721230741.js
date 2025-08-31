import React, { useState } from "react";

const CartPage = () => {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("courtCart") || "[]")
  );

  const handleRemove = (courtId) => {
    const updatedCart = cart.filter(court => court.Id !== courtId);
    setCart(updatedCart);
    localStorage.setItem("courtCart", JSON.stringify(updatedCart));
  };

  return (
    <div className="cart-page-container" style={{ maxWidth: 700, margin: "40px auto", padding: "32px" }}>
      <h2 style={{
        fontSize: "1.5rem",
        fontWeight: 700,
        color: "#12822e",
        textAlign: "center",
        marginBottom: "24px",
        letterSpacing: "1px"
      }}>
        Your Cart
      </h2>
      {cart.length === 0 ? (
        <div className="empty-cart" style={{
          textAlign: "center",
          color: "#888",
          fontSize: "1.1rem",
          padding: "40px 0"
        }}>
          <img src="/cart.png" alt="Empty Cart" style={{ width: 60, marginBottom: 16 }} />
          <p>No courts in cart.</p>
        </div>
      ) : (
        <div className="cart-list">
          {cart.map(court => (
            <div key={court.Id} className="cart-card" style={{
              display: "flex",
              alignItems: "center",
              background: "#f8fafc",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(44,62,80,0.08)",
              marginBottom: "18px",
              padding: "18px 22px",
              gap: "18px"
            }}>
              <img
                src={court.Image}
                alt={court.Name}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb"
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "#22314a" }}>{court.Name}</div>
                <div style={{ color: "#334155", fontSize: "0.98rem" }}>{court.Location}</div>
                <div style={{ color: "#4AB420", fontWeight: 500, marginTop: "4px" }}>${court.PricePerHour}/hr</div>
              </div>
              <button
                className="cart-remove-btn"
                style={{
                  background: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "0.98rem",
                  transition: "background 0.2s"
                }}
                onClick={() => handleRemove(court.Id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartPage;