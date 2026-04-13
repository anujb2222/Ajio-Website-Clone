const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
require("dotenv").config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


exports.addItem = async (req, res) => {
  try {
    let imageUrl = null;

   
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "ajio_products"
      });
      imageUrl = result.secure_url;

      fs.unlinkSync(req.file.path);
    }

    const newProduct = new Product({
      itemName: req.body.itemName,
      itemQuantity: req.body.itemQuantity,
      itemPrice: req.body.itemPrice,
      category: req.body.category,
      image: imageUrl
    });

    await newProduct.save();
    res.json({ success: true, message: "Product added" });
  } catch (err) {
    console.error("ADD ITEM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateItem = async (req, res) => {
  try {
    let data = {
      itemName: req.body.itemName,
      itemQuantity: Number(req.body.itemQuantity),
      itemPrice: Number(req.body.itemPrice),
      category: req.body.category
    };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "ajio_products"
      });
      data.image = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).send("Error updating product");
  }
};


exports.deleteItem = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product.image) {
     
      const publicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`ajio_products/${publicId}`);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};