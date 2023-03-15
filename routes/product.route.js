const express = require("express");
const router = express.Router();

const { isAuthenticated, authorizePermissions } = require("../middleware/authentication");
const { uploadImage } = require("../middleware/uploadImage");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

/**
 * @desc    Get all products
 * @method GET
 * @route   GET /api/v1/products
 * @access  Public
 */
router.route("/").get(getProducts);

/**
 * @desc    Get single product
 * @method GET
 * @route   GET /api/v1/products/:productId
 * @access  Public
 */
router.route("/:productId").get(getProductById);

/**
 * @desc    Create a product
 * @method POST
 * @route   POST /api/v1/products/new
 * @access  Private (admin)
 */
router
  .route("/new")
  .post(isAuthenticated, authorizePermissions("admin"), uploadImage, createProduct);

/**
 * @desc   Update a product
 * @method PATCH
 * @route  PUT /api/v1/products/edit/:productId
 * @access Private (admin)
 */
router
  .route("/edit/:productId")
  .patch(isAuthenticated, authorizePermissions("admin"), uploadImage, updateProduct);

/**
 * @desc  Delete a product
 * @method DELETE
 * @route DELETE /api/v1/products/delete/:productId
 * @access Private (admin)
 */
router
  .route("/delete/:productId")
  .delete(isAuthenticated, authorizePermissions("admin"), deleteProduct);

module.exports = router;
