const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  itemName: String,
  itemQuantity: Number,
  itemPrice: Number,
  category: String,
  image: String
});

module.exports = mongoose.model("Product", productSchema);