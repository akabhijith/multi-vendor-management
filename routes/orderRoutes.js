const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  placeOrder,
  getCustomerOrders,
  getVendorOrders,
  confirmOrder,
} = require("../controllers/orderController");

const router = express.Router();

// Customer Order APIs
router.post("/", protect, placeOrder);
router.get("/", protect, getCustomerOrders);

// Vendor Order APIs
router.get("/vendor", protect, getVendorOrders);
router.put("/:id/confirm", protect, confirmOrder);

module.exports = router;
