const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

//Place Order (Customer Only)
exports.placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items } = req.body;
    const customerId = req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order cannot be empty" });
    }

    const vendorOrders = {};
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || product.stock < item.quantity) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${item.productId}` });
      }

      product.stock -= item.quantity;
      await product.save({ session });

      // Group orders by vendor
      if (!vendorOrders[product.vendorId]) {
        vendorOrders[product.vendorId] = {
          vendorId: product.vendorId,
          items: [],
          totalAmount: 0,
        };
      }
      vendorOrders[product.vendorId].items.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price * item.quantity,
      });
      vendorOrders[product.vendorId].totalAmount +=
        product.price * item.quantity;
      totalAmount += product.price * item.quantity;
    }

    //Master Order
    const masterOrder = new Order({
      customerId,
      totalAmount,
      orderType: "master",
      items,
    });

    await masterOrder.save({ session });

    //Sub-Orders for each vendor
    for (const vendorId in vendorOrders) {
      const subOrder = new Order({
        customerId,
        vendorId,
        orderType: "sub",
        parentOrderId: masterOrder._id,
        ...vendorOrders[vendorId],
      });
      await subOrder.save({ session });
    }

    await session.commitTransaction();
    res.status(201).json({ message: "Order placed successfully", masterOrder });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
};

// Customer Orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id }).populate(
      "items.productId"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Vendor Orders
exports.getVendorOrders = async (req, res) => {
  try {
    if (req.user.role !== "vendor")
      return res.status(403).json({ message: "Access denied" });

    const orders = await Order.find({ vendorId: req.user._id }).populate(
      "items.productId"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Confirm Order (Vendor Only)
exports.confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    order.status = "confirmed";
    await order.save();
    res.json({ message: "Order confirmed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
