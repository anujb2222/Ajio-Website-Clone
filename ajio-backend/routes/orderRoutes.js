const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// PAYMENT
router.post("/create-order", orderController.createOrder);
router.post("/verify-payment", orderController.verifyPayment);

// ORDER
router.post("/", orderController.placeCODOrder);

// GET ORDERS
router.get("/", orderController.getAllOrders);
router.get("/user-orders/:userId", orderController.getUserOrders);

// UPDATE
router.put("/update-order-status/:orderId", orderController.updateOrderStatus);

// SINGLE ORDER (SAFE ROUTE)
router.get("/single/:orderId", orderController.getSingleOrder);

module.exports = router;