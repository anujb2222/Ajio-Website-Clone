const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");


router.get("/:userId", addressController.getAddresses);


router.post("/", addressController.addAddress);




module.exports = router;