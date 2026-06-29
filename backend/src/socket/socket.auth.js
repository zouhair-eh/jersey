/**
 * @file socket.auth.js
 * @description Socket.io middleware that validates the JWT sent in the
 *              connection handshake and attaches the decoded user to socket.data.
 *
 * The client must send the token in the auth object:
 *   const socket = io(SERVER_URL, { auth: { token: '<jwt>' } });
 */

const jwt = require('jsonwebtoken');

/**
 * @param {import('socket.io').Socket} socket
 * @param {Function} next
 */
function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('AUTH_REQUIRED: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user payload to socket for use in event handlers
    socket.data.userId = decoded.id ?? decoded._id ?? decoded.sub;
    socket.data.roles  = decoded.roles ?? ['client'];

    next();
  } catch {
    next(new Error('AUTH_INVALID: Token is invalid or expired'));
  }
}

module.exports = { socketAuthMiddleware };
