import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AuthenticationError, AuthorizationError } from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AuthenticationError("Access denied. No token provided");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new AuthenticationError("Token is no longer valid");
    }
    if (!user.isActive) {
      throw new AuthenticationError("Account is deactivated");
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new AuthenticationError("Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      throw new AuthenticationError("Token expired");
    }
    throw error;
  }
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError(
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }
    next();
  };
};
