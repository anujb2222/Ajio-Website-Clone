import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminOrders.css";
import { 
  FaArrowLeft, FaCheckCircle, FaClock, FaTruck, 
  FaUser, FaMapMarkerAlt, FaCreditCard, FaBox, 
  FaShoppingBag, FaCalendarAlt, FaSpinner 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";


function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

    const API_URL = "https://ajio-website-clone-1.onrender.com";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      const res = await axios.put(`${API_URL}/orders/update-order-status/${orderId}`, { status });

      if (res.data.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status } : order
          )
        );
      } else {
        alert(res.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to update status. Please try again.";
      alert(errorMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status, isUpdating) => {
    if (isUpdating) return <FaSpinner className="status-icon spin-animation" />;
    switch (status) {
      case 'Pending': return <FaClock className="status-icon" />;
      case 'Processing': return <FaShoppingBag className="status-icon" />;
      case 'Shipped': return <FaTruck className="status-icon" />;
      case 'Delivered': return <FaCheckCircle className="status-icon" />;
      case 'Cancelled': return <FaBox className="status-icon" />;
      default: return <FaBox className="status-icon" />;
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
        <div className="header-left">
          <button className="premium-back-btn" onClick={() => navigate("/admin")}>
            <FaArrowLeft />
          </button>
          <div className="header-title">
            <h2>Order Management</h2>
            <p>Track and manage your store's orders efficiently</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="mini-stat">
            <span className="label">Total Orders</span>
            <span className="value">{orders.length}</span>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="admin-empty-state">
          <div className="empty-icon-wrapper">
            <FaBox />
          </div>
          <h3>No Orders Yet</h3>
          <p>When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="premium-admin-table">
            <thead>
              <tr>
                <th><FaCalendarAlt /> Order Details</th>
                <th><FaUser /> Customer Info</th>
                <th><FaMapMarkerAlt /> Shipping Address</th>
                <th><FaCreditCard /> Payment & Price</th>
                <th><FaBox /> Ordered Items</th>
                <th>Status Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="order-id-cell">
                    <span className="id-badge">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className="date-text">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </td>

                  <td className="customer-cell">
                    <div className="customer-name">{order.shipping?.name || "Anonymous"}</div>
                    <div className="customer-email">{order.shipping?.email || "No Email"}</div>
                  </td>

                  <td className="shipping-cell">
                    <p>{order.shipping?.address}</p>
                    <p>{order.shipping?.city}, {order.shipping?.state} - {order.shipping?.pincode}</p>
                  </td>

                  <td className="payment-cell">
                    <div className="price-tag-admin">₹{order.totalPrice.toLocaleString()}</div>
                    <span className={`method-badge ${order.paymentMethod?.toLowerCase()}`}>
                      {order.paymentMethod}
                    </span>
                  </td>

                  <td className="products-cell">
                    <div className="mini-product-stack">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="mini-product-row">
                          <img src={item.productId?.image} alt="" />
                          <div className="item-meta">
                            <span className="name">{item.productId?.itemName || "Item"}</span>
                            <span className="qty">x{item.quantity}</span>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="more-items">+{order.items.length - 2} more items</div>
                      )}
                    </div>
                  </td>

                  <td className="status-cell">
                    <div className={`status-dropdown-wrapper status-${order.status || 'Pending'} ${updatingId === order._id ? 'is-updating' : ''}`}>
                      {getStatusIcon(order.status || 'Pending', updatingId === order._id)}
                      <select
                        value={order.status || 'Pending'}
                        disabled={updatingId === order._id}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
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
      )}
    </div>
  );
}

export default AdminOrders;
