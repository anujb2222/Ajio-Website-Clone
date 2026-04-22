const Order = require("../models/Order");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const axios = require("axios");

const sendBrevoEmail = async (toEmail, subject, htmlContent) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "AJIO Clone",
          email: process.env.EMAIL_USER,
        },
        to: [{ email: toEmail }],
        subject,
        htmlContent,
        textContent: "Order placed successfully",
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
          accept: "application/json",
        },
      }
    );

    console.log("Email sent:", response.data);
  } catch (error) {
    console.error("BREVO FULL ERROR:", error.response?.data || error.message);
  }
};


exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
    });

    res.json(order);
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ error: "Error creating order" });
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
      email,
    } = req.body;

    console.log("EMAIL RECEIVED:", email);

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.json({ success: false });
    }

    const order = new Order({
      ...orderData,
      paymentMethod: "online",
      paymentStatus: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

    await order.save();

    const emailHtml = `
      <h2>Order Placed Successfully 🎉</h2>
      <p><b>Order ID:</b> ${razorpay_order_id}</p>
      <p><b>Total Price:</b> ₹${orderData.totalPrice}</p>
      <p>Thank you for shopping with us!</p>
    `;

    await sendBrevoEmail(email, "Order Confirmed - AJIO", emailHtml);

    return res.json({
      success: true,
      orderId: order._id,
    });

  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(500).json({ success: false });
  }
};

exports.placeCODOrder = async (req, res) => {
  try {
    const { userId, email, shipping, items, totalPrice } = req.body;

    console.log("EMAIL RECEIVED (COD):", email);

    const order = new Order({
      userId,
      shipping,
      items,
      totalPrice,
      paymentMethod: "COD",
      paymentStatus: "pending",
    });

    await order.save();

    const emailHtml = `
      <h2>COD Order Placed Successfully 🎉</h2>
      <p><b>Payment Method:</b> Cash on Delivery</p>
      <p><b>Total Price:</b> ₹${totalPrice}</p>
      <p>We will deliver your order soon 🚚</p>
    `;

    await sendBrevoEmail(email, "COD Order Confirmed - AJIO", emailHtml);

    
    return res.json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
    });

  } catch (err) {
    console.error("PLACE COD ORDER ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};


exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET USER ORDERS ERROR:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getSingleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json(order);

  } catch (err) {
    console.error("GET SINGLE ORDER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};