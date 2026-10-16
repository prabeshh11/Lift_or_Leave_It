'use strict';
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('../db');

const router = express.Router();

// POST /api/auth/register
const ALLOWED_ROLES = [
  'Warehouse Operative', 'Forklift Operator', 'Stock Controller',
  'Receiving Clerk', 'Dispatch Worker', 'Pallet Handler',
  'Goods-In Operative', 'Stores Assistant', 'Order Picker',
  'Team Leader / Supervisor', 'others'
];

router.post('/register', async (req, res) => {
  const { username, email, password, jobRole } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'username, email and password are required' });
  if (username.trim().length < 2)
    return res.status(400).json({ error: 'Username must be at least 2 characters' });
  if (username.trim().length > 60)
    return res.status(400).json({ error: 'Username must be 60 characters or fewer' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email format' });
  const role = jobRole && ALLOWED_ROLES.includes(jobRole) ? jobRole : 'others';
  try {
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO users (username, email, password_hash, job_role) VALUES ($1, $2, $3, $4)',
      [username.trim(), email.toLowerCase().trim(), hash, role]
    );
    return res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    if (err.code === '23505') {
      const field = err.detail.includes('email') ? 'Email' : 'Username';
      return res.status(409).json({ error: `${field} is already registered` });
    }
    console.error('[auth/register]', err.message);
    return res.status(500).json({ error: 'Registration failed — please try again' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email and password are required' });
  try {
    const result = await pool.query(
      'SELECT id, username, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h', algorithm: 'HS256' }
    );
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[auth/login]', err.message);
    return res.status(500).json({ error: 'Login failed — please try again' });
  }
});

module.exports = router;