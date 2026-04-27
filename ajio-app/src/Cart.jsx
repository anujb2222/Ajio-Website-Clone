import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css";
import { FaShoppingCart, FaBoxOpen, FaHome, FaTrash, FaPlus, FaMinus, FaCheckCircle, FaTruck, FaClock, FaTimesCircle, FaBox, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("cart");
  const [reviewBox, setReviewBox] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewedProducts, setReviewedProducts] = useState([]);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const API_URL = "https://ajio-website-clone-1.onrender.com";

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`${API_URL}/reviews/user/${userId}`);
        const data = await res.json();

    
        const reviewedIds = data
          .filter(r => r.productId) // Only keep reviews where product still exists
          .map(r => (typeof r.productId === "string" ? r.productId : r.productId._id));
        setReviewedProducts(reviewedIds);
      } catch (err) {
        console.error("Error fetching user reviews:", err);
      }
    };
    fetchUserReviews();
  }, [userId]);

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
      const res = await fetch(`${API_URL}/orders/user-orders/${userId}`);
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
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQty = (id) => {
    const updated = cartItems.map((item) => {
      if (item._id === id) item.itemQuantity += 1;
      return item;
    });
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const decreaseQty = (id) => {
    const updated = cartItems.map((item) => {
      if (item._id === id && item.itemQuantity > 1)
        item.itemQuantity -= 1;
      return item;
    });
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  let totalPrice = 0;
  cartItems.forEach((item) => {
    totalPrice += item.itemPrice * item.itemQuantity;
  });

  // SUBMIT REVIEW
  const submitReview = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId,
          rating: Number(rating),
          comment
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || data.message || "Error submitting review");
        return;
      }

      alert("Review submitted successfully!");
      setReviewBox(null);
      setComment("");
      setRating(5);

      // Ensure productId is string
      const productIdStr = typeof productId === "string" ? productId : productId._id;
      setReviewedProducts([...reviewedProducts, productIdStr]);
    } catch (err) {
      alert("Server error while submitting review");
    }
  };

  return (
    <div className="cart-page">
    <div className="cart-sidebar">
  <h3>My Account</h3>

  <ul>
    <li 
      className={view === "cart" ? "active" : ""} 
      onClick={() => setView("cart")}
    >
      <FaShoppingCart style={{ marginRight: "10px" }} />
      My Cart
    </li>

    <li
      className={view === "orders" ? "active" : ""}
      onClick={() => {
        setView("orders");
        fetchOrders();
      }}
    >
      <FaBoxOpen style={{ marginRight: "10px" }} />
      My Orders
    </li>

    <li onClick={() => navigate("/")}>
      <FaHome style={{ marginRight: "10px" }} />
      Go to Home
    </li>
  </ul>
</div>

      <div className="cart-container">
        {/* CART VIEW */}
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
                        src={item.image || "https://via.placeholder.com/150"}
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
                      <span>- ₹0</span>
                    </div>
                    <hr />
                    <div className="summary-total">
                      <span>Total Amount</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>
                  <button
                    className="Order-btn"
                    onClick={() => {
                      if (userId) {
                        navigate("/order");
                      } else {
                        alert("First login first");
                        navigate("/Signin");
                      }
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ORDERS VIEW */}
        {view === "orders" && (
          <div className="orders-container">
            <h2>My Orders</h2>
            {orders.length === 0 ? (
              <p className="empty-orders">You have no orders yet.</p>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-summary">
                    <div className="order-status-container">
                      <div className="order-status-banner">
                        {order.status === 'Delivered' && <FaCheckCircle className="status-icon delivered" />}
                        {order.status === 'Processing' && <FaTruck className="status-icon processing" />}
                        {order.status === 'Pending' && <FaClock className="status-icon pending" />}
                        {order.status === 'Cancelled' && <FaTimesCircle className="status-icon cancelled" />}
                        <span className={`status-text ${order.status?.toLowerCase()}`}>
                          {order.status === 'Delivered' ? `Delivered ${new Date(order.updatedAt || order.createdAt).toLocaleDateString()}` : order.status}
                        </span>
                      </div>

                      <div className="order-progress-wrapper">
                        <div className="progress-track">
                          <div 
                            className={`progress-fill ${order.status?.toLowerCase()}`}
                            style={{ 
                              width: order.status === 'Delivered' ? '100%' : 
                                     order.status === 'Processing' ? '66%' : 
                                     order.status === 'Pending' ? '33%' : '0%' 
                            }}
                          ></div>
                        </div>
                        <div className="progress-steps">
                          <div className={`step ${['Pending', 'Processing', 'Delivered'].includes(order.status) ? 'completed' : ''}`}>
                            <div className="step-dot"><FaBox /></div>
                            <span className="step-label">Ordered</span>
                          </div>
                          <div className={`step ${['Processing', 'Delivered'].includes(order.status) ? 'completed' : ''}`}>
                            <div className="step-dot"><FaTruck /></div>
                            <span className="step-label">Shipped</span>
                          </div>
                          <div className={`step ${['Delivered'].includes(order.status) ? 'completed' : ''}`}>
                            <div className="step-dot"><FaMapMarkerAlt /></div>
                            <span className="step-label">Out for Delivery</span>
                          </div>
                          <div className={`step ${order.status === 'Delivered' ? 'completed' : ''}`}>
                            <div className="step-dot"><FaCheckCircle /></div>
                            <span className="step-label">Delivered</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="order-date">
                      Order Date: {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="order-total">Total: ₹{order.totalPrice}</span>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, idx) => {
                      const productId = item.productId?._id || item.productId;
                      const alreadyReviewed = reviewedProducts.includes(productId);

                      return (
                        <div key={idx} className="order-item-card">
                          <img
                            src={item.productId?.image || "https://via.placeholder.com/100"}
                            alt={item.productId?.itemName || "Product"}
                            className="order-item-img"
                          />
                          <div className="order-item-details">
                            <h4>{item.productId?.itemName || "Product Deleted"}</h4>
                            <p>Price: ₹{item.productId?.itemPrice || 0}</p>
                            <p>Quantity: {item.quantity || 1}</p>

                            {!alreadyReviewed && (
                              <button
                                className="review-btn"
                                onClick={() => setReviewBox(productId)}
                              >
                                Write Review
                              </button>
                            )}

                            {reviewBox === productId && (
                              <div className="review-popup">
                                <div className="review-box">
                                  <h4>Write Review</h4>

                                  <select
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                  >
                                    <option value="5">5 ⭐</option>
                                    <option value="4">4 ⭐</option>
                                    <option value="3">3 ⭐</option>
                                    <option value="2">2 ⭐</option>
                                    <option value="1">1 ⭐</option>
                                  </select>

                                  <textarea
                                    placeholder="Write your review..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                  />

                                  <div className="review-buttons">
                                    <button
                                      onClick={() => submitReview(productId)}
                                      className="submit-review-btn"
                                    >
                                      Submit
                                    </button>
                                    <button
                                      onClick={() => setReviewBox(null)}
                                      className="cancel-review-btn"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="order-footer">
                    <span>Payment Mode: {order.paymentMethod}</span>
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