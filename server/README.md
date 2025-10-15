# ArbiTrader — Server

This is the Express + TypeScript backend for the ArbiTrader project in this repository.
It provides a REST API, real-time WebSocket interface, and background jobs for data collection and arbitrage opportunity scanning.

## Overview

Main capabilities:

- Authentication: registration, login, email verification, password reset, refresh tokens, CSRF cookie support, account lockout, and two-factor authentication (2FA).
- User profile management: read/update profile, change password, avatar upload (Cloudinary), delete account.


- Alerts system: create/list/mark-read/delete alerts, unread count and stats.
- Opportunities pipeline: ML-backed arbitrage scanning, create/update/expire/execute opportunities, manual scan trigger and stats.
- Data pipeline: periodic token price and gas price refreshes, data cleanup tasks.
- Tokens API: list tokens, per-chain token queries, and price refresh endpoint.
- Preferences: user notification settings, tracked tokens, alert thresholds, appearance settings.
- Contact support endpoint with rate limiting.
- Real-time: Socket.IO WebSocket server with authenticated connections and broadcast rooms.
- Background jobs: `DataPipeline` and `OpportunityScanner` (cron jobs) to keep data fresh and run analysis.

## Repo layout (server/)

- `routes/` — API route definitions (e.g. `authRoutes.ts`, `opportunityRoutes.ts`, `alertRoutes.ts`)
- `controllers/` — Route handlers and request logic
- `services/` — Integrations and domain services (AuthService, MLService, WebSocketService, EmailService, ApiClient)
- `models/` — Mongoose models (User, Opportunity, Alert, Token, UserPreference, ...)
- `jobs/` — Scheduled jobs: `dataPipeline.ts`, `opportunityScanner.ts`
- `middleware/` — Auth, validation, upload, error handling
- `config/` — Third-party config (Cloudinary, DB connection, passport, tokens)

## Environment variables

Create a `.env` from `env.example`. Key environment variables used by the server include (not exhaustive):

- `PORT` — HTTP server port (e.g. 5001)
- `NODE_ENV` — `development` or `production`
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Secret used to sign JWTs
- `CLIENT_URL` — Frontend origin for CORS and cookie settings
- `ML_SERVICE_URL` — URL of the ML microservice used for arbitrage analysis
- `CLOUDINARY_URL` or `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — for uploads
- `EMAIL_*` — SMTP/API keys for sending verification/reset emails

Check `env.example` for a fuller list.

## Development

Install dependencies and run the server locally:

```bash
cd server
npm install
npm run dev
```

Notes:
- `npm run dev` runs `ts-node server.ts` (see `package.json`).
- `npm start` runs the production start command (node server.js) if you build or produce a JS entry.

## Tests

Run tests with:

```bash
npm test
```

There are unit/integration tests under `server/test/` for core flows like auth and profile.

## API overview (top-level groups)

- `POST /api/auth/*` — register, login, refresh, logout, verify email, resend/regenerate verification, forgot/reset password
- `GET/PUT /api/profile` — profile CRUD, change password, avatar upload
- `POST /api/two-factor/*` — setup and verify 2FA, verify-login for 2FA-protected logins
- `GET/POST /api/alerts/*` — alerts management (list, unread count, mark read, create test alert, delete, stats)
- `GET/POST /api/opportunities/*` — list, stats, supported pairs, manual scan, mark expired/execute
- `GET/PUT /api/preferences/*` — user preferences and tracked tokens
- `GET /api/tokens/*` — tokens and chains, refresh endpoint
- `POST /api/contact` — contact support (rate-limited)
- `GET/POST /api/websocket/*` — websocket status / admin endpoints

Refer to `server/routes/*.ts` and `server/controllers/*.ts` for detailed request/response shapes and validation schemas.

## WebSocket (Socket.IO)

- Uses JWT for socket auth (token provided in handshake). `WebSocketService` implements middleware to verify JWT.
- Rooms: `opportunities`, `tokens`, `alerts:<userId>`, `system` and filter-based rooms like `opportunities:{filters}`.
- The service exposes methods to broadcast new/updated/expired opportunities, token price updates, alerts, and system status.

Client connect example (pseudo):

```js
import { io } from 'socket.io-client';
const socket = io(SERVER_URL, { auth: { token: 'JWT_HERE' } });
socket.emit('subscribe', { type: 'opportunities' });
socket.on('new_opportunity', (payload) => console.log(payload));
```

## Background jobs

- `DataPipeline` — periodically refreshes token prices and gas prices, and performs data cleanup.
- `OpportunityScanner` — scheduled scan (every ~30 minutes) that calls the ML service to detect arbitrage, creates/updates `Opportunity` documents, and generates alerts for users.

## Health & monitoring

Services provide status helpers (ML health check, pipeline status, WebSocket stats). If not already exposed, consider adding an aggregated endpoint such as `/api/system/health` that returns DB, ML, pipeline, and socket status.

## Security notes

- Ensure production cookies use `secure: true` and `sameSite: 'strict'`.
- There is debug behavior in some auth code that stores raw verification tokens for debugging — ensure any such behavior is disabled in production.
- WebSocket in-memory connection tracking is not multi-instance-safe; use a Redis adapter for Socket.IO when scaling horizontally.

## Recommended next steps

1. Remove/guard debug token logging in `AuthService` for production safety.
2. Add unit tests for job logic (`OpportunityScanner`, `DataPipeline`) with the ML service mocked.
3. Add OpenAPI/Swagger docs for the REST API.
4. If horizontal scaling is planned, configure Socket.IO Redis adapter.

---

If you want, I can:
- Add an API reference section listing each endpoint with request/response schema.
- Create a top-level `README.md` for the whole repository (client + server).
- Implement a small patch to remove or guard the debug token lines in `AuthService`.

Tell me which of the above you'd like next and I'll proceed.
