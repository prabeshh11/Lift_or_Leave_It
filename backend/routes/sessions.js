'use strict';
const express     = require('express');
const pool        = require('../db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// POST /api/sessions/save
router.post('/save', requireAuth, async (req, res) => {
  const { startedAt, timeRemaining, endedEarly, techniqueScore, timeBonus, injuryBonus, totalScore, passed, choices } = req.body;
  if (!choices || !Array.isArray(choices) || choices.length === 0)
    return res.status(400).json({ error: 'choices array is required' });
  if (totalScore === undefined || totalScore === null)
    return res.status(400).json({ error: 'totalScore is required' });

  // Clamp values to prevent API abuse
  const cTech   = Math.max(0, Math.min(50, techniqueScore || 0));
  const cTime   = Math.max(0, Math.min(30, timeBonus || 0));
  const cInjury = Math.max(0, Math.min(20, injuryBonus || 0));
  const cTotal  = Math.max(0, Math.min(100, totalScore));
  const cRemain = Math.max(0, Math.min(180, timeRemaining || 0));
  const validDate = (startedAt && !isNaN(Date.parse(startedAt))) ? new Date(startedAt).toISOString() : new Date().toISOString();
  const serverPassed = cTotal >= 60; // Enforce passing threshold server-side

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sessResult = await client.query(`
      INSERT INTO sessions (user_id, started_at, completed_at, total_score, technique_score, time_bonus, injury_bonus, passed, time_remaining, ended_early)
      VALUES ($1,$2,NOW(),$3,$4,$5,$6,$7,$8,$9) RETURNING id
    `, [req.user.userId, validDate, cTotal, cTech, cTime, cInjury, serverPassed, cRemain, endedEarly||false]);
    const sessionId = sessResult.rows[0].id;
    for (const c of choices) {
      await client.query(`
        INSERT INTO choices (session_id, package_id, package_name, position_label, technique_chosen, outcome, points, feedback_text, body_zone_wrong)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `, [sessionId, c.packageId||'', c.packageName||'', c.positionLabel||'', c.techniqueChosen||'leave', c.outcome||'skipped', c.points||0, c.feedbackText||'', c.bodyZoneWrong||null]);
    }
    await client.query('COMMIT');
    return res.status(201).json({ sessionId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[sessions/save]', err.message);
    return res.status(500).json({ error: 'Failed to save session' });
  } finally {
    client.release();
  }
});

// GET /api/sessions/history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const sessResult = await pool.query(`
      SELECT id, started_at, completed_at, total_score, technique_score, time_bonus, injury_bonus, passed, time_remaining, ended_early
      FROM sessions WHERE user_id = $1 ORDER BY completed_at DESC
    `, [req.user.userId]);
    if (!sessResult.rows.length) return res.json([]);
    const sessionIds = sessResult.rows.map(s => s.id);
    const choiceResult = await pool.query(`
      SELECT session_id, package_id, package_name, position_label, technique_chosen, outcome, points, feedback_text, body_zone_wrong
      FROM choices WHERE session_id = ANY($1::int[]) ORDER BY id ASC
    `, [sessionIds]);
    const choiceMap = {};
    for (const c of choiceResult.rows) {
      if (!choiceMap[c.session_id]) choiceMap[c.session_id] = [];
      choiceMap[c.session_id].push(c);
    }
    return res.json(sessResult.rows.map(s => ({ ...s, choices: choiceMap[s.id] || [] })));
  } catch (err) {
    console.error('[sessions/history]', err.message);
    return res.status(500).json({ error: 'Could not load session history' });
  }
});

module.exports = router;