import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

function Payment() {
  const [method, setMethod] = useState("card");
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const API_URL = "https://ajio-website-clone-1.onrender.com";

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(cartItems);

    const sum = cartItems.reduce(
      (acc, item) => acc + item.itemPrice * item.itemQuantity,
      0
    );

    setTotal(sum);
  }, []);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    const shipping = JSON.parse(localStorage.getItem("shippingDetails"));
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("email");

    if (!userId) return alert("Please login first");
    if (!cart.length || !shipping) return alert("Missing cart or shipping info");

    const orderData = {
      userId,
      shipping: {
        name: shipping.firstName + " " + shipping.lastName,
        address: shipping.address1 + " " + (shipping.address2 || ""),
        state: shipping.state,
      },
      items: cart.map((i) => ({
        productId: i._id,
        quantity: i.itemQuantity,
      })),
      totalPrice: total,
      paymentMethod: method,
    };

    
    if (method === "cod") {
      try {
        const res = await fetch(`${API_URL}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...orderData,
            email,
          }),
        });

        const data = await res.json();

        if (data.success) {
          alert("Order placed successfully!");
          localStorage.removeItem("cart");
          localStorage.removeItem("shippingDetails");
          navigate("/order-success");
        } else {
          alert(data.message || "Failed to place order");
        }
      } catch (err) {
        console.log(err);
        alert("Error placing order");
      }
      return;
    }

   
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) return alert("Razorpay SDK failed to load.");

    let order;

    try {
      const orderRes = await fetch(`${API_URL}/orders/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      order = await orderRes.json();
    } catch (err) {
      console.log(err);
      return alert("Error creating order");
    }

    const options = {
      key: "rzp_test_SaD5l5rtQUtFMj",
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      name: "AJIO",

      handler: async function (response) {
        try {
          const verifyRes = await fetch(
            `${API_URL}/orders/verify-payment`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                orderData,
                email,
              }),
            }
          );

          const data = await verifyRes.json();

          if (data.success) {
            alert("Payment successful!");
            localStorage.removeItem("cart");
            localStorage.removeItem("shippingDetails");
         navigate("/order-success");
          } else {
            alert("Payment verification failed");
          }
        } catch (err) {
          console.log(err);
          alert("Error verifying payment");
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="payment-container">
      <h2>Select Payment Mode</h2>

      <div className="payment-box">
        <div className="payment-left">
          <div
            className={method === "card" ? "active" : ""}
            onClick={() => setMethod("card")}
          >
            Credit / Debit Card
          </div>

          <div
            className={method === "cod" ? "active" : ""}
            onClick={() => setMethod("cod")}
          >
            Cash on Delivery
          </div>
        </div>

        <div className="payment-right">
          <button className="pay-btn" onClick={handlePayment}>
            {method === "card" ? "PAY-ONLINE" : "PAY-COD"} ₹{total}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Payment;