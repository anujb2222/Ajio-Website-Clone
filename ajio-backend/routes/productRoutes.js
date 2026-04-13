const express = require("express");
const router = express.Router();
const multer = require("multer");
const productController = require("../controllers/productController");

const storage = multer.memoryStorage(); // ✅ MUST be memory
const upload = multer({ storage });

router.post("/additem", upload.single("image"), productController.addItem);
router.put("/updateitem/:id", upload.single("image"), productController.updateItem);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.delete("/:id", productController.deleteProduct);

module.exports = router;