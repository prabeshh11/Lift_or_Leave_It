'use strict';
require('dotenv').config();

// ── V5: JWT_SECRET entropy guard — fail fast at startup ──────────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('[FATAL] JWT_SECRET is missing or too short (minimum 32 characters). Refusing to start.');
  process.exit(1);
}

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const path         = require('path');

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const sessionRoutes = require('./routes/sessions');
const adminRoutes   = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── V3: HTTP Security Headers (Helmet) ───────────────────────────────────────
// Adds X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.
// NOTE: Content-Security-Policy is disabled here because the game and admin
// panel build HTML dynamically via innerHTML with inline onclick handlers.
// A strict CSP would block these in certain browsers. For production,
// re-enable CSP and refactor onclick handlers to use addEventListener instead.
app.use(helmet({
  contentSecurityPolicy: false,   // disabled — see note above
  // X-Frame-Options: DENY — prevents clickjacking
  frameguard: { action: 'deny' },
  // X-Content-Type-Options: nosniff — prevents MIME sniffing
  noSniff: true,
  // Referrer-Policy
  referrerPolicy: { policy: 'same-origin' },
}));

// ── V2: Restrict CORS to known origin ────────────────────────────────────────
// In development this is localhost:3000. In production, replace with your domain.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: '50kb' }));   // also cap request body size

// ── V1: Rate Limiting on Auth Endpoints ──────────────────────────────────────
// Two separate limiters with different thresholds:
//
// LOGIN  — 150 req / 15 min per IP.
//   Warehouse workers all share one corporate IP (NAT/WiFi).
//   150 allows a full shift of ~100-150 employees to log in comfortably
//   while still blocking automated brute-force bots (need thousands of attempts).
const loginLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,  // 15 minutes
  max:             150,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many login attempts from this network — please try again in 15 minutes.' },
});

// REGISTER — 10 req / 15 min per IP.
//   Registration is a one-time action. A real user never needs more than 1-2 attempts.
//   Tight limit blocks automated account creation (credential stuffing / spam).
const registerLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,  // 15 minutes
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many registration attempts — please try again in 15 minutes.' },
});

app.use('/api/auth/login',    loginLimiter);
app.use('/api/auth/register', registerLimiter);


// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/admin',    adminRoutes);

// ── Serve Frontend Static Files ───────────────────────────────────────────────
const frontendDir = path.resolve(__dirname, process.env.FRONTEND_DIR || '..');
app.use(express.static(frontendDir));

// Fallback: serve index.html for non-API routes (SPA pattern)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDir, 'index.html'));
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] Lift or Leave It running at http://localhost:${PORT}`);
  console.log(`[server] Frontend: ${frontendDir}`);
  console.log(`[server] CORS origin: ${ALLOWED_ORIGIN}`);
  console.log(`[server] Security: Helmet ON | Rate limiting ON`);
});

module.exports = app;