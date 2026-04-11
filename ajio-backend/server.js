
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// ================== DB ==================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ================== CLOUDINARY CONFIG ==================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ================== MULTER CLOUDINARY STORAGE ==================
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});

const upload = multer({ storage });

// ================== USER MODEL ==================
const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true, sparse: true },
  password: String,
  email: { type: String, unique: true, sparse: true },
  otp: String,
  otpExpiry: Date
});

const User = mongoose.model("User", userSchema);

// ================== PRODUCT MODEL ==================
const productSchema = new mongoose.Schema({
  itemName: String,
  itemQuantity: Number,
  itemPrice: Number,
  category: String,
  image: String // Cloudinary URL
});

const Product = mongoose.model("Product", productSchema);

// ================== ADD ITEM (CLOUDINARY) ==================
app.post("/additem", upload.single("image"), async (req, res) => {
  try {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image upload failed"
      });
    }

    const newProduct = new Product({
      itemName: req.body.itemName,
      itemQuantity: Number(req.body.itemQuantity),
      itemPrice: Number(req.body.itemPrice),
      category: req.body.category,
      image: req.file.path // Cloudinary URL
    });

    await newProduct.save();

    res.json({
      success: true,
      message: "Product added successfully"
    });

  } catch (err) {
    console.log("ADD ITEM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================== GET PRODUCTS ==================
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ================== GET SINGLE PRODUCT ==================
app.get("/product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});

// ================== UPDATE ITEM ==================
app.put("/updateitem/:id", upload.single("image"), async (req, res) => {
  try {

    let data = {
      itemName: req.body.itemName,
      itemQuantity: Number(req.body.itemQuantity),
      itemPrice: Number(req.body.itemPrice),
      category: req.body.category
    };

    if (req.file) {
      data.image = req.file.path; // Cloudinary URL
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true
    });

    res.json({
      success: true,
      product
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error updating product"
    });
  }
});

// ================== DELETE ITEM ==================
app.delete("/product/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

// ================== SERVER ==================


const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  shipping: {
    name: String,
    address: String,
    state: String
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number
    }
  ],

  totalPrice: Number,
  paymentMethod: String,

  razorpayPaymentId: String,
  razorpayOrderId: String,
  paymentStatus: { type: String, default: "pending" },

  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});


const Order = mongoose.model("Order", OrderSchema);
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating order" });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
      email
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
      paymentMethod: "online",
      paymentStatus: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

    await order.save();

    res.json({ success: true });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Order Confirmed - AJIO",
      html: `
        <h2>Order Placed Successfully 🎉</h2>
        <p><b>Payment Method:</b> Online</p>
        <p><b>Total Price:</b> ₹${orderData.totalPrice}</p>
        <p>Thank you for shopping with us!</p>
      `
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


app.post("/orders", async (req, res) => {
  try {
    const {
      userId,
      email,
      shipping,
      items,
      totalPrice
    } = req.body;

    const order = new Order({
      userId,
      shipping,
      items,
      totalPrice,
      paymentMethod: "COD",
      paymentStatus: "pending"
    });

    await order.save();

    res.json({
      success: true,
      message: "Order placed successfully"
    });

    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "COD Order Confirmed - AJIO",
      html: `
        <h2>Order Placed Successfully 🎉</h2>
        <p><b>Payment Method:</b> COD</p>
        <p><b>Total Price:</b> ₹${totalPrice}</p>
        <p>We will deliver your order soon 🚚</p>
      `
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching orders" });
  }
});



app.get("/user-orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching orders" });
  }
});


app.put("/update-order-status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));     