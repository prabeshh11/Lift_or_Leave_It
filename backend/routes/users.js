'use strict';
const express     = require('express');
const pool        = require('../db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// GET /api/users/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id, u.username, u.email, u.role, u.job_role, u.created_at,
        COUNT(s.id)::int                                        AS total_sessions,
        COALESCE(ROUND(AVG(s.total_score)::numeric, 1), 0)     AS avg_score,
        COALESCE(MAX(s.total_score), 0)                         AS best_score,
        COALESCE(ROUND(100.0 * SUM(CASE WHEN s.passed THEN 1 ELSE 0 END) /
          NULLIF(COUNT(s.id), 0), 1), 0)                       AS pass_rate
      FROM users u
      LEFT JOIN sessions s ON s.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [req.user.userId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[users/me]', err.message);
    return res.status(500).json({ error: 'Could not load profile' });
  }
});

module.exports = router;