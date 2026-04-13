import React, { useEffect, useState } from "react";
import "./AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

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
      <h2>All Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User Name</th>
              <th>Shipping</th>
              <th>Total Price</th>
              <th>Payment</th>
              <th>Products</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>

                <td>{order.shipping?.name}</td>

                <td>
                  {order.shipping?.address}, {order.shipping?.state}
                </td>

                <td>₹{order.totalPrice}</td>

                <td>{order.paymentMethod}</td>

                <td>
                  {order.items.map((item, index) => (
                    <div key={index} className="product-item">
                      {item.productId ? (
                        <>
                          <img
                            src={item.productId.image}
                            alt={item.productId.itemName}
                            width="50"
                          />
                          <div>
                            <p>{item.productId.itemName}</p>
                            <p>Qty: {item.quantity}</p>
                          </div>
                        </>
                      ) : (
                        <div>
                          <p>{item.itemName || "Product removed"}</p>
                          <p>Qty: {item.quantity}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </td>

                <td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminOrders;