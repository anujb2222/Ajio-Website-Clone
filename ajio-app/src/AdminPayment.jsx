import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Payments() {
  const [orders, setOrders] = useState([]);

  const API_URL = "https://ajio-website-clone-1.onrender.com"; // Live backend URL

  useEffect(() => {
    axios
      .get(`${API_URL}/orders`)  // Updated with live backend URL
      .then((res) => setOrders(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="main-content">
      <h2>Payments</h2>

      <table className="product-table">
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>Order ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {orders
            .filter((order) => order.paymentMethod === "online")
            .map((order) => (
              <tr key={order._id}>
                <td>{order.razorpayPaymentId || "N/A"}</td>
                <td>{order.razorpayOrderId}</td>
                <td>{order.userId}</td>
                <td>₹{order.totalPrice}</td>

                <td>
                  {order.paymentStatus === "paid" ? "🟢 Paid" : "🟡 Pending"}
                </td>

                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Payments;