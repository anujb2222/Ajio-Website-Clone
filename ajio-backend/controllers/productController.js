const Product = require("../models/Product");
const fs = require("fs");


exports.addItem = async (req, res) => {
  try {
    const newProduct = new Product({
      itemName: req.body.itemName,
      itemQuantity: req.body.itemQuantity,
      itemPrice: req.body.itemPrice,
      category: req.body.category,
      image: req.file ? req.file.filename : null
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

    if (req.file) data.image = req.file.filename;

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
      const imagePath = "uploads/" + product.image;
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};