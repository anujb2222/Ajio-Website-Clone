const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs =  require("fs");



const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/ajioLogin")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

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
    res.status(201).json({ success: true, message: "Registered successfully" });
  } catch (err) {
    console.log("Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const user = await User.findOne({ phone });
    if (!user || user.password !== password) {
      return res.status(400).json({ success: false, message: "Invalid phone or password" });
    }

    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.log("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});







const multer = require("multer");
const path = require("path");
const { constants } = require("buffer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

const productSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  itemQuantity: { type: Number, required: true },
  itemPrice: { type: Number, required: true },
  image: { type: String },
});

const Product = mongoose.model("Product", productSchema);

app.post("/additem", upload.single("image"), async (req, res) => {
  try {
    const { itemName, itemQuantity, itemPrice } = req.body;

    const newProduct = new Product({
      itemName,
      itemQuantity,
      itemPrice,
      image: req.file ? req.file.filename : null,
    });

    await newProduct.save();
    res.json({ success: true, message: "Product added successfully" });
  } catch (err) {
    console.log("Add Product error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});





app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});



app.delete("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.json({ message: "Product not found" });
    }

    const imagePath = "uploads/" + product.image;
  

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted " });

  } catch (error) {
    console.log(error);
    res.json({ message: "Error" });
  }
});



app.put("/updateitem/:id", upload.single("image"), async (req, res) => {
  try {
    let data = {
      itemName: req.body.itemName,
      itemQuantity: req.body.itemQuantity,
      itemPrice: req.body.itemPrice
    };

    if (req.file) {
      data.image = req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });

    res.json(product);
  } catch (error) {
    res.status(500).send("Error updating product");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));