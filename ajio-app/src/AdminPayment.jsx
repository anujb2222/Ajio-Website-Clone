import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPayment.css";
import { FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaCalendarAlt, FaUser, FaHashtag, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


function AdminPayment() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const API_URL = "https://ajio-website-clone-1.onrender.com";


  useEffect(() => {
    axios
      .get(`${API_URL}/orders`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="admin-payments-container">
      <div className="admin-payments-header">
        <button className="back-btn" onClick={() => navigate("/admin")}>
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h2>Payment Transactions</h2>
      </div>

      {orders.filter((order) => order.paymentMethod === "online").length === 0 ? (
        <div className="empty-payments">
          <FaMoneyBillWave size={50} style={{ marginBottom: '15px', opacity: 0.3 }} />
          <p>No online payment transactions found.</p>
        </div>
      ) : (
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th><FaHashtag /> Payment ID</th>
                <th><FaHashtag /> Order ID</th>
                <th><FaUser /> User ID</th>
                <th><FaMoneyBillWave /> Amount</th>
                <th>Status</th>
                <th><FaCalendarAlt /> Date</th>
              </tr>
            </thead>

            <tbody>
              {orders
                .filter((order) => order.paymentMethod === "online")
                .map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="payment-id">
                        {order.razorpayPaymentId || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="order-ref">
                        {order.razorpayOrderId || order._id.slice(-12)}
                      </span>
                    </td>
                    <td>
                      <span className="user-id-text">{order.userId}</span>
                    </td>
                    <td>
                      <span className="amount-text">₹{order.totalPrice}</span>
                    </td>
                    <td>
                      {order.paymentStatus === "paid" ? (
                        <span className="status-badge status-paid">
                          <FaCheckCircle /> Paid
                        </span>
                      ) : (
                        <span className="status-badge status-pending">
                          <FaExclamationCircle /> Pending
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="date-text">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPayment;
