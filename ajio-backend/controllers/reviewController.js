const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");


// ✅ Add Review
exports.addReview = async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    // Validate user
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    // ✅ Validate product
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(400).json({ error: "Invalid productId" });
    }

    // ✅ Prevent duplicate review
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({
        error: "You already reviewed this product"
      });
    }

    // ✅ Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5"
      });
    }

    const review = await Review.create({
      userId,
      productId,
      rating,
      comment
    });

    res.json({
      message: "Review added successfully",
      review
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// ✅ Get All Reviews (Admin)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "email phone")
      .populate("productId", "itemName image")
      .sort({ createdAt: -1 });

    res.json(reviews);

  } catch (err) {
    console.error("Error in getAllReviews:", err);
    res.status(500).json({
      error: "Server error while fetching reviews"
    });
  }
};


// ✅ Get Reviews by Product
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId
    }).populate("userId", "email");

    res.json(
      reviews.map((r) => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        userEmail: r.userId ? r.userId.email : "Unknown User"
      }))
    );

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Get Reviews by User
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