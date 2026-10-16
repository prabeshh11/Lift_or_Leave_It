'use strict';
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, ShadingType, PageBreak, Header, Footer,
  PageNumber, NumberFormat
} = require('docx');
const fs   = require('fs');
const path = require('path');

// ─── Color constants ──────────────────────────────────────────────────────────
const TEAL  = '2CB98A';
const DARK  = '222222';
const GRAY  = '555555';
const LGRAY = 'CCCCCC';
const WHITE = 'FFFFFF';
const RED   = 'C0392B';
const AMBER = 'E09020';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sp = (before=0,after=120) => ({ spacing:{ before, after } });

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, ...sp(400,160) });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, ...sp(280,120) });
}
function h3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, ...sp(200,80) });
}
function p(text) {
  return new Paragraph({ children:[new TextRun({text,size:22,color:DARK})], ...sp(0,100) });
}
function bullet(text, lvl=0) {
  return new Paragraph({
    children:[new TextRun({text,size:22,color:DARK})],
    bullet:{level:lvl}, ...sp(0,70)
  });
}
function bold(text)  { return new TextRun({text,bold:true,size:22,color:DARK}); }
function teal(text)  { return new TextRun({text,bold:true,size:22,color:TEAL}); }
function amber(text) { return new TextRun({text,bold:true,size:22,color:AMBER}); }
function mono(text)  { return new TextRun({text,font:'Courier New',size:19,color:RED}); }
function mixed(...runs) { return new Paragraph({children:runs,...sp(0,100)}); }
function pb() { return new Paragraph({children:[new PageBreak()]}); }
function gap() { return new Paragraph({...sp(120,0)}); }

function divider() {
  return new Paragraph({
    border:{bottom:{color:LGRAY,space:1,value:BorderStyle.SINGLE,size:6}},
    ...sp(160,160)
  });
}

function noteBox(text, fillHex='D4EDDA', borderHex=TEAL) {
  return new Table({
    width:{size:100,type:WidthType.PERCENTAGE},
    rows:[new TableRow({children:[new TableCell({
      shading:{fill:fillHex,type:ShadingType.SOLID},
      borders:{
        top:   {style:BorderStyle.SINGLE,size:4,color:borderHex},
        bottom:{style:BorderStyle.SINGLE,size:4,color:borderHex},
        left:  {style:BorderStyle.SINGLE,size:16,color:borderHex},
        right: {style:BorderStyle.NONE}
      },
      children:[new Paragraph({children:[new TextRun({text,size:20,color:DARK,italics:true})],...sp(80,80)})],
      margins:{left:140,right:140,top:80,bottom:80}
    })]})],
    margins:{top:100,bottom:100}
  });
}

function tbl(headers, rows, hdrFill=TEAL) {
  const hdrRow = new TableRow({
    tableHeader:true,
    children: headers.map(h => new TableCell({
      shading:{fill:hdrFill,type:ShadingType.SOLID},
      children:[new Paragraph({children:[new TextRun({text:h,bold:true,size:19,color:WHITE})],alignment:AlignmentType.LEFT})],
      margins:{left:80,right:80,top:60,bottom:60}
    }))
  });
  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children:[new Paragraph({children:[new TextRun({text:cell,size:19,color:DARK})],alignment:AlignmentType.LEFT})],
      margins:{left:80,right:80,top:50,bottom:50}
    }))
  }));
  return new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[hdrRow,...dataRows]});
}

// ─── Build document ───────────────────────────────────────────────────────────
const doc = new Document({
  styles:{
    default:{
      document:{ run:{ font:'Calibri', size:22 } },
      heading1:{ run:{ font:'Calibri', bold:true, size:40, color:DARK }, paragraph:{ spacing:{before:400,after:160} } },
      heading2:{ run:{ font:'Calibri', bold:true, size:30, color:GRAY }, paragraph:{ spacing:{before:280,after:120} } },
      heading3:{ run:{ font:'Calibri', bold:true, size:25, color:GRAY }, paragraph:{ spacing:{before:200,after:80} } },
    }
  },
  sections:[{
    properties:{ page:{ margin:{ top:1080,bottom:1080,left:1080,right:1080 } } },
    headers:{ default: new Header({ children:[ new Paragraph({
      children:[new TextRun({text:'Lift or Leave It — Project Documentation',size:18,color:GRAY,italics:true})],
      alignment:AlignmentType.RIGHT,
      border:{bottom:{color:LGRAY,value:BorderStyle.SINGLE,size:4,space:4}}
    })]}) },
    footers:{ default: new Footer({ children:[ new Paragraph({
      children:[new TextRun({text:'© 2026 Team BAAP  |  Lift or Leave It  |  Confidential',size:18,color:GRAY})],
      alignment:AlignmentType.CENTER
    })]}) },

    children:[

      // ── COVER ──────────────────────────────────────────────────
      gap(), gap(), gap(),
      new Paragraph({
        alignment:AlignmentType.CENTER,
        children:[new TextRun({text:'LIFT OR LEAVE IT',bold:true,size:80,color:TEAL,font:'Calibri'})],
        ...sp(0,80)
      }),
      new Paragraph({
        alignment:AlignmentType.CENTER,
        children:[new TextRun({text:'Manual Handling Training Simulator',size:34,color:GRAY,italics:true})],
        ...sp(0,200)
      }),
      divider(),
      new Paragraph({
        alignment:AlignmentType.CENTER,
        children:[new TextRun({text:'Full Project Documentation & Improvement Roadmap',size:26,color:DARK})],
        ...sp(0,400)
      }),
      new Paragraph({ alignment:AlignmentType.CENTER, children:[new TextRun({text:'Version 1.0  |  August 2026  |  Team BAAP',size:22,color:GRAY})] }),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 1. PROJECT OVERVIEW
      // ══════════════════════════════════════════════════════════
      h1('1. Project Overview'),
      p('Lift or Leave It is a browser-based, first-person 3-D warehouse simulation game designed to train warehouse workers in safe manual handling techniques. Players navigate a realistic warehouse environment, inspect packages, and choose the correct lifting technique for each scenario.'),
      p('The game serves as a serious training tool for warehouse companies. Each session consists of 5 packages that must be assessed and handled correctly within a 3-minute timer. Players are scored on technique accuracy, completion speed, and injury avoidance.'),
      gap(),
      h2('1.1 Training Goals'),
      bullet('Teach warehouse operatives when to lift solo, use a team, or use a trolley'),
      bullet('Make health & safety training engaging through interactive 3-D gameplay'),
      bullet('Track individual performance over time via a persistent user account system'),
      bullet('Allow administrators to monitor which staff have completed training and their scores'),
      bullet('Filter and report results by warehouse role / division'),
      gap(),
      h2('1.2 Target Audience'),
      tbl(['Role','Description'],[
        ['Warehouse Operatives','Primary end-users — complete training sessions to demonstrate safe technique'],
        ['Team Leaders / Supervisors','Monitor team performance via the admin panel'],
        ['HR / Safety Managers','Admin accounts that review pass rates and session history across all staff'],
        ['New Starters','Use the game as part of workplace induction / onboarding'],
      ]),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 2. TECH STACK
      // ══════════════════════════════════════════════════════════
      h1('2. Technology Stack'),
      p('The project deliberately uses no front-end frameworks or build tools. All JavaScript is vanilla ES6+ delivered directly to the browser with no compilation step required.'),
      gap(),
      h2('2.1 Front-End'),
      tbl(['Technology','Version / Source','Purpose'],[
        ['A-Frame','1.4.0 via CDN','3-D WebGL warehouse scene, first-person movement, collision detection'],
        ['HTML5','Native browser','All page markup (home, game, debrief, auth, profile, admin)'],
        ['CSS3','Native browser','Dark-themed UI, animations (ember particles, nudge badge), responsive layout'],
        ['Vanilla JavaScript','ES6 (no bundler)','Game logic, session management, REST API calls, authentication'],
        ['Rajdhani / Bebas Neue / Barlow','Google Fonts CDN','UI typography across all pages'],
      ]),
      gap(),
      h2('2.2 Back-End'),
      tbl(['Technology','Version','Purpose'],[
        ['Node.js','22.x','Runtime environment'],
        ['Express','4.x','HTTP server, API routing, static file serving from project root'],
        ['PostgreSQL','18.x','Relational database — users, sessions, choices'],
        ['bcrypt','Latest','Password hashing with cost factor 12'],
        ['jsonwebtoken','Latest','JWT authentication — HS256 algorithm, 8-hour token expiry'],
        ['pg (node-postgres)','Latest','PostgreSQL connection pool using individual env vars'],
        ['dotenv','Latest','Environment variable management from .env file'],
        ['cors','Latest','Cross-origin resource sharing middleware'],
      ]),
      gap(),
      noteBox('DESIGN CONSTRAINT: The front-end must remain framework-free. No React, Vue, Angular, or bundlers (Webpack, Vite, etc.) are permitted. All client-side code must remain plain HTML + CSS + Vanilla JS ES6.'),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 3. ARCHITECTURE
      // ══════════════════════════════════════════════════════════
      h1('3. System Architecture'),
      h2('3.1 Serving Model'),
      p('Express serves both the REST API (under /api/*) and all static front-end files from the project root directory. There is no separate front-end server. The application runs as a single Node.js process on port 3000.'),
      noteBox('Application URL: http://localhost:3000'),
      gap(),
      h2('3.2 Request Flow'),
      tbl(['Step','What Happens'],[
        ['1','Browser loads index.html from Express static middleware'],
        ['2','js/auth.js reads JWT from localStorage (key: loli_token)'],
        ['3','User clicks START GAME — auth check runs; redirected to login.html if not signed in'],
        ['4','login.html POSTs credentials to /api/auth/login; JWT stored on success'],
        ['5','game.html loads; A-Frame scene initialises; warehouse.js spawns packages in 3-D space'],
        ['6','Player inspects packages; choices stored in sessionStorage via session.js'],
        ['7','Session ends (timer expires, all 5 done, or ESC → End Session)'],
        ['8','debrief.html calculates final score via scoring.js; POSTs full result to /api/sessions/save'],
        ['9','Player views results; full history available at profile.html'],
      ]),
      gap(),
      h2('3.3 Authentication Flow'),
      p('Authentication uses JSON Web Tokens (JWT) stored in localStorage. The token payload contains { userId, email, role }. Tokens expire after 8 hours.'),
      tbl(['Middleware','File','Purpose'],[
        ['requireAuth','backend/middleware/requireAuth.js','Verifies JWT signature and expiry; attaches req.user = { userId, email, role }'],
        ['requireAdmin','backend/middleware/requireAdmin.js','Calls requireAuth then checks req.user.role === "admin"; rejects with 403 if not'],
      ]),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 4. FILE STRUCTURE
      // ══════════════════════════════════════════════════════════
      h1('4. File Structure'),
      tbl(['Path','Type','Description'],[
        ['index.html','Page','Home screen — START GAME, HOW TO PLAY, auth row, ember particles, footer nav'],
        ['game.html','Page','Main 3-D A-Frame game scene with warehouse environment'],
        ['how-to-play.html','Page','Rules, controls, and scoring explanation page'],
        ['debrief.html','Page','Post-session results screen — score breakdown, per-package review'],
        ['login.html','Page','Sign-in form with close (✕) button'],
        ['register.html','Page','Registration form with job role dropdown and close button'],
        ['profile.html','Page','Player stats cards, My Details tab, Game History tab'],
        ['admin.html','Page','Admin panel — player list, detail panel, delete with confirmation'],
        ['README.md','Docs','Local setup guide for running the project'],
        ['schema.sql','SQL','PostgreSQL schema — users, sessions, choices tables with cascade deletes'],
        ['js/auth.js','Script','AUTH global: getToken, getUser, isLoggedIn, requireLogin, authFetch, logout'],
        ['js/data.js','Script','PACKAGE_POOL array, POSITIONS array, buildSessionPackages() function'],
        ['js/session.js','Script','sessionStorage wrapper — initSession(), recordChoice(), getSession()'],
        ['js/scoring.js','Script','calculateTechniqueTotal(), calculateTimeBonus(), calculateTotal(), isPassed()'],
        ['js/timer.js','Script','Countdown timer — startTimer(), getTimeTier()'],
        ['js/warehouse.js','Script','A-Frame package spawning, interaction rings, floating name labels'],
        ['js/inspect.js','Script','Inspect panel open/close, technique button click handler'],
        ['css/inspect.css','Style','Dark-theme styles for the inspect panel overlay'],
        ['backend/server.js','Server','Express entry point — mounts API routes, serves static files from ../'],
        ['backend/db.js','DB','pg.Pool using individual PGHOST/PGPORT/etc. env vars (not DATABASE_URL)'],
        ['backend/seed-admin.js','Script','One-time admin account creator — reads ADMIN_* env vars'],
        ['backend/.env','Config','Database credentials, JWT secret, admin credentials (git-ignored)'],
        ['backend/.env.example','Config','Template for .env — safe to commit to version control'],
        ['backend/middleware/requireAuth.js','MW','JWT verification middleware'],
        ['backend/middleware/requireAdmin.js','MW','Admin role guard middleware'],
        ['backend/routes/auth.js','Route','POST /api/auth/register, POST /api/auth/login'],
        ['backend/routes/users.js','Route','GET /api/users/me — own profile + aggregate stats'],
        ['backend/routes/sessions.js','Route','POST /api/sessions/save, GET /api/sessions/history'],
        ['backend/routes/admin.js','Route','GET/DELETE /api/admin/players, GET /api/admin/players/:id'],
      ]),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 5. DATABASE SCHEMA
      // ══════════════════════════════════════════════════════════
      h1('5. Database Schema'),
      p('Database name: lift_or_leave_it (PostgreSQL 18). Three tables linked by foreign keys with ON DELETE CASCADE so removing a user removes all their sessions and choices automatically.'),
      gap(),
      h2('5.1 Table: users'),
      tbl(['Column','Type','Notes'],[
        ['id','SERIAL PRIMARY KEY','Auto-incrementing integer'],
        ['username','VARCHAR(60) NOT NULL','Display name shown in UI and admin panel'],
        ['email','VARCHAR(255) UNIQUE NOT NULL','Login identifier — must be unique'],
        ['password_hash','TEXT NOT NULL','bcrypt hash at cost factor 12'],
        ['role','VARCHAR(20) DEFAULT \'player\'','Values: "player" or "admin"'],
        ['job_role','VARCHAR(80) DEFAULT \'others\'','Warehouse role — one of 11 predefined values'],
        ['created_at','TIMESTAMPTZ DEFAULT NOW()','Registration timestamp'],
      ]),
      gap(),
      h2('5.2 Table: sessions'),
      tbl(['Column','Type','Notes'],[
        ['id','SERIAL PRIMARY KEY',''],
        ['user_id','INTEGER REFERENCES users(id) ON DELETE CASCADE',''],
        ['started_at','TIMESTAMPTZ','When the game session began'],
        ['ended_early','BOOLEAN DEFAULT false','True if player used ESC → End Session before completing all 5'],
        ['time_remaining','INTEGER','Seconds left on the 3-minute clock when session ended'],
        ['technique_score','INTEGER','Sum of points from technique choices (max 50 = 5 × 10)'],
        ['time_bonus','INTEGER','Speed bonus: +30 / +20 / +10 / 0 depending on time_remaining'],
        ['injury_bonus','INTEGER','+20 if ALL 5 choices were "best", else 0'],
        ['total_score','INTEGER','technique_score + time_bonus + injury_bonus (max 100)'],
        ['passed','BOOLEAN','true if total_score >= 60 (the pass mark)'],
        ['created_at','TIMESTAMPTZ DEFAULT NOW()','When the session record was saved'],
      ]),
      gap(),
      h2('5.3 Table: choices'),
      tbl(['Column','Type','Notes'],[
        ['id','SERIAL PRIMARY KEY',''],
        ['session_id','INTEGER REFERENCES sessions(id) ON DELETE CASCADE',''],
        ['package_id','VARCHAR(20)','e.g. "pkg-01" — matches data.js ID'],
        ['package_name','TEXT','Human-readable name e.g. "Engine Block Crate"'],
        ['position_label','TEXT','e.g. "Back wall, top shelf (left)"'],
        ['technique_chosen','VARCHAR(20)','"solo", "team", or "trolley"'],
        ['outcome','VARCHAR(10)','"best", "good", or "wrong"'],
        ['points','INTEGER','10, 5, or 0'],
        ['feedback_text','TEXT','Explanation displayed on debrief screen'],
        ['body_zone_wrong','VARCHAR(40)','Injury body zone if outcome = wrong (e.g. "lower-back", "shoulder")'],
      ]),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 6. API REFERENCE
      // ══════════════════════════════════════════════════════════
      h1('6. API Reference'),
      p('All routes are prefixed with /api. Protected routes require the header: Authorization: Bearer <token>'),
      gap(),
      h2('6.1 Auth Routes'),
      tbl(['Method','Endpoint','Auth','Request Body','Response'],[
        ['POST','/api/auth/register','None','{ username, email, password, jobRole }','201 { token, user } or 400/409 error'],
        ['POST','/api/auth/login','None','{ email, password }','200 { token, user } or 401 error'],
      ]),
      gap(),
      h2('6.2 User Routes'),
      tbl(['Method','Endpoint','Auth','Description'],[
        ['GET','/api/users/me','Player+','Returns own profile + aggregate stats: total_sessions, avg_score, best_score, pass_rate, job_role'],
      ]),
      gap(),
      h2('6.3 Session Routes'),
      tbl(['Method','Endpoint','Auth','Description'],[
        ['POST','/api/sessions/save','Player+','Saves a completed session with all choices in a DB transaction. Returns saved session ID.'],
        ['GET','/api/sessions/history','Player+','Returns all own sessions in reverse chronological order, each with a nested choices array.'],
      ]),
      gap(),
      h2('6.4 Admin Routes'),
      tbl(['Method','Endpoint','Auth','Description'],[
        ['GET','/api/admin/players','Admin','All players with aggregate stats and job_role. Players only (excludes admins).'],
        ['GET','/api/admin/players/:id','Admin','Full profile + complete session history for one player.'],
        ['DELETE','/api/admin/players/:id','Admin','Hard-deletes player and cascades sessions and choices.'],
      ]),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 7. GAMEPLAY
      // ══════════════════════════════════════════════════════════
      h1('7. Gameplay Mechanics'),
      h2('7.1 Session Structure'),
      bullet('Each session consists of exactly 5 packages'),
      bullet('2 packages are shelf-type — spawned on warehouse racking at various heights'),
      bullet('3 packages are floor-type — placed on the warehouse floor in open areas'),
      bullet('Packages are randomly selected from the 10-item pool each session (shuffled using Fisher-Yates)'),
      bullet('Spawn positions are also randomised so the same package can appear in different locations across sessions'),
      gap(),
      h2('7.2 Controls'),
      tbl(['Control','Action'],[
        ['W A S D','Walk forward / strafe left / walk back / strafe right'],
        ['SPACE','Jump'],
        ['Mouse (drag)','Look around — uses A-Frame pointer lock'],
        ['E (near glowing package)','Open the inspect panel for that package'],
        ['ESC','Open/close the pause overlay'],
        ['Click backdrop or ✕','Close inspect panel without making a choice'],
        ['ⓘ button (top-right)','Toggle the in-game Help & Controls panel'],
      ]),
      gap(),
      h2('7.3 Technique Decisions'),
      p('Each package has three possible choices. One is optimal (Best), one is sub-optimal but safe (Good), and one is wrong and risks injury to a specific body zone.'),
      tbl(['Technique','Typical Best-Choice Scenario'],[
        ['Solo Lift','Package is light (under ~12 kg), has good handles, in an accessible position with open space around it'],
        ['Team Lift','Package is heavy (12–30 kg), awkward grip, in a tight space, or at height requiring one person to steady'],
        ['Trolley','Package is very heavy (over ~25 kg), smooth/round with no handles, or must be moved a long distance'],
      ]),
      gap(),
      h2('7.4 The Leave It Option'),
      p('Inside the inspect panel, the player can press "Leave It" to skip a package. This scores 0 points for that package AND disqualifies the No Injury Bonus for the entire session.'),
      gap(),
      h2('7.5 Pause Menu Options'),
      bullet('Continue — resumes the game; timer restarts from where it was paused'),
      bullet('End Session → Results — ends early, goes to debrief showing partial scores'),
      bullet('Exit to Menu — abandons session entirely, returns to home screen with "Returned to main menu" toast'),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 8. SCORING SYSTEM
      // ══════════════════════════════════════════════════════════
      h1('8. Scoring System'),
      h2('8.1 Score Components'),
      tbl(['Component','Points','Notes'],[
        ['Optimal technique (Best)','+ 10 pts','Per package — maximum 5 × 10 = 50 pts'],
        ['Sub-optimal technique (Good)','+ 5 pts','Safe but not the ideal choice'],
        ['Wrong technique / Leave It','0 pts','Marks the choice as unsafe for injury bonus calculation'],
        ['Time bonus — over 90 s remaining','+ 30 pts','Completed very quickly'],
        ['Time bonus — 30 to 90 s remaining','+ 20 pts','Good pace'],
        ['Time bonus — 1 to 29 s remaining','+ 10 pts','Just in time'],
        ['Time bonus — 0 s (timer expired)','0 pts','Ran out of time'],
        ['No Injury Bonus','+ 20 pts','Only awarded if ALL 5 choices were "Best". Any Good, Wrong, or Leave It disqualifies it.'],
      ]),
      gap(),
      mixed(bold('Maximum possible score: '), teal('100 points'), new TextRun({text:' (50 technique + 30 time + 20 injury bonus)',size:22,color:DARK})),
      mixed(bold('Pass mark: '), teal('60 / 100 points')),
      gap(),
      h2('8.2 Scoring Functions (js/scoring.js)'),
      tbl(['Function','Returns','Logic'],[
        ['calculateTechniqueTotal()','Integer','Sums choice.points across all choices in the current session'],
        ['calculateTimeBonus()','Integer','Calls getTimeTier(session.timeRemaining) → 30 / 20 / 10 / 0'],
        ['calculateNoInjuryBonus()','Integer','Returns 20 if session.noInjuryBonus === true, else 0'],
        ['calculateTotal()','Integer','Sum of the three functions above'],
        ['isPassed()','Boolean','Returns calculateTotal() >= 60'],
      ]),
      noteBox('IMPORTANT: session.js stores raw choice data only. It does NOT pre-compute scores. debrief.html must call the scoring.js functions at render time to get accurate scores. This is by design — the scoring is always computed from source data, never from a cached total.'),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 9. PACKAGE POOL & POSITIONS
      // ══════════════════════════════════════════════════════════
      h1('9. Package Pool'),
      p('The game contains 10 distinct packages. Each has a defined weight, shape, best/good/wrong technique, and feedback text for each outcome. The 3-D shape (box, flat-box, or cylinder) and colour are defined per package.'),
      tbl(['ID','Name','Weight','Type','Best Technique','Body Risk Zone'],[
        ['pkg-01','Box of Office Supplies','5 kg','Shelf','Solo Lift','Lower back'],
        ['pkg-02','Engine Block Crate','35 kg','Floor','Trolley','Lower back'],
        ['pkg-03','Stock Box (Tight Corner)','12 kg','Shelf','Team Lift','Spine twist'],
        ['pkg-04','Stack of Flat Panels','22 kg','Floor','Team Lift','Shoulder'],
        ['pkg-05','Tool Kit Case (High Shelf)','3 kg','Shelf','Team Lift','Shoulder'],
        ['pkg-06','Water Cooler Bottle','18 kg','Floor','Trolley','Lower back'],
        ['pkg-07','Spare Parts Crate','14 kg','Floor','Team Lift','Spine twist'],
        ['pkg-08','Medical Supplies Box','8 kg','Shelf','Solo Lift','Lower back'],
        ['pkg-09','Printer Paper Pallet','25 kg','Floor','Trolley','Lower back'],
        ['pkg-10','Hardware Kit Box','10 kg','Floor','Solo Lift','Lower back'],
      ]),
      gap(),
      h2('9.1 Spawn Positions'),
      tbl(['ID','Location','Type','Board Height'],[
        ['pos-01','Back wall, top shelf — left unit','Shelf','Level 5 — y = 3.79 m'],
        ['pos-02','Back wall, top shelf — centre unit','Shelf','Level 5 — y = 3.79 m'],
        ['pos-03','Back wall, top shelf — right unit','Shelf','Level 5 — y = 3.79 m'],
        ['pos-04','Left wall, mid shelf','Shelf','Level 2 — y = 1.39 m'],
        ['pos-05','Right wall, low shelf','Shelf','Level 1 — y = 0.59 m'],
        ['pos-06','Floor, centre-left open area','Floor','Ground — y = 0'],
        ['pos-07','Floor, centre-right open area','Floor','Ground — y = 0'],
        ['pos-08','Floor, beside central pillar','Floor','Ground — y = 0'],
        ['pos-09','Floor, front-left zone','Floor','Ground — y = 0'],
        ['pos-10','Floor, near entrance','Floor','Ground — y = 0'],
      ]),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 10. USER ROLES
      // ══════════════════════════════════════════════════════════
      h1('10. User Roles & Access Control'),
      h2('10.1 Account Types'),
      tbl(['Account Type','Access','How Created'],[
        ['Player','Play game, view own profile, view own session history','Register page (/register.html) — open to anyone'],
        ['Admin','All player access + Admin Panel (view/delete all players + stats)','CLI only: node backend/seed-admin.js'],
      ]),
      gap(),
      h2('10.2 Warehouse Job Roles (job_role column)'),
      p('Job roles categorise players by their position in the warehouse. The admin can see each player\'s role in the Admin Panel for filtering and reporting purposes.'),
      tbl(['Job Role','Description'],[
        ['Warehouse Operative','General warehouse floor worker'],
        ['Forklift Operator','Specialises in forklift and heavy equipment operation'],
        ['Stock Controller','Manages inventory levels and stock records'],
        ['Receiving Clerk','Handles incoming deliveries and goods-in processing'],
        ['Dispatch Worker','Manages outgoing shipments and dispatch documentation'],
        ['Pallet Handler','Specialist in pallet movement, wrapping, and stacking'],
        ['Goods-In Operative','Processes and records all incoming goods'],
        ['Stores Assistant','General stores and warehouse support role'],
        ['Order Picker','Picks orders from shelves for packing and dispatch'],
        ['Team Leader / Supervisor','Supervisory role — manages a warehouse team'],
        ['Others','Default / catch-all for roles not listed above'],
      ]),
      gap(),
      h2('10.3 Creating the Admin Account'),
      p('Run this once after setting ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_JOB_ROLE in backend/.env:'),
      mixed(mono('  cd backend && node seed-admin.js')),
      p('If the admin already exists, the script safely updates their job_role to the value in .env without creating a duplicate.'),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 11. UI PAGES
      // ══════════════════════════════════════════════════════════
      h1('11. UI Pages Overview'),

      h2('11.1 Home Screen (index.html)'),
      bullet('Animated dark warehouse background with floating ember/spark particles'),
      bullet('LIFT OR LEAVE IT title in Bebas Neue font with subtitle'),
      bullet('START GAME — requires authentication; navigates directly to game.html'),
      bullet('HOW TO PLAY — navigates to rules page (no login required)'),
      bullet('Auth row below buttons: Sign In / Register for guests; My Profile / Admin Panel for signed-in users'),
      bullet('Footer right corner: 👤 Username + Log Out when signed in; warehouse icon text when guest'),
      bullet('Toast notifications: signed in, signed out, registered, returned to main menu'),

      h2('11.2 Game Screen (game.html)'),
      bullet('Full-screen A-Frame 3-D warehouse environment with realistic industrial racking'),
      bullet('Countdown timer top-left — 3 minutes per session, turns red under 30 seconds'),
      bullet('Package counter top-right — "X / 5 done"'),
      bullet('Minimap bottom-left — warehouse layout with player position and package markers'),
      bullet('"Need help?" animated nudge badge — visible for 10 seconds on load, points to ⓘ button'),
      bullet('Help & Controls panel with full scoring table — toggled via ⓘ button'),
      bullet('ESC pause overlay — Continue / End Session → Results / Exit to Menu'),
      bullet('Package inspect panel — package details, weight, position, 3 technique buttons + Leave It'),
      bullet('Glowing yellow interaction rings animate above each package to draw attention'),

      h2('11.3 Debrief Screen (debrief.html)'),
      bullet('PASS or FAIL badge based on 60/100 pass mark'),
      bullet('Four score cards: Total Score, Technique Score, Time Bonus, Injury Bonus'),
      bullet('Per-package choice table: package name, technique chosen, outcome, points, feedback text'),
      bullet('Body zone injury indicator if wrong choices were made'),
      bullet('Session automatically saved to backend on page load via /api/sessions/save'),

      h2('11.4 Profile Page (profile.html)'),
      bullet('4 stat cards: Total Sessions, Average Score, Best Score, Pass Rate %'),
      bullet('My Details tab: username, email, account type, warehouse role, member since date'),
      bullet('Game History tab: expandable session entries with per-choice breakdown and scores'),

      h2('11.5 Admin Panel (admin.html)'),
      bullet('Player table: Username, Email, Warehouse Role, Joined, Sessions, Avg Score, Last Played, Delete'),
      bullet('Click any row to expand a detailed side panel for that player'),
      bullet('Delete button with a two-step confirmation overlay to prevent accidental deletion'),
      bullet('Cascading delete — removes all sessions and choices for that player'),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 12. SETUP GUIDE
      // ══════════════════════════════════════════════════════════
      h1('12. Setup & Running Guide'),
      h2('12.1 Prerequisites'),
      bullet('Node.js 18 or higher (tested on 22.x)'),
      bullet('PostgreSQL 15 or higher (tested on 18.x) — running locally on port 5432'),
      bullet('A modern desktop browser: Microsoft Edge, Chrome, or Firefox (mobile not supported)'),
      gap(),
      h2('12.2 Step-by-Step Installation'),
      tbl(['Step','Command / Action'],[
        ['1. Create database','psql -U postgres -c "CREATE DATABASE lift_or_leave_it;"'],
        ['2. Apply schema','psql -U postgres -d lift_or_leave_it -f schema.sql'],
        ['3. Configure environment','Copy backend/.env.example to backend/.env; fill in all values'],
        ['4. Install Node.js dependencies','cd backend && npm install'],
        ['5. Seed admin account','node backend/seed-admin.js'],
        ['6. Start the server','node backend/server.js'],
        ['7. Open the application','Navigate to http://localhost:3000 in your browser'],
      ]),
      gap(),
      h2('12.3 Environment Variables'),
      tbl(['Variable','Example Value','Description'],[
        ['PORT','3000','Express server port'],
        ['PGHOST','localhost','PostgreSQL server hostname'],
        ['PGPORT','5432','PostgreSQL port'],
        ['PGDATABASE','lift_or_leave_it','Database name'],
        ['PGUSER','postgres','Database username'],
        ['PGPASSWORD','"prabesh@#123"','Password — MUST be quoted if it contains # character'],
        ['JWT_SECRET','(64-char random hex)','Secret for signing JWTs — keep this private'],
        ['ADMIN_USERNAME','Admin','Admin display name in the UI'],
        ['ADMIN_EMAIL','admin@liftorleave.it','Admin login email'],
        ['ADMIN_PASSWORD','"Admin@Loli123!"','Admin password — quote if contains special chars'],
        ['ADMIN_JOB_ROLE','Team Leader / Supervisor','Admin\'s warehouse role'],
      ]),
      noteBox('If your PostgreSQL password contains a # (hash sign), it MUST be wrapped in double quotes in the .env file: PGPASSWORD="your@#password". Without quotes, dotenv treats everything after # as a comment and your password will be truncated, causing authentication to fail with a cryptic error.','FFF3CD','E09020'),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 13. KNOWN LIMITATIONS
      // ══════════════════════════════════════════════════════════
      h1('13. Known Limitations'),
      tbl(['#','Limitation','Severity'],[
        ['1','No mobile or touchscreen support — A-Frame pointer lock requires desktop browser','High'],
        ['2','Single-server only — no horizontal scaling or load balancer support','Medium'],
        ['3','Sessions cannot be resumed if browser is closed mid-game','Low'],
        ['4','Admin player list has no pagination — all players loaded at once','Low'],
        ['5','No email verification on registration — anyone can create an account with any email','Low'],
        ['6','JWT stored in localStorage — theoretically vulnerable to XSS (mitigated by no user-generated HTML)','Low'],
        ['7','Only 10 packages in the pool — experienced players will memorise answers quickly','Medium'],
        ['8','All 3 back-wall positions use the top shelf (y=3.79) — no variety at lower levels','Low'],
        ['9','No accessibility features — no screen reader support, no keyboard-only navigation','Medium'],
        ['10','No password reset flow — forgotten passwords require manual DB intervention','Low'],
      ]),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 14. IMPROVEMENT ROADMAP
      // ══════════════════════════════════════════════════════════
      h1('14. Suggested Improvements & Roadmap'),

      h2('Priority 1 — High Impact: Core Training Value'),

      h3('A. Expand the Package Pool (Recommended: 30+ packages)'),
      p('Currently only 10 packages exist. Experienced players will memorise all answers within a few sessions, removing the long-term training value. A larger pool ensures each session feels genuinely different.'),
      bullet('Add 20–30 packages covering more edge cases and weight categories'),
      bullet('Include awkward 3-D shapes: L-beams, gas cylinders, stacked trays, long poles, fragile electronics'),
      bullet('Add environmental hazards: wet floor marker, confined corridor, near stairwell, overhead obstacle'),
      bullet('Introduce "trick" packages: light boxes that look heavy, items with misleading grip points'),
      gap(),

      h3('B. Difficulty Levels'),
      p('All sessions currently use the same 5-package, 3-minute format. Progressive difficulty would improve the learning journey for both new and experienced staff.'),
      tbl(['Difficulty','Changes'],[
        ['Beginner','3 packages, 4-minute timer, technique hint shown before choosing'],
        ['Standard (current)','5 packages, 3-minute timer, standard debrief feedback'],
        ['Advanced','7 packages, 2-minute timer, feedback only shown at debrief (not in-panel)'],
        ['Expert','10 packages, 90-second timer, package details obscured, no technique labels'],
      ]),
      gap(),

      h3('C. Multiple Warehouse Environments'),
      p('A single repeated environment reduces engagement over time. Adding 2–3 environments would also cover different industry-specific hazards.'),
      bullet('Cold storage facility — slippery floors, bulky insulated packaging'),
      bullet('Hospital supplies room — fragile medical equipment, hygiene constraints'),
      bullet('Construction site stores — heavy tools, confined space, uneven floor surfaces'),
      gap(),

      h2('Priority 2 — Analytics & Reporting'),

      h3('A. Enhanced Admin Dashboard'),
      p('Transform the admin panel from a simple player list into a full training management tool:'),
      bullet('Bar chart: pass rate by warehouse role (e.g. "Forklift Operators: 78% pass rate")'),
      bullet('Line chart: individual player improvement across sessions over time'),
      bullet('Heatmap: which packages are most frequently answered incorrectly company-wide'),
      bullet('Export to CSV or PDF — managers download training completion reports for HR'),
      bullet('Filter players by role, date range, pass/fail status'),
      bullet('Bulk compliance view: list of users who have not yet completed any sessions'),
      gap(),

      h3('B. Training Completion Certificate'),
      p('When a player achieves a passing score, automatically generate a downloadable PDF certificate:'),
      bullet('Player name, warehouse role, date of completion'),
      bullet('Score achieved (e.g. 80/100) with breakdown'),
      bullet('Company logo and manager digital signature field'),
      bullet('Unique certificate reference number for HR records'),
      gap(),

      h3('C. Leaderboard'),
      bullet('Company-wide top 10 by score — monthly and all-time views'),
      bullet('Filter by job role (e.g. "Top Order Pickers this month")'),
      bullet('Opt-in privacy — players can hide their name from the leaderboard'),
      gap(),

      h2('Priority 3 — UX & Accessibility'),

      h3('A. In-Game Tutorial'),
      p('A guided first session would make the game accessible to players who skip the How to Play page:'),
      bullet('Arrow markers direct the player to the first package'),
      bullet('Technique selection explained step-by-step with animated highlights'),
      bullet('One package, no timer, correct answer shown after each choice with explanation'),
      bullet('Tutorial skippable for returning players'),
      gap(),

      h3('B. Mobile & Tablet Support'),
      p('A-Frame 1.4.0 supports touch events. Adding on-screen controls would allow tablet deployment in warehouse break rooms without requiring a mouse:'),
      bullet('On-screen virtual D-pad for movement'),
      bullet('Drag gesture to look around (no pointer lock required)'),
      bullet('Tap on a glowing package to inspect (no E key needed)'),
      bullet('Large, thumb-friendly technique buttons in the inspect panel'),
      gap(),

      h3('C. Accessibility Features'),
      bullet('Keyboard-only movement mode for users with limited mouse control'),
      bullet('High-contrast UI theme toggle (bright teal on deep black vs softer colours)'),
      bullet('Text-to-speech: screen reader compatible package descriptions'),
      bullet('Font size scaling option for users with visual impairment'),
      gap(),

      h2('Priority 4 — Technical Improvements'),

      h3('A. Rate Limiting & Security'),
      bullet('Add express-rate-limit on /api/auth/login — prevent brute force attacks'),
      bullet('Email verification on registration — send confirmation link before account is active'),
      bullet('Password reset via email link (requires email sending service, e.g. SendGrid)'),
      bullet('CSRF protection if moving away from JWT + localStorage'),
      gap(),

      h3('B. Production Deployment'),
      bullet('Docker Compose setup: Node.js + PostgreSQL containers with volume persistence'),
      bullet('HTTPS / TLS via reverse proxy (Nginx or Caddy in front of Express)'),
      bullet('CI/CD pipeline (GitHub Actions) for automated testing and deployment'),
      bullet('Environment-specific .env files: development / staging / production'),
      bullet('Structured logging via Winston — searchable log files with severity levels'),
      gap(),

      h3('C. Data Improvements'),
      bullet('Session pagination in profile history — currently all sessions load at once'),
      bullet('Admin player list pagination — currently all players load at once'),
      bullet('Soft-delete for users — archive instead of hard-delete to preserve historical data'),
      bullet('Database migrations tool (e.g. node-pg-migrate) instead of manual schema.sql'),
      gap(),

      h2('Priority 5 — Gamification & Long-Term Engagement'),
      bullet('Achievements: "Perfect Score" (100/100), "Speed Runner" (all correct in under 90s), "Safe Hands" (10 sessions with No Injury bonus)'),
      bullet('Daily streaks: consecutive days with at least one training session completed'),
      bullet('Department challenges: which team achieves the highest average score in a month?'),
      bullet('Progressive package unlocks: new scenarios unlock as a player levels up through completed sessions'),
      bullet('In-game notifications: push reminders (via service worker) for daily training sessions'),
      pb(),

      // ══════════════════════════════════════════════════════════
      // 15. CHANGELOG
      // ══════════════════════════════════════════════════════════
      h1('15. Development Changelog'),
      tbl(['Version','Date','Key Changes'],[
        ['0.1','20 Aug 2026','Initial A-Frame 3-D warehouse, player movement, first-person camera, basic package inspect panel'],
        ['0.2','21 Aug 2026','Shelf collision system, improved 5-level industrial racking geometry (orange uprights), minimap canvas'],
        ['0.3','23 Aug 2026','Complete scoring system (technique + time + injury bonus), debrief results screen, timer logic'],
        ['0.4','24 Aug 2026','Express backend, PostgreSQL schema (3 tables), JWT auth, register and login pages'],
        ['0.5','25 Aug 2026','Admin panel, player profile page, /api/sessions/save, session history view'],
        ['0.6','26 Aug 2026','Job role dropdown on registration (11 roles), admin seed script updated with role support, DB migration'],
        ['0.7','27 Aug 2026','Close button on login/register modals, session save 0-score bug fixed, README.md created'],
        ['0.8','27 Aug 2026','User name badge moved to footer-right; top-right duplicate removed; auth-row streamlined to nav links only'],
        ['0.9','28–29 Aug 2026','Help nudge animation doubled (4.2s→8.4s), scoring table in help panel, full toast notification system, START GAME direct to game.html'],
        ['1.0','30 Aug 2026','Universal login toast (works via START GAME path too), Sign In label consistency, pos-04 shelf y-coordinate bug fix'],
      ]),
      pb(),

      // ══════════════════════════════════════════════════════════
      // APPENDIX
      // ══════════════════════════════════════════════════════════
      h1('Appendix — Quick Reference'),

      h2('A. Application URLs'),
      tbl(['Page','URL'],[
        ['Home / Start','http://localhost:3000/'],
        ['Game','http://localhost:3000/game.html'],
        ['How to Play','http://localhost:3000/how-to-play.html'],
        ['Debrief / Results','http://localhost:3000/debrief.html'],
        ['Sign In','http://localhost:3000/login.html'],
        ['Register','http://localhost:3000/register.html'],
        ['My Profile','http://localhost:3000/profile.html'],
        ['Admin Panel','http://localhost:3000/admin.html'],
      ]),
      gap(),

      h2('B. Default Admin Credentials'),
      tbl(['Field','Value'],[
        ['Email','admin@liftorleave.it'],
        ['Password','Admin@Loli123!'],
        ['Username','Admin'],
        ['Job Role','Team Leader / Supervisor'],
      ]),
      noteBox('Change the admin password in backend/.env before sharing or deploying the application to any shared environment.','FFF3CD','E09020'),
      gap(),

      h2('C. UI Colour Palette'),
      tbl(['Colour Name','Hex Code','Usage'],[
        ['Background','#080808','Page and 3-D scene background — near-black'],
        ['Teal / Primary','#2CB98A','Buttons, highlights, positive indicators, PASS badge'],
        ['Orange / Racking','#CC5010','Warehouse shelf uprights and horizontal beams'],
        ['Card Background','rgba(14,16,14,0.94)','UI overlay card backgrounds'],
        ['Danger / Red','#F07070','Wrong choice indicators, Log Out button'],
        ['Warning / Amber','#E09020','Good/sub-optimal choice indicators'],
        ['Subtle Text','rgba(255,255,255,0.45)','Labels, captions, secondary information'],
      ]),
      gap(),

      h2('D. Typography'),
      tbl(['Font','Source','Usage'],[
        ['Bebas Neue','Google Fonts CDN','Game title: "LIFT OR LEAVE IT"'],
        ['Rajdhani','Google Fonts CDN','UI buttons, labels, stats, nav elements'],
        ['Barlow','Google Fonts CDN','Longer body text and descriptive content'],
        ['Calibri','System font (Word)','This documentation'],
      ]),
      gap(),

      h2('E. Shelf Board Heights (Back Wall & Side Walls)'),
      tbl(['Level','Board Centre Y','Board Top Surface Y','Interactive Spawn Y'],[
        ['Level 1 (lowest)','0.55 m','0.59 m','0.59 m — package center = 0.59 + h÷2'],
        ['Level 2','1.35 m','1.39 m','1.39 m'],
        ['Level 3','2.15 m','2.19 m','2.19 m'],
        ['Level 4','2.95 m','2.99 m','2.99 m'],
        ['Level 5 (top)','3.75 m','3.79 m','3.79 m'],
      ]),
      p('All shelf boards are 0.08 m thick. The back wall boards are 4.30 m wide × 1.55 m deep. Board tops match the y coordinate stored in POSITIONS (data.js).'),

    ]
  }]
});

// ─── Output ──────────────────────────────────────────────────────────────────
const outFile = path.join(__dirname, '..', 'Lift-or-Leave-It-Documentation.docx');
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outFile, buf);
  console.log('[docs] Written: ' + outFile);
  console.log('[docs] Size: ' + (buf.length / 1024).toFixed(1) + ' KB');
}).catch(err => {
  console.error('[docs] Failed: ' + err.message);
  process.exit(1);
});
