import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Cart.css";

const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];

function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const handleRemove = (id) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const increaseQty = (id) => {
    const updated = cartItems.map((item) => {
      if (item._id === id) item.itemQuantity += 1;
      return item;
    });
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const decreaseQty = (id) => {
    const updated = cartItems.map((item) => {
      if (item._id === id && item.itemQuantity > 1) item.itemQuantity -= 1;
      return item;
    });
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  let totalPrice = 0;
  cartItems.forEach((item) => {
    totalPrice += item.itemPrice * item.itemQuantity;
  });

  if (cartItems.length === 0) {
    return (
      <div className="cart-container-empty">
        <h2>Your Cart</h2>
        <p>Your cart is empty.</p>
        <Link to="/">Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-left">
        {cartItems.map((item) => (
          <div key={item._id} className="cart-item">
            <img
              src={`http://localhost:5000/uploads/${item.image}`}
              alt={item.itemName}
              className="cart-image"
            />
            <div className="cart-details">
              <h4>{item.itemName}</h4>
              <p>Price: ₹{item.itemPrice}</p>
              <div className="quantity-control">
                <button className="qty-btn" onClick={() => decreaseQty(item._id)}>
                  -
                </button>
                <span>{item.itemQuantity}</span>
                <button className="qty-btn" onClick={() => increaseQty(item._id)}>
                  +
                </button>
              </div>
              <button
                className="remove-btn"
                onClick={() => handleRemove(item._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-right">
        <h3>Order Summary</h3>
        <div className="summary">
          <p>
            <span>Total</span> <span>₹{totalPrice}</span>
          </p>
        </div>
        <Link to="/Order">
          <button className="Order-btn">ORDER NOW</button>
        </Link>
      </div>
    </div>
  );
}

export default Cart;