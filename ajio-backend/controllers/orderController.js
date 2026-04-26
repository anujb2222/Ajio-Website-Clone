const Order = require("../models/Order");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const axios = require("axios");

const { generateInvoiceBuffer } = require("../utils/generateinvoice");

// ================= EMAIL =================
const sendBrevoEmail = async (toEmail, subject, htmlContent, pdfBuffer) => {
  try {
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
            content: pdfBuffer.toString("base64"),
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
  } catch (error) {
    console.error("BREVO ERROR:", error.response?.data || error.message);
  }
};

// ================= CREATE RAZORPAY ORDER =================
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

// ================= VERIFY PAYMENT =================
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
        email,
      },
      paymentMethod: "online",
      paymentStatus: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

    await order.save();

    const savedOrder = await Order.findById(order._id).populate(
      "items.productId"
    );

    // ✅ NO FILE SYSTEM — BUFFER PDF
    const pdfBuffer = await generateInvoiceBuffer({
      items: savedOrder.items,
      email,
      name: orderData.shipping?.name,
      orderId: order._id,
      paymentId: razorpay_payment_id,
      totalPrice: savedOrder.totalPrice,
    });

    const emailHtml = `
      <h2>Order Placed Successfully 🎉</h2>
      <p><b>Total Price:</b> ₹${savedOrder.totalPrice}</p>
      <p>Invoice attached below 📎</p>
    `;

    await sendBrevoEmail(
      email,
      "Order Confirmed - AJIO",
      emailHtml,
      pdfBuffer
    );

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(500).json({ success: false });
  }
};

// ================= COD ORDER =================
exports.placeCODOrder = async (req, res) => {
  try {
    const { userId, email, shipping, items, totalPrice } = req.body;

    const order = new Order({
      userId,
      shipping: {
        ...shipping,
        email,
      },
      items,
      totalPrice,
      paymentMethod: "COD",
      paymentStatus: "pending",
    });

    await order.save();

    const savedOrder = await Order.findById(order._id).populate(
      "items.productId"
    );

    // ✅ BUFFER INVOICE (NO FILES)
    const pdfBuffer = await generateInvoiceBuffer({
      items: savedOrder.items,
      email,
      name: shipping?.name,
      orderId: order._id,
      paymentId: "COD",
      totalPrice: savedOrder.totalPrice,
    });

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
      pdfBuffer
    );

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("COD ORDER ERROR:", err);
    res.status(500).json({ success: false });
  }
};

// ================= GET ALL ORDERS =================
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("items.productId")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// ================= USER ORDERS =================
exports.getUserOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId })
    .populate("items.productId")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// ================= UPDATE ORDER STATUS =================
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  await Order.findByIdAndUpdate(req.params.orderId, {
    orderStatus: status,
  });

  res.json({ success: true });
};

// ================= DOWNLOAD INVOICE =================
// (OPTIONAL - you can REMOVE this completely now)
exports.downloadInvoice = async (req, res) => {
  res.status(200).json({
    message: "Invoice is now sent via email. No file download needed.",
  });
};

// ================= SINGLE ORDER =================
exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "items.productId"
    );
    res.json(order);
  } catch (err) {
    console.error("GET SINGLE ORDER ERROR:", err);
    res.status(500).json({ error: "Error fetching order" });
  }
};




exports.getSalesStats = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalProducts = await Product.countDocuments();
    
    const totalRevenue = orders
      .filter(order => order.status !== "Cancelled")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const totalOrders = orders.length;
    
    const productsSold = orders
      .filter(order => order.status !== "Cancelled")
      .reduce((sum, order) => sum + order.items.reduce((iSum, item) => iSum + (item.quantity || 0), 0), 0);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalRevenue,
      totalOrders,
      productsSold,
      totalProducts,
      recentOrders
    });
  } catch (err) {
    console.error("SALES STATS ERROR:", err);
    res.status(500).json({ error: "Error fetching sales stats" });
  }
};
