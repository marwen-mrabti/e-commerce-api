const User = require("../models/User");
const NotFoundError = require("../errors/not-found");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/bad-request");
const UnauthenticatedError = require("../errors/unauthenticated");
const { attachCookiesToResponse, createJwt } = require("../utils/jwt");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.status(StatusCodes.OK).json(users);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * @description Get user by id
 * @access Private :: authenticated user/admin
 * @param {*} req
 * @param {*} res
 * @returns {Promise} {...user}
 */
const getUserById = async (req, res) => {
  const { id } = req.params;
  if (req.user.id !== id && req.user.role !== "admin") {
    throw new UnauthenticatedError("You are not authorized");
  }
  const user = await User.findById(id).select("-password").populate("reviews");
  if (!user) {
    throw new NotFoundError("User not found");
  }
  res.status(StatusCodes.OK).json(user);
};

/**
 * @description Update user
 * @access Private
 * @param {*} req
 * @param {*} res
 */
const updateUser = async (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;

  if (!name && !email) {
    throw new BadRequestError("name and email are required");
  }

  if (req.user.id !== id && req.user.role !== "admin") {
    throw new UnauthenticatedError("You are not authorized");
  }
  let user = await User.findById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  user = await User.findByIdAndUpdate(
    id,
    { $set: { name, email } },
    { new: true, runValidators: true }
  ).select("-password");

  if (req.user.role !== "admin") {
    const token = createJwt({
      payload: { id: user._id, role: user.role, name: user.name },
    });
    await attachCookiesToResponse(res, token);
  }

  res.status(StatusCodes.OK).json(user);
};

/**
 * @description Update user password
 * @access Private
 * @param {*} req
 * @param {*} res
 */
const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { password, newPassword } = req.body;
  if (!password || !newPassword) {
    throw new BadRequestError("password and new password are required");
  }

  if (req.user.id !== id && req.user.role !== "admin") {
    throw new UnauthenticatedError("You are not authorized");
  }
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch && req.user.role !== "admin") {
    throw new BadRequestError("Incorrect password");
  }

  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Password updated successfully" });
};

const deleteUser = async (req, res) => {};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword,
};
