const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");

// ✅ ADD REVIEW
exports.addReview = async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    // 🔥 Validate user
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(400).json({ error: "Invalid userId" });
    }

 const review = await Review.create({
  userId,
  productId,
  rating,
  comment
});
    res.json({ message: "Review added successfully", review });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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

// ✅ GET USER REVIEWS
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ userId })
      .populate("userId", "email")
      .populate("productId") // ✅ IMPORTANT
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};