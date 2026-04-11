import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";

const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("cart");
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const API_URL = "https://ajio-website-clone-1.onrender.com";  // Live backend URL

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toDateString();
  };

  const fetchOrders = async () => {
    if (!userId) {
      alert("Please login to view your orders.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/user-orders/${userId}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

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
      if (item._id === id && item.itemQuantity > 1)
        item.itemQuantity -= 1;
      return item;
    });
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  let totalPrice = 0;
  cartItems.forEach((item) => {
    totalPrice += item.itemPrice * item.itemQuantity;
  });

  return (
    <div className="cart-page">
      <div className="cart-sidebar">
        <h3>My Account</h3>
        <ul>
          <li onClick={() => setView("cart")}>My Cart</li>
          <li
            onClick={() => {
              setView("orders");
              fetchOrders();
            }}
          >
            My Orders
          </li>
          <li onClick={() => navigate("/Home")}>GO to home</li>
        </ul>
      </div>

      <div className="cart-container">
        {view === "cart" && (
          <>
            {cartItems.length === 0 ? (
              <div className="cart-container-empty">
                <h2>Your Cart</h2>
                <p>Your cart is empty.</p>
                <Link to="/">Go to Home</Link>
              </div>
            ) : (
              <>
                <div className="cart-left">
                  {cartItems.map((item) => (
                    <div key={item._id} className="cart-item">
                      <img
                        src={`${API_URL}/uploads/${item.image}`}  // Updated to live backend URL
                        alt={item.itemName}
                        className="cart-image"
                      />

                      <div className="cart-details">
                        <h4>{item.itemName}</h4>
                        <p>Price: ₹{item.itemPrice}</p>

                        <div className="quantity-control">
                          <button
                            className="qty-btn"
                            onClick={() => decreaseQty(item._id)}
                          >
                            -
                          </button>
                          <span>{item.itemQuantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => increaseQty(item._id)}
                          >
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
                  <h3 className="summary-title">Order Summary</h3>

                  <div className="summary-box">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{totalPrice}</span>
                    </div>

                    <div className="summary-row">
                      <span>Delivery</span>
                      <span className="free">FREE</span>
                    </div>

                    <div className="summary-row">
                      <span>Expected Delivery</span>
                      <span>{getDeliveryDate()}</span>
                    </div>

                    <div className="summary-row">
                      <span>Discount</span>
                      <span className="discount">- ₹0</span>
                    </div>

                    <hr />

                    <div className="summary-total">
                      <span>Total Amount</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>

                  <Link to="/order">
                    <button className="Order-btn">
                      Proceed to Checkout
                    </button>
                  </Link>

                  <div className="checkout-bottom">
                    <img
                      src="images/checkoutscreenshot.png"
                      alt="footer-screenshot"
                      className="footer-screenshot"
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {view === "orders" && (
          <div className="orders-table-container">
            <h2>My Orders</h2>

            {orders.length === 0 ? (
              <p>You have no orders yet.</p>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <p>ITEM</p>
                    <span>Total: ₹{order.totalPrice}</span>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <img
                          src={`${API_URL}/uploads/${item.productId.image}`}  // Updated to live backend URL
                          alt={item.productId.itemName}
                          className="order-item-img"
                        />

                        <div className="order-item-info">
                          <span className="order-item-name">
                            Item-ordered: {item.productId.itemName}
                          </span>

                          <span className="order-item-price">
                            ₹{item.productId.itemPrice}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="payment-method">
                    Payment-mode: {order.paymentMethod}
                  </div>

                  <div className="order-status">
                    Order-status: {order.status}
                  </div>

                  <div className="order-date">
                    Order Date:{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;