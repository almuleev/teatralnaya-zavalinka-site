const crypto = require("crypto");

const config = require("./config");

function constantTimeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyCredentials(username, password) {
  return constantTimeEqual(username, config.adminUsername) && constantTimeEqual(password, config.adminPassword);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }

  return res.status(401).json({ error: "Требуется авторизация." });
}

module.exports = {
  requireAuth,
  verifyCredentials
};
