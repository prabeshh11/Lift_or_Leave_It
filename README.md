# Lift or Leave It 🏋️

**Manual Handling Training Simulator** — A 3D first-person warehouse game where players assess ergonomic risks and choose the safest lifting techniques.

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) v18+ installed
- [PostgreSQL](https://www.postgresql.org) v13+ installed and running

### 1 — Set up the database (first time only)

Open **psql** or pgAdmin and run:

```sql
CREATE DATABASE lift_or_leave_it;
```

Then from the project root folder:

```bash
psql -U postgres -d lift_or_leave_it -f schema.sql
```

> **Windows tip:** If `psql` isn't on your PATH, use the full path:
> `"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d lift_or_leave_it -f schema.sql`

### 2 — Configure the backend

The file `backend/.env` is pre-filled with your local settings. Open it and verify:

```env
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=lift_or_leave_it
PGUSER=postgres
PGPASSWORD="your_postgres_password"
JWT_SECRET=...              # auto-generated, do not change
ADMIN_EMAIL=admin@liftorleave.it
ADMIN_PASSWORD="Admin@Loli123!"
```

### 3 — Install dependencies (first time only)

```bash
cd backend
npm install
```

### 4 — Create the admin account (first time only)

```bash
cd backend
node seed-admin.js
```

You should see:
```
[seed] Admin created:
  ID:       1
  Username: Admin
  Email:    admin@liftorleave.it
```

### 5 — Start the server

```bash
cd backend
node server.js
```

You should see:
```
[server] Lift or Leave It running at http://localhost:3000
```

### 6 — Open the game

Open your browser and go to: **http://localhost:3000**

> ⚠️ Do **not** open the HTML files directly (`file://`). Auth and session saving require the server.

---

## How to Play

1. **Register** — Create an account with your name, email, and warehouse role
2. **Log In** — Sign in with your credentials
3. **Start Game** — Click **START GAME** from the home screen
4. **Read the briefing** — Review how-to-play instructions
5. **Explore the warehouse** — Use WASD / Arrow keys to move, mouse to look around
6. **Inspect packages** — Walk up to a package and press **E** to inspect it
7. **Choose a technique** — Select the safest manual handling method
8. **Complete all 5 packages** — or leave some if unsafe
9. **View your results** — See your score breakdown in the debrief screen

### Controls
| Key | Action |
|-----|--------|
| W A S D / Arrow keys | Move |
| Mouse | Look around |
| E | Inspect nearby package |
| Space | Jump |
| ESC | Pause / close panel |
| ⓘ button | Open help / how-to-play |

---

## Scoring

| Category | Max Points |
|----------|-----------|
| Technique choices (×5 packages) | 50 pts |
| Time bonus (>90s remaining = +30, 30–90s = +20, 1–29s = +10) | 30 pts |
| No injury risk bonus (all safe choices) | 20 pts |
| **Total** | **100 pts** |

**Pass mark: 60 / 100**

---

## Pages

| URL | Description |
|-----|-------------|
| `http://localhost:3000/` | Home screen |
| `http://localhost:3000/login.html` | Sign in |
| `http://localhost:3000/register.html` | Create account |
| `http://localhost:3000/how-to-play.html` | Instructions |
| `http://localhost:3000/game.html` | 3D warehouse game |
| `http://localhost:3000/debrief.html` | Results screen |
| `http://localhost:3000/profile.html` | Your stats & history |
| `http://localhost:3000/admin.html` | Admin panel (admin only) |

---

## Admin Panel

Log in with the admin credentials from `backend/.env` to access the admin panel.

**Admin features:**
- View all registered players and their warehouse roles
- See full session history and scores per player
- Delete player accounts (cascades all data)

**To change admin credentials:** Edit `backend/.env`, delete the admin row in the database, then re-run `node seed-admin.js`.

```sql
-- In psql, to delete the admin and re-seed:
DELETE FROM users WHERE role = 'admin';
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| 3D Game | A-Frame 1.4.0 (WebXR/Three.js) |
| Frontend | Vanilla HTML/CSS/JS (ES6) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT (HS256, 8h expiry) + bcrypt |

---

## Project Structure

```
lift-or-leave-it/
├── backend/                 # Node.js API server
│   ├── server.js            # Entry point (run this)
│   ├── db.js                # PostgreSQL connection
│   ├── seed-admin.js        # Create admin account
│   ├── .env                 # Your local config 
│   ├── middleware/          # Auth guards
│   └── routes/              # API endpoints
├── js/                      # Game logic
│   ├── auth.js              # Auth helper
│   ├── data.js              # Package + position data
│   ├── session.js           # Game session state
│   ├── scoring.js           # Score calculation
│   ├── timer.js             # Countdown logic
│   ├── inspect.js           # Inspect panel
│   └── warehouse.js         # Package spawning + 3D
├── css/                     # Stylesheets
├── assets/                  # Images, sounds
├── schema.sql               # Database schema
├── index.html               # Home screen
├── game.html                # 3D game
├── debrief.html             # Results
├── how-to-play.html         # Instructions
├── login.html               # Sign in
├── register.html            # Create account
├── profile.html             # Player profile
└── admin.html               # Admin panel
```

---

*Built by Team BAAP — 2026*