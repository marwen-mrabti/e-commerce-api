const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
} = require("../controllers/user.controller");
const { isAuthenticated, authorizePermissions } = require("../middleware/authentication");

/**
 * @route GET /api/v1/user
 * @description Get all users
 * @access Private :: authenticated admin
 * @returns {Promise} [{...user},...]
 */
router.route("/").get(isAuthenticated, authorizePermissions("admin"), getAllUsers);

/**
 * @route GET /api/v1/user/:id
 * @description Get user by id
 * @access Private :: authenticated user/admin
 * @returns {Promise} {...user}
 */
router.route("/:id").get(isAuthenticated, getUserById);

/**
 * @route PATCH /api/v1/user/edit/:id
 * @description Update user
 * @access Private
 * @returns {Promise} {...user}
 */
router.route("/edit/:id").patch(isAuthenticated, updateUser);

/**
 * @route PATCH /api/v1/user/update/password/:id
 * @description Update user password
 * @access Private
 * @returns {Promise} {...user}
 */
router.route("/update/password/:id").patch(isAuthenticated, updatePassword);

/**
 * @route DELETE /api/v1/user/delete/:id
 * @description Delete user
 * @access Private
 * @returns {Promise} {...user}
 */
router.route("/delete/:id").delete(isAuthenticated, deleteUser);

module.exports = router;
