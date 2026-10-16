-- Lift or Leave It — PostgreSQL schema
-- Run once: psql -U postgres -d lift_or_leave_it -f schema.sql

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL       PRIMARY KEY,
  username      VARCHAR(60)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'player',
  job_role      VARCHAR(80)  NOT NULL DEFAULT 'others',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sessions (
  id              SERIAL      PRIMARY KEY,
  user_id         INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_score     SMALLINT    NOT NULL,
  technique_score SMALLINT    NOT NULL,
  time_bonus      SMALLINT    NOT NULL,
  injury_bonus    SMALLINT    NOT NULL,
  passed          BOOLEAN     NOT NULL,
  time_remaining  SMALLINT    NOT NULL,
  ended_early     BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS choices (
  id               SERIAL       PRIMARY KEY,
  session_id       INTEGER      NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  package_id       VARCHAR(10)  NOT NULL,
  package_name     VARCHAR(120) NOT NULL,
  position_label   VARCHAR(120) NOT NULL,
  technique_chosen VARCHAR(10)  NOT NULL,
  outcome          VARCHAR(10)  NOT NULL,
  points           SMALLINT     NOT NULL,
  feedback_text    TEXT         NOT NULL,
  body_zone_wrong  VARCHAR(20)
);
