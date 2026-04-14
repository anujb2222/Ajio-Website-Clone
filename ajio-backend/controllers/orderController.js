const Order = require("../models/Order");
const nodemailer = require("nodemailer");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");


exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR"
    });

    res.json(order);
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ error: "Error creating order" });
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData, email } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) return res.json({ success: false });

    const order = new Order({
      ...orderData,
      paymentMethod: "online",
      paymentStatus: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id
    });

    await order.save();
    res.json({ success: true });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Order Confirmed - AJIO",
      html: `<h2>Order Placed Successfully 🎉</h2>
             <p><b>Payment Method:</b> Online</p>
             <p><b>Total Price:</b> ₹${orderData.totalPrice}</p>
             <p>Thank you for shopping with us!</p>`
    });

  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(500).json({ success: false });
  }
};

exports.placeCODOrder = async (req, res) => {
  try {
    const { userId, email, shipping, items, totalPrice } = req.body;

    const order = new Order({
      userId,
      shipping,
      items,
      totalPrice,
      paymentMethod: "COD",
      paymentStatus: "pending"
    });

    await order.save();
    res.json({ success: true, message: "Order placed successfully" });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "COD Order Confirmed - AJIO",
      html: `<h2>Order Placed Successfully 🎉</h2>
             <p><b>Payment Method:</b> COD</p>
             <p><b>Total Price:</b> ₹${totalPrice}</p>
             <p>We will deliver your order soon 🚚</p>`
    });

  } catch (err) {
    console.error("PLACE COD ORDER ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("items.productId").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};


exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate("items.productId").sort({ createdAt: -1 });
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
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.status = status;
    await order.save();
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
