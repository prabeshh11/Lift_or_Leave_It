'use strict';
const requireAuth = require('./requireAuth');

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin')
      return res.status(403).json({ error: 'Admin access required' });
    next();
  });
}

module.exports = requireAdmin;