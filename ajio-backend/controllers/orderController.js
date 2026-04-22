const Order = require("../models/Order");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const { generateInvoice } = require("../utils/generateinvoice");

const sendBrevoEmail = async (toEmail, subject, htmlContent, filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath).toString("base64");

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "AJIO Clone",
          email: process.env.EMAIL_USER,
        },
        to: [{ email: toEmail }],
        subject,
        htmlContent,
        attachment: [
          {
            content: fileContent,
            name: "invoice.pdf",
          },
        ],
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("BREVO ERROR:", error.response?.data || error.message);
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
      shipping: {
        ...orderData.shipping,
        email: email
      },
      paymentMethod: "online",
      paymentStatus: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

    await order.save();

    const savedOrder = await Order.findById(order._id).populate("items.productId");

    const invoicePath = path.join(
      __dirname,
      `../invoices/invoice-${order._id}.pdf`
    );

    await generateInvoice(
      { items: savedOrder.items, email },
      invoicePath
    );

    const emailHtml = `
      <h2>Order Placed Successfully 🎉</h2>
      <p><b>Total Price:</b> ₹${savedOrder.totalPrice}</p>
      <p>Invoice attached below 📎</p>
    `;

    await sendBrevoEmail(
      email,
      "Order Confirmed - AJIO",
      emailHtml,
      invoicePath
    );

    res.json({ success: true, orderId: order._id });
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
      shipping: {
        ...shipping,
        email: email
      },
      items,
      totalPrice,
      paymentMethod: "COD",
      paymentStatus: "pending",
    });

    await order.save();

    const savedOrder = await Order.findById(order._id).populate("items.productId");

    const invoicePath = path.join(
      __dirname,
      `../invoices/invoice-${order._id}.pdf`
    );

    await generateInvoice(
      { items: savedOrder.items, email },
      invoicePath
    );

    const emailHtml = `
      <h2>COD Order Placed Successfully 🎉</h2>
      <p><b>Total Price:</b> ₹${savedOrder.totalPrice}</p>
      <p>Pay on delivery 🚚</p>
      <p>Invoice attached below 📎</p>
    `;

    await sendBrevoEmail(
      email,
      "COD Order Confirmed - AJIO",
      emailHtml,
      invoicePath
    );

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("COD ORDER ERROR:", err);
    res.status(500).json({ success: false });
  }
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("items.productId").sort({ createdAt: -1 });
  res.json(orders);
};


exports.getUserOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId })
    .populate("items.productId")
    .sort({ createdAt: -1 });

  res.json(orders);
};


exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  await Order.findByIdAndUpdate(req.params.orderId, {
    orderStatus: status,
  });

  res.json({ success: true });
};


exports.downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate("items.productId");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const invoiceDir = path.join(__dirname, "../invoices");
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir);
    }

    const invoicePath = path.join(invoiceDir, `invoice-${order._id}.pdf`);

  
    await generateInvoice(
      { 
        items: order.items, 
        email: order.shipping?.email || "customer@example.com",
        name: order.shipping?.name || "Customer",
        orderId: order._id,
        paymentId: order.razorpayPaymentId || "COD"
      },
      invoicePath
    );

    res.download(invoicePath, `invoice-${order._id}.pdf`, (err) => {
      if (err) {
        console.error("DOWNLOAD ERROR:", err);
      }
     
    });
  } catch (err) {
    console.error("DOWNLOAD INVOICE ERROR:", err);
    res.status(500).json({ error: "Error downloading invoice" });
  }
};


exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("items.productId");
    res.json(order);
  } catch (err) {
    console.error("GET SINGLE ORDER ERROR:", err);
    res.status(500).json({ error: "Error fetching order" });
  }
};