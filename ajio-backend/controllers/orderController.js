const Order = require("../models/Order");
const Product = require("../models/Product");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const axios = require("axios");

const { generateInvoiceBuffer } = require("../utils/generateinvoice");


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


exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("items.productId")
    .sort({ createdAt: -1 });

  res.json(orders);
};


exports.getUserOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId })
    .populate("items.productId")
    .sort({ createdAt: -1 });

  res.json(orders);
};



exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    console.log(`Updating order ${orderId} to status: ${status}`);

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      console.log(`Order ${orderId} not found`);
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    console.log(`Order ${orderId} updated successfully to ${updatedOrder.status}`);
    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};




exports.downloadInvoice = async (req, res) => {
  res.status(200).json({
    message: "Invoice is now sent via email. No file download needed.",
  });
};

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
    const orders = await Order.find().populate("items.productId");
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

   
    const monthlySales = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    orders.forEach(order => {
      if (order.status !== "Cancelled") {
        const date = new Date(order.createdAt);
        const month = months[date.getMonth()];
        monthlySales[month] = (monthlySales[month] || 0) + order.totalPrice;
      }
    });

    const barChartData = months.map(month => ({
      name: month,
      sales: monthlySales[month] || 0
    }));

   
    const categorySales = {};
    orders.forEach(order => {
      if (order.status !== "Cancelled") {
        order.items.forEach(item => {
          if (item.productId && item.productId.category) {
            const cat = item.productId.category;
            categorySales[cat] = (categorySales[cat] || 0) + (item.quantity || 0);
          }
        });
      }
    });

    const pieChartData = Object.keys(categorySales).map(cat => ({
      name: cat,
      value: categorySales[cat]
    }));

    res.json({
      totalRevenue,
      totalOrders,
      productsSold,
      totalProducts,
      recentOrders,
      barChartData,
      pieChartData
    });
  } catch (err) {
    console.error("SALES STATS ERROR:", err);
    res.status(500).json({ error: "Error fetching sales stats" });
  }
};

