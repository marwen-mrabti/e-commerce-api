const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Rating cannot be empty"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "Title cannot be empty"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Review cannot be empty"],
      trim: true,
    },
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
  },
  { timestamps: true }
);

// Prevent user from submitting more than one review per product
//use compound index
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        //the review will be grouped by product
        _id: "$product",
        //calculate average rating
        averageRating: { $avg: "$rating" },
        //calculate number of reviews
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("Product").findByIdAndUpdate(
      productId,
      {
        $set: {
          averageRating: result[0]?.averageRating || 0,
          numOfReviews: result[0]?.numOfReviews || 0,
        },
      },
      { new: true }
    );
  } catch (error) {
    console.log(error);
  }
};

//increment numOfReviews and averageRating in Product model after saving a review
reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRating(this.product);
});

//decrement numOfReviews and averageRating in Product model after removing a review
reviewSchema.post("remove", async function () {
  console.log("Review removed");
});

module.exports = mongoose.model("Review", reviewSchema);
