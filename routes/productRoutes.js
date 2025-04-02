const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { validateProduct } = require("../middleware/validationMiddleware");
const {
  createProduct,
  getProducts,
  getVendorProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// Public: Get all products
router.get("/", getProducts);

// Vendor: Manage products
router.post("/", protect, validateProduct, createProduct);
router.get("/vendor", protect, getVendorProducts);
router.put("/:id", protect, validateProduct, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
