const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");

// add review
router.post("/", reviewController.addReview);

// get reviews
router.get("/:productId", reviewController.getReviews);

module.exports = router;