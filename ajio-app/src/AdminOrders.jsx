import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminOrders.css";
import {
  FaArrowLeft,
  FaUser,
  FaMapMarkerAlt,
  FaCreditCard,
  FaBox,
  FaCalendarAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = "https://ajio-website-clone-1.onrender.com";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );

      await axios.put(
        `${API_URL}/orders/update-order-status/${orderId}`,
        { status }
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
      fetchOrders();
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner"></div>
        <p>Loading Orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">

      <div className="admin-top-bar">
        <button className="premium-back-btn" onClick={() => navigate("/admin")}>
          <FaArrowLeft />
        </button>

        <h2>Order Management</h2>

        <div className="mini-stat">
          Total Orders: {orders.length}
        </div>
      </div>

      <div className="admin-table-container">
        <table className="premium-admin-table">

          <thead>
            <tr>
              <th><FaCalendarAlt /> Order</th>
              <th><FaUser /> Customer</th>
              <th><FaMapMarkerAlt /> Address</th>
              <th><FaCreditCard /> Payment</th>
              <th><FaBox /> Items</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>

                <td>
                  #{order._id.slice(-8).toUpperCase()}
                </td>

                <td>
                  <div>{order.shipping?.name}</div>
                  <div className="small-text">{order.shipping?.email}</div>
                </td>

                <td>
                  {order.shipping?.address}
                  <br />
                  {order.shipping?.city}, {order.shipping?.state}
                </td>

                <td>
                  ₹{order.totalPrice.toLocaleString()}
                  <br />
                  <span className="small-text">{order.paymentMethod}</span>
                </td>

                <td>
                  {order.items.slice(0, 2).map((item, i) => (
                    <div key={i} className="mini-product-row">
                      <img src={item.productId?.image} alt="" />
                     <span>{item.productId?.itemName} × {item.quantity}</span>
                    </div>
                  ))}
                </td>

            
                <td>
                  <div className={`status-box status-${order.status}`}>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order._id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default AdminOrders;