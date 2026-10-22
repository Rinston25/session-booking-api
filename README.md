# Session Booking API

Backend for a platform where users book sessions with teachers.

**Stack:** Node.js · TypeScript · Express.js · MongoDB · Mongoose

> 🚧 Work in progress — repo scaffolded, implementation pending.

## Planned structure

```
src/
  config/        # env + DB connection
  models/        # User, Teacher, Session (Mongoose)
  controllers/   # request handlers
  services/      # business logic + aggregation pipelines
  routes/        # Express routers
  middlewares/   # centralized error handler, 404
  validators/    # request body validation
  utils/         # ApiError, asyncHandler
postman/         # Postman collection
```

## Endpoints

| Method | Path | Notes |
|---|---|---|
| POST | /users | Create user (unique email) |
| POST | /sessions | Create session (teacher must exist, endTime > startTime) |
| GET | /sessions/available?dateTimestamp= | Aggregation pipeline |
| POST | /sessions/:id/book | AVAILABLE → BOOKED |
| PATCH | /sessions/:id/complete | BOOKED → COMPLETED |
| GET | /users/:id/sessions | Upcoming vs completed, aggregation pipeline |

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```
