const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/create-order", orderController.createOrder);
router.post("/verify-payment", orderController.verifyPayment);


router.post("/", orderController.placeCODOrder);


router.get("/", orderController.getAllOrders);
router.get("/user-orders/:userId", orderController.getUserOrders);


router.put("/update-order-status/:orderId", orderController.updateOrderStatus);


router.get("/single/:orderId", orderController.getSingleOrder);

module.exports = router;