const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// Revenue per vendor (last 30 days)
exports.getRevenuePerVendor = async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          orderType: "sub",
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: "$vendorId",
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Top 5 products by sales
exports.getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          name: "$product.name",
          totalSold: 1,
        },
      },
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Average order value
exports.getAverageOrderValue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: { orderType: "master", status: { $ne: "cancelled" } },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          averageOrderValue: { $divide: ["$totalRevenue", "$totalOrders"] },
        },
      },
    ]);

    res.json(result[0] || { averageOrderValue: 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Vendor Sales (last 7 days)
exports.getVendorSales = async (req, res) => {
  try {
    if (req.user.role !== "vendor") return res.status(403).json({ message: "Access denied" });

    const vendorId = new mongoose.Types.ObjectId(req.user._id);
    const sales = await Order.aggregate([
      {
        $match: {
          vendorId: vendorId,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Low-stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    if (req.user.role !== "vendor") return res.status(403).json({ message: "Access denied" });

    const lowStock = await Product.find({
      vendorId: req.user._id,
      stock: { $lte: 5 },
    });

    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
