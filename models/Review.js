const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating cannot be empty"],
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);
