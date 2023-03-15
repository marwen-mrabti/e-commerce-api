const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/not-found");
const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");

/**
 *  @desc    Get all reviews
 * @route   GET /api/v1/reviews
 * @access  Public
 * @param   {String} productId
 */
const getReviewsByProduct = async (req, res, next) => {
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
const getReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId)
    .populate({
      path: "user",
      select: "name email",
    })
    .populate({
      path: "product",
      select: "name company",
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
 * @param   {String} review
 * @param   {Number} rating
 * @param   {String} title
 * @param   {String} comment
 */
const createReview = async (req, res, next) => {
  const { productId } = req.params;
  const { id: userId } = req.user;
  const { review, rating, title, comment } = req.body;

  const product = await Product.findById(productId);
  const user = await User.findById(userId);
  if (!product || !user) {
    throw new NotFoundError("Product or User not found");
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
const updateReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await Review.findByIdAndUpdate(
    reviewId,
    {
      $set: req.body,
    },
    { new: true, runValidators: true }
  );
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
const deleteReview = async (req, res, next) => {
  res.status(StatusCodes.CREATED).json("res.review");
};

module.exports = {
  getReviewsByProduct,
  getReview,
  createReview,
  updateReview,
  deleteReview,
};
