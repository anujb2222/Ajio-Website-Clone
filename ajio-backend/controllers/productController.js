const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ajio_products" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

exports.addItem = async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      const result = await uploadFromBuffer(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const newProduct = new Product({
      itemName: req.body.itemName,
      itemQuantity: Number(req.body.itemQuantity),
      itemPrice: Number(req.body.itemPrice),
      category: req.body.category,
      image: imageUrl
    });

    await newProduct.save();

    res.json({
      success: true,
      message: "Product added",
      product: newProduct
    });

  } catch (err) {
    console.error("ADD ITEM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const data = {
      itemName: req.body.itemName,
      itemQuantity: Number(req.body.itemQuantity),
      itemPrice: Number(req.body.itemPrice),
      category: req.body.category
    };

    if (req.file) {
      const result = await uploadFromBuffer(req.file.buffer);
      data.image = result.secure_url;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      product
    });

  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product deleted"
    });

  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};