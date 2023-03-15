const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const BadRequestError = require("../errors/bad-request");
const User = require("../models/User");
const { createJwt } = require("../utils");
const { attachCookiesToResponse } = require("../utils/jwt");

/**
 * @description Register a user
 * @param {*} req
 * @param {*} res
 * @returns {Promise} {object} user
 */
const userRegister = async (req, res) => {
  const { name, email, password, role } = req.body;
  //step 1: check the user inputs
  if (!name || !email || !password) {
    throw new BadRequestError("Please enter all fields"); // this will be caught by the error handler and return a 400
  }

  //step 2: check if the email is already registered
  const user = await User.findOne({ email });

  if (user) {
    throw new BadRequestError("User already exists");
  }

  //step 3: create a new user
  const newUser = new User({
    name,
    email,
    password, // we are running the password through the pre-save hook in the User model to hash it
    role: role || "user",
  });

  //step 4: save the new user to the database
  await newUser.save();

  //step 5: create a jwt token for the new user
  const token = createJwt({
    payload: { id: newUser._id, role: newUser.role, name: newUser.name },
  });

  //send token within cookies to the client
  await attachCookiesToResponse(res, token);

  //send token to the client
  res.status(StatusCodes.CREATED).json({ name: newUser.name, token });
};

/**
 * @description login a user
 * @param {*} req
 * @param {*} res
 * @returns {Promise} {object} user
 */
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please enter all fields");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("User does not exist");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new BadRequestError("Invalid credentials");
  }

  //create a jwt token for the user
  const token = createJwt({
    payload: { id: user._id, role: user.role, name: user.name },
  });
  //send token within cookies to the client
  await attachCookiesToResponse(res, token);
  //send token to the client
  res.status(StatusCodes.OK).json({ name: user.name, token });
};

/**
 * @description logout a user
 * @param {*} req
 * @param {*} res
 * @returns void
 */
const userLogout = async (req, res) => {
  res.cookie("token", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({ message: "Logout successful" });
};

module.exports = {
  userRegister,
  userLogin,
  userLogout,
};
