import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCreditCard, FaMoneyBillWave, FaShieldAlt } from "react-icons/fa";
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
          window.dispatchEvent(new Event("cartUpdated"));
          localStorage.removeItem("shippingDetails");

          setTimeout(() => {
            navigate("/order-success", {
              state: {
                items: cart,
                paymentMethod: "cod",
                orderId: data.orderId,
              },
            });
          }, 500);
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
            window.dispatchEvent(new Event("cartUpdated"));
            localStorage.removeItem("shippingDetails");

            setTimeout(() => {
              navigate("/order-success", {
                state: {
                  items: cart,
                  paymentMethod: "online",
                  orderId: data.orderId,
                },
              });
            }, 500);
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
      <h2>Payment Options</h2>

      <div className="payment-box">
        <div className="payment-left">
          <div
            className={method === "card" ? "active" : ""}
            onClick={() => setMethod("card")}
          >
            <FaCreditCard size={20} />
            <span>Credit / Debit Card</span>
          </div>

          <div
            className={method === "cod" ? "active" : ""}
            onClick={() => setMethod("cod")}
          >
            <FaMoneyBillWave size={20} />
            <span>Cash on Delivery</span>
          </div>
        </div>

        <div className="payment-right">
          {method === "card" ? (
            <>
              <h3>Pay Online</h3>
              <p>Securely pay using your Credit or Debit card via Razorpay.</p>
            </>
          ) : (
            <>
              <h3>Cash on Delivery</h3>
              <p>Pay with cash upon delivery of your order at your doorstep.</p>
            </>
          )}

          <button className="pay-btn" onClick={handlePayment}>
            {method === "card" ? "PROCEED TO PAY" : "CONFIRM ORDER"} ₹{total}
          </button>

          <div className="secure-badge">
            <FaShieldAlt />
            <span>100% SECURE PAYMENT</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
