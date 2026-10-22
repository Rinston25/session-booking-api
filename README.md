# Session Booking API

Node.js + TypeScript + Express + MongoDB (Mongoose) API for teachers' time slots and user bookings.

## Setup

Prerequisites: Node.js 18+ and a running MongoDB (local, Docker, or Atlas).

```bash
npm install
cp .env.example .env      # then edit values if needed
npm run dev               # ts-node-dev with auto-reload
# or: npm run build && npm start
```

Quick local Mongo via Docker: `docker run -d -p 27017:27017 --name mongo mongo:7`

### Environment variables

| Variable      | Description                  | Example                                          |
| ------------- | ---------------------------- | ------------------------------------------------ |
| `PORT`        | HTTP port (default `3000`)   | `3000`                                           |
| `MONGODB_URI` | MongoDB connection string    | `mongodb://127.0.0.1:27017/session-booking`      |

## Teachers (not in the assignment)

The assignment defines no Teacher API, but sessions need a teacher. Two helpers are provided:

1. **Seed script** – `npm run seed` upserts 3 teachers (safe to re-run) and prints their IDs.
2. **`POST /teachers`** – create one manually.

## Response format

```json
{ "success": true,  "data": { } }
{ "success": false, "message": "Reason" }
```

| Case                                   | Status |
| -------------------------------------- | ------ |
| Created                                | 201    |
| Validation error / invalid ObjectId / bad input | 400 |
| Resource not found / unknown route     | 404    |
| Duplicate key (Mongo 11000) / state conflict    | 409 |
| Anything else                          | 500    |

## Endpoints

All examples assume `http://localhost:3000`.

### `POST /teachers`
```json
{ "fullName": "Asha Verma", "email": "asha@example.com", "specialization": "Mathematics", "experience": 8 }
```
→ `201`

### `POST /users`
```json
{ "fullName": "Rinston Dsouza", "email": "rinston@example.com", "phone": "+919876543210" }
```
→ `201`; duplicate email → `409`; invalid fields → `400`. Emails are lowercased.

### `POST /sessions`
```json
{ "teacherId": "<teacherId>", "startTime": "2026-11-01T10:00:00Z", "endTime": "2026-11-01T11:00:00Z" }
```
→ `201`; teacher not found → `404`; `endTime <= startTime` or bad dates → `400`.

### `GET /sessions/available?dateTimestamp=<ms>`
Lists `AVAILABLE` sessions that start on that day, with the teacher joined (`teacher`), sorted by `startTime`.
Missing or non-numeric timestamp → `400`.

```bash
curl "http://localhost:3000/sessions/available?dateTimestamp=1793527200000"
```

### `POST /sessions/:id/book`
```json
{ "userId": "<userId>" }
```
→ `200` with the booked session. User not found → `404`; session not found → `404`; session not `AVAILABLE` → `409`.
Booking uses `findOneAndUpdate({ _id, status: 'AVAILABLE' }, { status: 'BOOKED', userId })`, so concurrent requests cannot double-book (verified: 4 parallel requests → one `200`, three `409`).

### `PATCH /sessions/:id/complete`
→ `200` sets `status: COMPLETED` and `completedAt: now`. Not found → `404`; not `BOOKED` → `409`.

### `GET /users/:id/sessions`
```json
{ "success": true, "data": { "upcomingSessions": [ ... ], "completedSessions": [ ... ] } }
```
`upcomingSessions` = `BOOKED`, sorted by `startTime` ascending; `completedSessions` = `COMPLETED`, sorted by `completedAt` descending. Each item includes its `teacher`. User not found → `404`.

## Postman

Import [postman/session-booking.postman_collection.json](postman/session-booking.postman_collection.json). It uses a `{{baseUrl}}` variable (default `http://localhost:3000`). Run the folders in order (Teachers → Users → Sessions): IDs and dates are stored as collection variables automatically, and error cases (400/404/409) are included with status assertions.

## Assumptions

- **Day boundaries use UTC.** `dateTimestamp` is a Unix timestamp in **milliseconds**; the day is `[00:00:00.000Z, 23:59:59.999Z]` of the UTC date containing it. A session at 02:00 IST on 2 Nov falls on 1 Nov in UTC. UTC was chosen so results don't depend on server timezone; clients in IST should send the UTC instant they want the day computed from.
- Timestamps in request bodies are ISO-8601 strings (anything `new Date()` parses).
- Overlapping slots for the same teacher are not prevented (not in the spec).
- No authentication; `userId` is supplied in the body as specified.
- Teacher email is unique, as with users.

## Project structure

```
src/
  config/       env + DB connection
  models/       User, Teacher, Session
  controllers/  request handlers
  routes/       Express routers
  middlewares/  central error handler
  utils/        ApiError, asyncHandler
  scripts/      seed.ts
  app.ts        Express app
  server.ts     DB connect + listen
```
