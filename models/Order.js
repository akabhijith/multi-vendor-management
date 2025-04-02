const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // For sub-orders
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number},
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    orderType: { type: String, enum: ["master", "sub"], required: true },
    parentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // Only for sub-orders
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
