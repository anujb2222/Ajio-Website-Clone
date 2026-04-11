require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const Razorpay = require("razorpay");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true, sparse: true },
  password: String,
  email: { type: String, unique: true, sparse: true },
  otp: String,
  otpExpiry: Date
});

const User = mongoose.model("User", userSchema);


app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    await User.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { upsert: true, new: true }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Login",
      text: `Your OTP is: ${otp}`
    });

    res.json({ success: true, message: "OTP sent successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});


app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ message: "OTP expired" });

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: "Login successful",
      userId: user._id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/register", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    await User.create({ phone, password });

    res.json({
      success: true,
      message: "Registered successfully"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user || user.password !== password) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Login successful",
      userId: user._id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

const productSchema = new mongoose.Schema({
  itemName: String,
  itemQuantity: Number,
  itemPrice: Number,
  category: String,
  image: String // Cloudinary URL
});

const Product = mongoose.model("Product", productSchema);


app.post("/additem", upload.single("image"), async (req, res) => {
  try {
    const newProduct = new Product({
      itemName: req.body.itemName,
      itemQuantity: req.body.itemQuantity,
      itemPrice: req.body.itemPrice,
      category: req.body.category,
      image: req.file ? req.file.path : null
    });

    await newProduct.save();

    res.json({ success: true, message: "Product added" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get("/product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});

app.put("/updateitem/:id", upload.single("image"), async (req, res) => {
  try {
    let data = {
      itemName: req.body.itemName,
      itemQuantity: Number(req.body.itemQuantity),
      itemPrice: Number(req.body.itemPrice),
      category: req.body.category
    };
    if (req.file) data.image = req.file.filename;
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).send("Error updating product");
  }
});

app.delete("/product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product.image) {
    const imagePath = "uploads/" + product.image;
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});




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