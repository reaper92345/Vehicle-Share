// Admin authentication middleware
// Verifies JWT and checks if user has admin role
const jwt = require('jsonwebtoken');
const { pool } = require('../db/pool');

const ADMIN_ROLE = 'admin'; // adjust according to your role definitions

function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Assuming payload contains user id and role
    if (payload.role !== ADMIN_ROLE) {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }
    // Attach user info to request for downstream handlers
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token', details: err.message });
  }
}

module.exports = { verifyAdmin };
