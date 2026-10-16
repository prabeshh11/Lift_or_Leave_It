'use strict';
const express      = require('express');
const pool         = require('../db');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();
router.use(requireAdmin);

// GET /api/admin/players
router.get('/players', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.job_role, u.created_at, u.last_login,
        COUNT(s.id)::int AS total_sessions,
        COALESCE(ROUND(AVG(s.total_score)::numeric,1),0) AS avg_score,
        MAX(s.completed_at) AS last_played
      FROM users u LEFT JOIN sessions s ON s.user_id = u.id
      WHERE u.role = 'player' GROUP BY u.id ORDER BY u.created_at DESC
    `);
    return res.json(result.rows);
  } catch (err) {
    console.error('[admin/players]', err.message);
    return res.status(500).json({ error: 'Could not load players' });
  }
});

// GET /api/admin/players/:id
router.get('/players/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });
  try {
    const userResult = await pool.query(`
      SELECT u.id, u.username, u.email, u.job_role, u.created_at, u.last_login,
        COUNT(s.id)::int AS total_sessions,
        COALESCE(ROUND(AVG(s.total_score)::numeric,1),0) AS avg_score,
        COALESCE(MAX(s.total_score),0) AS best_score,
        COALESCE(ROUND(100.0*SUM(CASE WHEN s.passed THEN 1 ELSE 0 END)/NULLIF(COUNT(s.id),0),1),0) AS pass_rate
      FROM users u LEFT JOIN sessions s ON s.user_id = u.id
      WHERE u.id = $1 AND u.role = 'player' GROUP BY u.id
    `, [userId]);
    if (!userResult.rows[0]) return res.status(404).json({ error: 'Player not found' });
    const sessResult = await pool.query(`
      SELECT id, started_at, completed_at, total_score, technique_score, time_bonus, injury_bonus, passed, time_remaining, ended_early
      FROM sessions WHERE user_id = $1 ORDER BY completed_at DESC
    `, [userId]);
    let sessions = sessResult.rows;
    if (sessions.length) {
      const ids = sessions.map(s => s.id);
      const choiceResult = await pool.query(`
        SELECT session_id, package_id, package_name, position_label, technique_chosen, outcome, points, feedback_text, body_zone_wrong
        FROM choices WHERE session_id = ANY($1::int[]) ORDER BY id ASC
      `, [ids]);
      const cm = {};
      for (const c of choiceResult.rows) { if (!cm[c.session_id]) cm[c.session_id]=[]; cm[c.session_id].push(c); }
      sessions = sessions.map(s => ({ ...s, choices: cm[s.id] || [] }));
    }
    return res.json({ ...userResult.rows[0], sessions });
  } catch (err) {
    console.error('[admin/players/:id]', err.message);
    return res.status(500).json({ error: 'Could not load player data' });
  }
});

// DELETE /api/admin/players/:id
router.delete('/players/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const check = await client.query('SELECT id, role FROM users WHERE id = $1', [userId]);
    if (!check.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Player not found' }); }
    if (check.rows[0].role === 'admin') { await client.query('ROLLBACK'); return res.status(403).json({ error: 'Cannot delete admin accounts via API' }); }
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    await client.query('COMMIT');
    return res.json({ message: 'Player deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[admin/delete]', err.message);
    return res.status(500).json({ error: 'Failed to delete player' });
  } finally {
    client.release();
  }
});

module.exports = router;