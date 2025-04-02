const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getRevenuePerVendor,
  getTopProducts,
  getAverageOrderValue,
  getVendorSales,
  getLowStockProducts,
} = require("../controllers/analyticsController");

const router = express.Router();

// Admin Analytics
router.get("/admin/revenue", protect, getRevenuePerVendor);
router.get("/admin/top-products", protect, getTopProducts);
router.get("/admin/average-order-value", protect, getAverageOrderValue);

// Vendor Analytics
router.get("/vendor/sales", protect, getVendorSales);
router.get("/vendor/low-stock", protect, getLowStockProducts);

module.exports = router;
