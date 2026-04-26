import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminSalesOverview.css";
import { FaMoneyBillWave, FaShoppingCart, FaBox, FaChartLine, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";



function AdminSalesOverview() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    productsSold: 0,
    totalProducts: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  

  const API_URL = "https://ajio-website-clone-1.onrender.com"; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/sales-stats`);
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching sales data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { totalRevenue, totalOrders, totalProducts, productsSold, recentOrders } = stats;

  if (loading) return <div className="loading">Loading Sales Overview...</div>;

  return (
    <div className="sales-overview-container">
      <div className="sales-header">
        <button className="back-btn" onClick={() => navigate("/admin")}>
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1>Sales Overview</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p>₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <FaShoppingCart />
          </div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p>{totalOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">
            <FaBox />
          </div>
          <div className="stat-info">
            <h3>Products Sold</h3>
            <p>{productsSold}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon inventory">
            <FaChartLine />
          </div>
          <div className="stat-info">
            <h3>Active Inventory</h3>
            <p>{totalProducts}</p>
          </div>
        </div>
      </div>

      <div className="recent-sales-section">
        <h2>Recent Sales</h2>
        <table className="sales-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order._id}>
                <td>{order._id.substring(0, 8)}...</td>
                <td>{order.shipping?.name || "N/A"}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>₹{order.totalPrice}</td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminSalesOverview;
