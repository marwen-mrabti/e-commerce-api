const jwt = require("jsonwebtoken");

/**
 *@description Create a jwt token
 * @param {*} payload { id, role, name}
 * @returns {string} token
 */
const createJwt = ({ payload }) => {
  const token = jwt.sign({ ...payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

/**
 * @description Check if the token is valid
 * @param {string} token
 * @returns decoded token {_id,role,name }
 */
const isTokenValid = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * @description Attach the token to the response
 * @param {*} res
 * @param {*} token
 * @returns void
 */
const attachCookiesToResponse = (res, token) => {
  const cookieExpiryDate = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hour from now nh*60mn*60s*1000ms
  res.cookie("token", token, {
    httpOnly: true, // prevent client side js from reading the cookie :: help prevent cross site scripting attacks (XSS attacks)
    expires: cookieExpiryDate, // (in ms)
    secure: process.env.NODE_ENV === "production", // only send cookie over https
    signed: true, // prevent client side tampering
  });
};

module.exports = {
  createJwt,
  isTokenValid,
  attachCookiesToResponse,
};
