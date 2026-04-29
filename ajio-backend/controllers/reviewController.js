const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product"); 

exports.addReview = async (req, res) => {
  try {
    const { userId, productId, orderId, rating, comment } = req.body;

    // ❌ prevent null orderId
    if (!orderId) {
      return res.status(400).json({
        error: "orderId is required for review"
      });
    }

    // optional: prevent duplicates manually (better UX)
    const existing = await Review.findOne({
      userId,
      productId,
      orderId
    });

    if (existing) {
      return res.status(400).json({
        error: "You already reviewed this product in this order"
      });
    }

    const review = await Review.create({
      userId,
      productId,
      orderId,
      rating,
      comment
    });

    res.json({ message: "Review added", review });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    console.log("Fetching all reviews...");
    const reviews = await Review.find()
      .populate("userId", "email phone")
      .populate("productId", "itemName image")
      .sort({ createdAt: -1 });
    console.log(`Found ${reviews.length} reviews`);
    res.json(reviews);
  } catch (err) {
    console.error("CRITICAL ERROR in getAllReviews:", err);
    res.status(500).json({ 
      error: "Server error while fetching reviews",
      details: err.message 
    });
  }
};


exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate("userId");

    res.json(
      reviews.map(r => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        userEmail: r.userId ? r.userId.email : "Unknown User"
      }))
    );

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};


exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ userId })
      .populate("userId", "email")
      .populate("productId") 
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};