const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

// GET user addresses
router.get("/:userId", addressController.getAddresses);

// ADD address
router.post("/", addressController.addAddress);

// DELETE address
router.delete("/:id", addressController.deleteAddress);

module.exports = router;