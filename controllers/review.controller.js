const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors/custom-api");
const NotFoundError = require("../errors/not-found");
const UnauthorizedError = require("../errors/unauthorized");
const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");

/**
 *  @desc    Get all reviews
 * @route   GET /api/v1/reviews
 * @access  Public
 * @param   {String} productId
 */
const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError("Product not found");
  }
  const reviews = await Review.find({ product: productId });

  res.status(StatusCodes.OK).json(reviews);
};

/**
 * @desc    Get a review
 * @route   GET /api/v1/reviews/:reviewId
 * @access  Public
 * @param   {String} reviewId
 */
const getReview = async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId)
    .populate({
      path: "user",
      select: "name email",
    })
    .populate({
      path: "product",
      select: "name company",
      //use this to populate a sub-sub-document review-->product-->user:creator
      populate: {
        path: "user",
        select: "name email",
      },
    });

  if (!review) {
    throw new NotFoundError("Review not found");
  }

  res.status(StatusCodes.OK).json(review);
};

/**
 * @desc    Create a review
 * @route   POST /api/v1/reviews/new
 * @access  Private
 * @param   {String} productId
 * @param   {String} userId
 * @param   {String} title
 * @param   {String} comment
 * @param   {Number} rating
 */
const createReview = async (req, res) => {
  const { productId } = req.params;
  const { id: userId } = req.user;
  const { rating, title, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const alreadyReviewed = await Review.findOne({ product: productId, user: userId });
  if (alreadyReviewed) {
    throw new CustomAPIError("You have already reviewed this product");
  }

  const newReview = await Review.create({
    product: productId,
    user: userId,
    rating,
    title,
    comment,
  });

  res.status(StatusCodes.CREATED).json(newReview);
};

/**
 * @desc    Update a review
 * @route   PATCH /api/v1/reviews/edit/:reviewId
 * @access  Private
 * @param   {String} reviewId
 */
const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    throw new UnauthorizedError(
      "You are not authorized to make modifications this review"
    );
  }

  review.rating = rating ? rating : review.rating;
  review.title = title ? title : review.title;
  review.comment = comment ? comment : review.comment;
  await review.save();

  res.status(StatusCodes.OK).json(review);
};

/**
 * @desc    Delete a review
 *  @route   DELETE /api/v1/reviews/delete/:reviewId
 * @access  Private
 * @param   {String} reviewId
 * @param   {String} productId
 * @param   {String} userId
 */
const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    throw new UnauthorizedError("You are not authorized to delete this review");
  }
  await review.remove();
  res.status(StatusCodes.OK).json({ message: "Review deleted" });
};

module.exports = {
  getReviewsByProduct,
  getReview,
  createReview,
  updateReview,
  deleteReview,
};
