import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const items = state?.items || [];
  const paymentMethod = state?.paymentMethod || "cod";
  const orderId = state?.orderId;

  const API_URL = "https://ajio-website-clone-1.onrender.com";

  const downloadInvoice = async () => {
    if (!orderId) return alert("Order ID not found");

    try {
      const response = await fetch(`${API_URL}/orders/download-invoice/${orderId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Failed to download invoice");
      }
    } catch (err) {
      console.error("Error downloading invoice:", err);
      alert("Error downloading invoice");
    }
  };

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  return (
    <div className="success-container">
      <div className="success-card">

        <h2 className="success-title">🎉 Order Confirmed!</h2>

        <p className="success-subtitle">
          Delivery by <b>{deliveryDate.toDateString()}</b>
        </p>

        <div className="success-items">
          {items.map((item) => (
            <div key={item._id} className="success-item">

              <img
  src={item.image || item.productId?.image}
  alt={item.itemName}
  className="success-img"
/>

              <div>
                <h4>
                  {item.productId?.itemName || item.itemName}
                </h4>

                <p>
                  ₹{item.productId?.itemPrice || item.itemPrice} ×{" "}
                  {item.quantity || item.itemQuantity}
                </p>
              </div>

            </div>
          ))}
        </div>

        <div className="success-summary">
          <p>
            <b>Payment Method:</b>{" "}
            {paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
          </p>

          <p>
            <b>Payment Status:</b>{" "}
            {paymentMethod === "cod" ? "Pending" : "Paid"}
          </p>

          <p>
            <b>Order Status:</b> Confirmed
          </p>
        </div>

        <div className="success-actions">
          <button onClick={() => navigate("/cart")}>
            View Orders
          </button>

          <button onClick={downloadInvoice} className="invoice-btn">
            Download Invoice 📄
          </button>

          <button onClick={() => navigate("/home")} className="secondary-btn">
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
}

export default OrderSuccess;