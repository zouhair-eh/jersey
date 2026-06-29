/**
 * @file auth.middleware.js
 * @description Authentication middleware to protect API routes.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Protect routes by requiring a valid JWT token.
 */
exports.protect = async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check for token in cookies (if cookie-parser is configured in server.js)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Attach user to the request object
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this token',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'This user account is inactive',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

/**
 * Grant access to specific roles.
 * Example usage: authorize('admin', 'expert')
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles.some((role) => roles.includes(role))) {
      return res.status(403).json({
        success: false,
        message: `User role is not authorized to access this route`,
      });
    }
    next();
  };
};
