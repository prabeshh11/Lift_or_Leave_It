'use strict';
require('dotenv').config();

const bcrypt = require('bcrypt');
const pool   = require('./db');

const ALLOWED_JOB_ROLES = [
  'Warehouse Operative', 'Forklift Operator', 'Stock Controller',
  'Receiving Clerk', 'Dispatch Worker', 'Pallet Handler',
  'Goods-In Operative', 'Stores Assistant', 'Order Picker',
  'Team Leader / Supervisor', 'others'
];

async function seedAdmin() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.ADMIN_USERNAME || 'Admin';
  const jobRole  = ALLOWED_JOB_ROLES.includes(process.env.ADMIN_JOB_ROLE)
                     ? process.env.ADMIN_JOB_ROLE
                     : 'Team Leader / Supervisor';

  if (!email || !password) {
    console.error('[seed] ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const existing = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (existing.rows.length > 0) {
    const updated = await pool.query(
      "UPDATE users SET job_role = $1 WHERE role = 'admin' RETURNING id, username, job_role",
      [jobRole]
    );
    console.log('[seed] Admin already exists — job_role updated to: ' + updated.rows[0].job_role);
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    "INSERT INTO users (username, email, password_hash, role, job_role) VALUES ($1, $2, $3, 'admin', $4) RETURNING id, username, email, role, job_role",
    [username, email, hash, jobRole]
  );

  console.log('[seed] Admin created:');
  console.log('  ID:       ', result.rows[0].id);
  console.log('  Username: ', result.rows[0].username);
  console.log('  Email:    ', result.rows[0].email);
  console.log('  Role:     ', result.rows[0].role);
  console.log('  Job Role: ', result.rows[0].job_role);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('[seed] Fatal error:', err.message);
  process.exit(1);
});