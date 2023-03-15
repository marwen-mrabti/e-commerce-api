const UnauthenticatedError = require("../errors/unauthenticated");
const UnauthorizedError = require("../errors/unauthorized");
const { isTokenValid } = require("../utils");

/**
 * @description Check if the user is authenticated
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const isAuthenticated = (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new UnauthenticatedError("You are not authenticated");
  }

  try {
    const user = isTokenValid(token);
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    console.log(error);
    throw new UnauthenticatedError("You are not authenticated");
  }
};

/**
 *@description Check if the user is authorized to access the route
 * @param  {String[]} roles
 */
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("You are not authorized");
    }
    next();
  };
};



module.exports = {
  isAuthenticated,
  authorizePermissions,
};
