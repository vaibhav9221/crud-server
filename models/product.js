const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: { type: Number, required: true },
  category: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the user who owns the product
    ref: "User",  // Assuming you have a User model
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
