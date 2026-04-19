import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";

const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("cart");
  const [reviewBox, setReviewBox] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const API_URL = "https://ajio-website-clone-1.onrender.com";

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

  // ✅ FIXED REVIEW FUNCTION
  const submitReview = async (productId) => {
    if (!productId) {
      alert("Invalid product");
      return;
    }

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
        alert(data.message || "Error submitting review");
        return;
      }

      alert("Review submitted successfully!");
      setReviewBox(null);
      setComment("");
      setRating(5);

    } catch (err) {
      alert("Server error while submitting review");
      console.error(err);
    }
  };

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
          <li onClick={() => navigate("/")}>Go to Home</li>
        </ul>
      </div>

      <div className="cart-container">

        {/* ================= CART ================= */}
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
                          <button onClick={() => decreaseQty(item._id)}>-</button>
                          <span>{item.itemQuantity}</span>
                          <button onClick={() => increaseQty(item._id)}>+</button>
                        </div>

                        <button onClick={() => handleRemove(item._id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-right">
                  <h3>Order Summary</h3>

                  <div>
                    <p>Subtotal: ₹{totalPrice}</p>
                    <p>Delivery: FREE</p>
                    <p>Expected: {getDeliveryDate()}</p>
                    <hr />
                    <h4>Total: ₹{totalPrice}</h4>
                  </div>

                  <Link to="/order">
                    <button>Proceed to Checkout</button>
                  </Link>
                </div>
              </>
            )}
          </>
        )}

        {/* ================= ORDERS ================= */}
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
                          src={item.productId?.image}
                          alt={item.productId?.itemName}
                          className="order-item-img"
                        />

                        <div>
                          <span>{item.productId?.itemName}</span>
                          <span>₹{item.productId?.itemPrice}</span>
                        </div>

                        {/* REVIEW BUTTON */}
                        <button
                          onClick={() => setReviewBox(item.productId?._id)}
                        >
                          Write Review
                        </button>

                        {/* REVIEW BOX */}
                        {reviewBox === item.productId?._id && (
                          <div className="review-popup">
                            <div className="review-box">
                              <h4>Write Review</h4>

                              <select
                                value={rating}
                                onChange={(e) =>
                                  setRating(Number(e.target.value))
                                }
                              >
                                <option value="5">5 ⭐</option>
                                <option value="4">4 ⭐</option>
                                <option value="3">3 ⭐</option>
                                <option value="2">2 ⭐</option>
                                <option value="1">1 ⭐</option>
                              </select>

                              <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write your review..."
                              />

                              <button
                                onClick={() =>
                                  submitReview(item.productId?._id)
                                }
                              >
                                Submit
                              </button>

                              <button onClick={() => setReviewBox(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>Payment-mode: {order.paymentMethod}</div>
                  <div>Status: {order.status}</div>
                  <div>
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