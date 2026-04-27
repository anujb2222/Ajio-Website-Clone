const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");


router.get("/all", reviewController.getAllReviews);
router.post("/", reviewController.addReview);
router.get("/user/:userId", reviewController.getUserReviews);
router.get("/:productId", reviewController.getReviews);

module.exports = router;