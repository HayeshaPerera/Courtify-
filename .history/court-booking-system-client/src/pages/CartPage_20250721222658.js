import React from "react";

const Cart = () => {
  const cart = JSON.parse(localStorage.getItem("courtCart") || "[]");

  return (
    <div style={{ padding: "32px" }}>
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>No courts in cart.</p>
      ) : (
        <ul>
          {cart.map(court => (
            <li key={court.Id}>
              <strong>{court.Name}</strong> - {court.Location} (${court.PricePerHour}/hr)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;