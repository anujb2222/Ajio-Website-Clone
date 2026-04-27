import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminOrders.css";
import { FaArrowLeft, FaCheckCircle, FaClock, FaTruck, FaUser, FaMapMarkerAlt, FaCreditCard, FaBox } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  
   const API_URL = "https://ajio-website-clone-1.onrender.com";



  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(
        `${API_URL}/orders/update-order-status/${orderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (data.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="admin-orders-table-container">
      <div className="admin-orders-header">
        <button className="back-btn" onClick={() => navigate("/admin")}>
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h2>Order Management</h2>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <FaBox size={50} style={{ marginBottom: '15px', opacity: 0.3 }} />
          <p>No orders found in the system.</p>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th><FaClock /> Order Info</th>
                <th><FaUser /> Customer</th>
                <th><FaMapMarkerAlt /> Shipping</th>
                <th><FaCreditCard /> Payment</th>
                <th><FaBox /> Products</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <div className="order-id">#{order._id.slice(-8).toUpperCase()}</div>
                    <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  <td>
                    <div className="user-info">{order.shipping?.name || "N/A"}</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{order.shipping?.email || ""}</div>
                  </td>

                  <td>
                    <div className="address-info">
                      {order.shipping?.address}, {order.shipping?.city}
                      <br />
                      {order.shipping?.state} - {order.shipping?.pincode}
                    </div>
                  </td>

                  <td>
                    <div className="price-tag">₹{order.totalPrice}</div>
                    <div className="payment-badge">{order.paymentMethod}</div>
                  </td>

                  <td>
                    <div className="products-list">
                      {order.items.map((item, index) => (
                        <div key={index} className="product-item">
                          {item.productId ? (
                            <>
                              <img
                                src={item.productId.image}
                                alt={item.productId.itemName}
                                width="45"
                                height="45"
                              />
                              <div className="product-info">
                                <p className="product-name">{item.productId.itemName}</p>
                                <p className="product-qty">Qty: {item.quantity}</p>
                              </div>
                            </>
                          ) : (
                            <div className="product-info">
                              <p className="product-name">{item.itemName || "Product removed"}</p>
                              <p className="product-qty">Qty: {item.quantity}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td>
                    <select
                      className={`status-select status-${order.status || 'Pending'}`}
                      value={order.status || 'Pending'}
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

export default AdminOrders;
