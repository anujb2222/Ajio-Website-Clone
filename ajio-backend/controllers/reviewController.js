const mongoose = require("mongoose");
const Review = require("../models/Review");
const Order = require("../models/Order");

// 👉 ADD REVIEW
exports.addReview = async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    console.log("👉 REQUEST BODY:", req.body);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    const allOrders = await Order.find({ userId });
    console.log("👉 ALL ORDERS FOR USER:", allOrders);

    const orderExists = await Order.findOne({
      userId,
      "items.productId": productObjectId
    });

    console.log("👉 ORDER EXISTS:", orderExists);

    // ⚠️ TEMPORARILY DISABLED FOR TESTING
    // if (!orderExists) {
    //   return res.status(403).json({
    //     message: "You must purchase before reviewing"
    //   });
    // }

    const review = await Review.create({
      userId,
      productId: productObjectId,
      rating,
      comment
    });

    return res.json({
      message: "Review added successfully",
      review
    });

  } catch (err) {
    console.log("🔥 REVIEW ERROR:", err);

    return res.status(500).json({
      message: "Server error while adding review",
      error: err.message
    });
  }
};

// 👉 GET REVIEWS
exports.getReviews = async (req, res) => {
  try {
    const productObjectId = new mongoose.Types.ObjectId(req.params.productId);

    const reviews = await Review.find({
      productId: productObjectId
    }).sort({ createdAt: -1 });

    res.json(reviews);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};