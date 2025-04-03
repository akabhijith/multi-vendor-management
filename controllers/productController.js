const Product = require("../models/Product");
const redisClient = require("../config/redis");

// Create Product (Vendor Only)
exports.createProduct = async (req, res) => {
  try {
    if (req.user.role !== "vendor")
      return res.status(403).json({ message: "Access denied" });

    const product = await Product.create({
      ...req.body,
      vendorId: req.user._id,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const cachedProducts = await redisClient.get("products");
    if (cachedProducts) {
      return res.json(JSON.parse(cachedProducts));
    }
    const products = await Product.find();
    await redisClient.set("products", JSON.stringify(products), "EX", 3600);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Vendor's Products (Vendor Only)
exports.getVendorProducts = async (req, res) => {
  try {
    if (req.user.role !== "vendor")
      return res.status(403).json({ message: "Access denied" });

    const products = await Product.find({ vendorId: req.user._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Product (Vendor Only)
exports.updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "vendor")
      return res.status(403).json({ message: "Access denied" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.vendorId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Product (Vendor Only)
exports.deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "vendor")
      return res.status(403).json({ message: "Access denied" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.vendorId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
