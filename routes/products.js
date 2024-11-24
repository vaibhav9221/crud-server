const express = require("express");
const Product = require("../models/product");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Create Product
router.post("/", authMiddleware, async (req, res) => {
  try {
    // The authenticated user ID is available in req.user after the middleware
    const product = new Product({
      ...req.body,
      userId: req.user.id,  // Associate the product with the logged-in user
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Retrieve all products for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id }); // Only fetch products belonging to the logged-in user
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve a single product by ID (only if the product belongs to the logged-in user)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, userId: req.user.id }); // Ensure the product belongs to the user
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Product
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    // Ensure the product belongs to the user before updating
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, // Only allow updates for the logged-in user's products
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Product
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Ensure the product belongs to the user before deleting
    const product = await Product.findOneAndDelete({ _id: req.params.id, userId: req.user.id }); // Only allow deletion for the logged-in user's products
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
