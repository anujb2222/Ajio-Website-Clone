const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const productController = require("../controllers/productController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post("/additem", upload.single("image"), productController.addItem);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.put("/updateitem/:id", upload.single("image"), productController.updateItem);
router.delete("/:id", productController.deleteItem);

module.exports = router;