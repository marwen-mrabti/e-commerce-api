const express = require("express");
const router = express.Router();

const { userLogin, userRegister, userLogout } = require("../controllers/auth.controller");

/**
 * @route POST /api/v1/auth/register
 * @desc Register a user
 * @access Public
 */
router.route("/register").post(userRegister);

/**
 * @route POST /api/v1/auth/login
 * @desc Login a user
 * @access Public
 */
router.route("/login").post(userLogin);

/**
 * @route GET /api/v1/auth/logout
 * @desc Logout a user
 * @access Private
 */
router.route("/logout").get(userLogout);

module.exports = router;
