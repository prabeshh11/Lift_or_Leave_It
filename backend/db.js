'use strict';
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.PGHOST     || 'localhost',
  port:     parseInt(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'lift_or_leave_it',
  user:     process.env.PGUSER     || 'postgres',
  password: process.env.PGPASSWORD,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

module.exports = pool;