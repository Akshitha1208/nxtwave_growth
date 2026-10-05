# AI Project Match

AI Project Match is a growth-focused product for final-year engineering students. It helps them answer a short quiz, receive a personalized AI project recommendation, join a free workshop, and then share a referral code that unlocks additional growth mechanics.

## Why this product exists

The challenge is to turn a simple idea into a working growth engine that teaches students how to build an AI project, register for a workshop, and share that opportunity with classmates. The product is designed to feel real and demo-friendly rather than like a generic brochure page.

## Product overview

- Landing page with strong positioning
- 5-question recommendation quiz
- Deterministic project recommendation engine
- Buildability scoring
- Structured registration flow
- Unique referral code generation
- Referral dashboard with milestones
- Leaderboard with live data
- Admin analytics dashboard

## Architecture

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Local database: SQLite + Prisma ORM
- Production database: PostgreSQL + Prisma ORM
- Validation: Zod

## Folder structure

```text
nxtwave/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── .env.example
│   ├── prisma/schema.sqlite.prisma
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── package.json
├── README.md
└── .gitignore
```

## Database schema

The main database model is `Student` with fields for:

- identity: name, email, phone, college, branch, graduationYear
- campaign: source, utm data, referralCodeUsed
- referral: referralCode, referredById
- recommendation: recommendedProject, buildabilityScore, quizAnswers
- metadata: createdAt, updatedAt, isDemo

There is also a `CampusCaptain` model for campus referral code tracking.

## How referral tracking works

1. A student registers and receives a unique referral code.
2. When the landing page is opened with a referral query like `?ref=AI60-XXXX`, the code is temporarily saved in localStorage.
3. When a new student registers, the backend checks the referral code and links that student to the referrer.
4. The referrer’s dashboard counts the number of successful registrations tied to that code.
5. Referral milestones unlock at 2, 5, and 10 referrals.

## How recommendation scoring works

The recommendation engine scores each project against the student answers using a deterministic weighted formula:

- branch compatibility
- AI interest match
- skill-level fit
- motivation fit
- available time fit
- portfolio and placement utility

The top-scoring project is selected and then paired with a buildability score based on the same answer set.

## How to install

```bash
cd "c:\7th SEM\nxtwave"
npm install
cd backend
npm install
cd ../frontend
npm install
```

## How to run frontend

```bash
cd "c:\7th SEM\nxtwave\frontend"
npm run dev
```

Open: http://localhost:5173

## How to run backend

```bash
cd "c:\7th SEM\nxtwave\backend"
npm run dev
```

API runs at: http://localhost:4040

## How to initialize the database

For local SQLite development:

```bash
cd "c:\7th SEM\nxtwave\backend"
npm run migrate
```

The local `dev` command generates the SQLite Prisma Client and synchronizes the local schema. `prisma/schema.prisma` and the active migration folder are PostgreSQL-only. For production, run `npx prisma migrate deploy`; never run `prisma migrate dev` against production.

## How to seed demo data

```bash
cd "c:\7th SEM\nxtwave\backend"
npm run seed
```

## Environment variables

Create `backend/.env` from `backend/.env.example` for local development:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=4040
ADMIN_PASSWORD="demo-admin-pass"
CLIENT_URL="http://localhost:5173"
```

Create `frontend/.env` from `frontend/.env.example` and set `VITE_API_URL=http://localhost:4040`. Production uses the deployed API URL in this variable. Never put secrets in `VITE_` variables.

## How to test

```bash
cd "c:\7th SEM\nxtwave\backend"
npm test
```

## How to build for production

```bash
cd "c:\7th SEM\nxtwave\frontend"
npm run build
cd "c:\7th SEM\nxtwave\backend"
npm run build
```

## Deployment instructions

### Render PostgreSQL and backend

1. Create a PostgreSQL database in Render. Use its internal connection URL for a Render-hosted backend in the same region; use the external URL only from outside Render.
2. Create a Render Web Service connected to the GitHub repository and set its root directory to `backend`.
3. Set the build command to `npm install && npx prisma generate && npm run build`.
4. Set the pre-deploy command to `npx prisma migrate deploy`.
5. Set the start command to `npm start`.
6. Configure `DATABASE_URL` to the Render PostgreSQL URL, `ADMIN_PASSWORD` to a strong secret, `NODE_ENV=production`, and `CLIENT_URL` to the actual Vercel frontend origin. Render supplies `PORT`.
7. Do not run `npm run seed` in production; it is guarded for local SQLite only.

### Vercel frontend

1. Import the same GitHub repository in Vercel and set the root directory to `frontend`.
2. Select Vite, set the build command to `npm run build`, and the output directory to `dist`.
3. Set `VITE_API_URL` to the actual Render backend URL without a trailing slash, then deploy.
4. Copy the actual Vercel URL into Render's `CLIENT_URL` and redeploy/restart the backend.

Never use example URLs as production configuration. Verify health, registration, referrals, leaderboard, and admin analytics against the deployed database before sharing the public frontend URL. Production CORS allows only the configured frontend origin. The root `.gitignore` excludes environment files, local databases, dependencies, and build output while allowing `.env.example` files.

## Known limitations

- SQLite is used only for local development; production uses PostgreSQL.
- This project is intentionally lightweight and not built for large multi-tenant traffic.
- The recommendation engine is deterministic and intentionally avoids external AI APIs unless configured later.

## Main user flow

1. Landing page
2. Quiz
3. Personalized result
4. Registration
5. Referral dashboard
6. Share referral link
7. Referral leaderboard and admin analytics

## Demo flow for a 3-minute interview

1. Open the landing page.
2. Click “Find My AI Project”.
3. Complete the 5-question quiz.
4. Show the recommended project and buildability score.
5. Register using a real email and phone.
6. Show the referral dashboard with the generated code.
7. Copy or share the link.
8. Open the leaderboard and admin analytics to show live campaign data.
