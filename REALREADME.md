- Alerts system: create/list/mark-read/delete alerts, unread count and stats.
- Opportunities pipeline: ML-backed arbitrage scanning, create/update/expire/execute opportunities, manual scan trigger and stats.
- Data pipeline: periodic token price and gas price refreshes, data cleanup tasks.
- Tokens API: list tokens, per-chain token queries, and price refresh endpoint.
- Preferences: user notification settings, tracked tokens, alert thresholds, appearance settings.
- Contact support endpoint with rate limiting.
- Real-time: Socket.IO WebSocket server with authenticated connections and broadcast rooms.
- Background jobs: `DataPipeline` and `OpportunityScanner` (cron jobs) to keep data fresh and run analysis.



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