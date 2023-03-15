const express = require("express");
const router = express.Router();

const { isAuthenticated, authorizePermissions } = require("../middleware/authentication");
const {
  createReview,
  getReviewsByProduct,
  getReview,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

/**
 * @desc    Get all reviews
 * @route   GET /api/v1/reviews
 * @access  Public
 */
router.route("/byProduct/:productId").get(getReviewsByProduct);

/**
 * @desc    Get a review
 * @route   GET /api/v1/reviews/:reviewId
 * @access  Public
 */
router.route("/:reviewId").get(getReview);

/**
 * @desc    Create a review
 * @route   POST /api/v1/reviews/new
 * @access  Private
 */
router
  .route("/new/:productId")
  .post(isAuthenticated, authorizePermissions("admin", "user"), createReview);

/**
 * @desc    Update a review
 * @route   PATCH /api/v1/reviews/edit/:reviewId
 * @access  Private
 */
router
  .route("/edit/:reviewId")
  .patch(isAuthenticated, authorizePermissions("admin", "user"), updateReview);

/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/reviews/delete/:reviewId
 * @access  Private
 */
router
  .route("/delete/:reviewId")
  .delete(isAuthenticated, authorizePermissions("admin", "user"), deleteReview);
module.exports = router;
