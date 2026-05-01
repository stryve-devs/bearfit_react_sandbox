# Bearfit Backend — Documentation

## Key concepts — quick definitions

Before you dive in, here are simple definitions of common backend terms used throughout this document:

- Controllers
  - What they are: Functions (or objects) that receive HTTP requests, call the right business logic, and send HTTP responses back to the client.
  - What they do: Validate or parse request data (often after middleware), call services to perform work, and format the response (status code + JSON).

- Middlewares
  - What they are: Small functions run in the request/response pipeline before controllers.
  - What they do: Perform reusable tasks like authentication checks, request validation, parsing, logging, or error handling. They can stop the request early by sending a response (e.g., 401) or call `next()` to continue.

- Routes
  - What they are: URL + HTTP method mappings that connect an incoming request to the correct controller function.
  - What they do: Define the API surface (paths like `/api/auth/login`) and attach any route-level middleware and controllers.

- Services
  - What they are: Modules that contain the core business logic (database queries, token generation, complex operations).
  - What they do: Keep controllers thin by handling data access and domain logic; services usually call Prisma or other data layers.

- Utils (Utilities)
  - What they are: Small helper functions and shared utilities (for example: JWT helpers, password hashing, validation schemas).
  - What they do: Provide reusable code used across controllers and services to avoid duplication and keep code tidy.

---

This document explains how the backend works (simple, practical, and beginner-friendly). It focuses on the core backend logic (Express + TypeScript + Prisma). Redis/caching are intentionally ignored per request.

---

## Table of contents
- Overview
- Technologies
- How the backend is structured (high level)
- API endpoints (detailed)
- Project structure (`backend/src`)
- How a request flows (step-by-step)
- Troubleshooting: Prisma P1001 (can't reach DB) and how to fix
- Quick run / setup notes

---

## Overview
The backend is a Node.js application written in TypeScript using Express as the HTTP server and Prisma as the ORM to talk to a PostgreSQL database. It implements authentication (email/password + Google), user profiles, following relationships, uploads (presigned URLs for Cloudflare R2 / S3-compatible storage), and workout/post functionality.

The entry point is `backend/src/server.ts` which wires middleware, routes and starts the HTTP server.

---

## Technologies
- Node.js + TypeScript
- Express
- Prisma (PostgreSQL)
- Zod (request validation)
- bcrypt (password hashing)
- jsonwebtoken (JWT access + refresh tokens)
- AWS SDK v3 (`@aws-sdk/*`) for presigned URLs (configured for Cloudflare R2 in this project)
- Docker + docker-compose used for local development (redis + backend + frontend are defined)

---

## High-level structure (conceptual)
Request -> Express middleware (json parsing, CORS) -> route (e.g., `/api/auth`) -> optional validation middleware (Zod) -> controller -> service -> Prisma (DB) -> controller -> response

Key folders: `config`, `routes`, `controllers`, `services`, `utils`, `middlewares`, `models` and `prisma` (schema). See "Project structure" below.

---

## API Endpoints (list & details)
Base path: `/api`

Notes: for each endpoint below I show the route, HTTP method, purpose, request inputs, and the typical successful response shape (from the controller code). Endpoints using `authMiddleware` require the header `Authorization: Bearer <accessToken>`.

### Health
- GET `/api/health`
  - Purpose: Simple health check
  - Request: none
  - Response: 200 { status: 'ok', timestamp: string }
  - File: `backend/src/routes/index.ts`

### Auth (mounted at `/api/auth`)
All auth routes are in `backend/src/routes/auth/auth.routes.ts` and implemented in `backend/src/controllers/auth/auth.controller.ts` and `backend/src/services/auth/auth.service.ts`.

- POST `/api/auth/register`
  - Purpose: Create a new user (email/password)
  - Request body (validated by `registerSchema`): { name?: string, email: string, password: string (min 8 with mixed-case and number), username: string }
  - Response (201): { message: 'Registration successful', accessToken, refreshToken, user: { user_id, username, email, name } }

- POST `/api/auth/login`
  - Purpose: Login with email/password
  - Request body (`loginSchema`): { email: string, password: string }
  - Response (200): { message: 'Login successful', accessToken, refreshToken, user }

- POST `/api/auth/refresh`
  - Purpose: Exchange refresh token for new tokens
  - Request body (`refreshTokenSchema`): { refreshToken: string }
  - Response (200): { message: 'Token refreshed successfully', accessToken, refreshToken }

- POST `/api/auth/logout`
  - Purpose: Revoke a refresh token
  - Request body: { refreshToken: string }
  - Response (200): { message: 'Logout successful' }

- POST `/api/auth/google`
  - Purpose: Sign in with Google (idToken) or fallback with { email }
  - Request body (two allowed shapes via `googleAuthSchema`):
    - { idToken: string, username?: string, name?: string }
    - or { email: string, username?: string, name?: string }
  - Response: similar to login/register with accessToken and refreshToken

- POST `/api/auth/register-google`
  - Purpose: Register a new user using Google idToken or email fallback
  - Request body: same shapes as `/google`
  - Response (201 or 200): tokens + user data

- GET `/api/auth/exists?email=<email>`
  - Purpose: Check if an email is already registered
  - Response: 200 { exists: boolean }

- GET `/api/auth/username-exists?username=<username>`
  - Purpose: Check if username is taken
  - Response: 200 { exists: boolean }

- GET `/api/auth/me` (protected)
  - Purpose: Return the profile of the current authenticated user
  - Auth: `Authorization: Bearer <accessToken>` required
  - Response: profile object matching `MeProfileResponse` in `auth.service.ts` (username, name, bio, profile_pic_url, followers[], following[], _count)

- PUT `/api/auth/profile` (protected)
  - Purpose: Update profile fields (name, username, email, bio, link_url, profile_pic_url or profile_pic_key)
  - Request body: any of { name, username, email, bio, link_url, profile_pic_url, profile_pic_key }
  - Response: 200 { message: 'Profile updated', user: { user_id, username, email, name, profile_pic_url } }

- GET `/api/auth/suggestions` (protected)
  - Purpose: Return suggested users (fallback excludes those you already follow)
  - Query: ?limit=N (default 8)
  - Response: 200 { users: [...] }

- POST `/api/auth/follow/:targetUserId` (protected)
  - Purpose: Follow another user
  - Path params: targetUserId (positive integer)
  - Response: 200 { isFollowing: true }

- DELETE `/api/auth/follow/:targetUserId` (protected)
  - Purpose: Unfollow
  - Response: 200 { isFollowing: false }

- DELETE `/api/auth/follower/:followerId` (protected)
  - Purpose: Remove a follower from your followers
  - Response: 200 { removed: boolean }

- POST `/api/auth/send-otp`
  - Purpose: Send an OTP code to an email (service uses Redis/nodemailer)
  - Request: { email }
  - Response: 200 { message: 'OTP sent' }

- POST `/api/auth/verify-otp`
  - Purpose: Verify an OTP
  - Request: { email, code }
  - Response: 200 { message: 'OTP verified' }

---

### Users (mounted at `/api/users`)
Routes in `backend/src/routes/users.routes.ts` and logic in `backend/src/controllers/users.controller.ts`.

- GET `/api/users/:id` (public)
  - Purpose: Get basic user info by numeric id or username string
  - Response: 200 { user_id, username, name, profile_pic_url, is_followed_by_current_user (if auth provided), workoutCount, followingCount, followersCount }

- GET `/api/users/:id/posts` (protected)
  - Purpose: Get posts for the user profile (viewer must be authenticated)
  - Query: limit, cursor (validated by `discoverFeedQuerySchema`)
  - Response: 200 { posts: [...], nextCursor }

- GET `/api/users/:id/followers`
  - Purpose: List followers
  - Response: 200 { followers: [ { user_id, username, name, profile_pic_url } ] }

- GET `/api/users/:id/following`
  - Purpose: List users the target is following
  - Response: 200 { following: [ ... ] }

---

### Uploads (mounted at `/api/uploads`)
Routes in `backend/src/routes/uploads.routes.ts` and controller `backend/src/controllers/uploads.controller.ts`.

- POST `/api/uploads/profile-picture` (protected)
  - Purpose: Get a presigned upload URL for the authenticated user's profile picture
  - Request body: { filename?: string, contentType?: string }
  - Response: 200 { uploadUrl, publicUrl, key }

- POST `/api/uploads/debug/profile-picture` (unauthenticated)
  - Purpose: Debug-only presign route (local testing)
  - Response: same shape as above

- GET `/api/uploads/proxy?key=<key>&url=<optional encoded url>`
  - Purpose: Proxy an image (backend streams image from R2 or a provided URL)
  - Response: Streams the image bytes with proper Content-Type

---

### Workouts & Posts (mounted at `/api/workouts`)
Routes in `backend/src/routes/workout/workout.routes.ts`. Controllers live in `backend/src/controllers/workout/*`

- POST `/api/workouts` (protected)
  - Purpose: Create/save a workout post
  - Validation: `saveWorkoutPostSchema` (title, exercises array, media[], durationSeconds, totals, etc.)
  - Response: 200/201 with the created post (controller/service dependent)

- GET `/api/workouts/discover` (protected)
  - Purpose: Fetch discover feed (pagination via limit/cursor)
  - Response: feed with posts and next cursor

- GET `/api/workouts/posts/:postId` (protected)
  - Purpose: Get a single post by ID

- POST `/api/workouts/posts/:postId/like` (protected)
  - Purpose: Toggle like for a post

- POST `/api/workouts/posts/:postId/comments` (protected)
  - Purpose: Create a comment on a post
  - Validation: `createPostCommentSchema` (text, optional parentId)

---

## Project structure (inside `backend/src`)
Below are the top-level folders and the role they play (based on current code):

- `config/`
  - `prismaClient.ts` — Prisma client singleton (export default prisma)
  - `redisClient.ts` — Redis client and `connectRedis()` helper (used at server startup)
  - `settings.ts` — central place that reads and validates required env vars
  - `corsConfig.ts` — CORS middleware config

- `routes/`
  - `index.ts` — mounts sub-routers (`/auth`, `/users`, `/uploads`, `/workouts`) and health check
  - `auth/` — `auth.routes.ts` (all auth/identity related routes)
  - `users.routes.ts` — user profile / followers / posts
  - `uploads.routes.ts` — presign and proxy endpoints
  - `workout/` — `workout.routes.ts` (post/workout endpoints)

- `controllers/`
  - `auth/` — `auth.controller.ts` (handles register, login, refresh, profile update, follow/unfollow, OTP)
  - `uploads.controller.ts` — presign, debug, proxy logic
  - `users.controller.ts` — get user info, followers, following, user posts
  - `workout/` — controllers for workout/posts (create, discover, comments, likes)

- `services/`
  - `auth/` — `auth.service.ts` (business logic for register, login, google sign-in, token handling, follow/unfollow), `otp.service.ts` (OTP via Redis + email)
  - `workout/` — `workout.service.ts` (handles feed queries and post persistence)
  - other domain services likely exist for specialized logic

- `utils/`
  - `jwtUtils.ts` — token generation/verification and duration parsing
  - `passwordUtils.ts` — bcrypt hash/compare helpers
  - `validationSchemas.ts` — Zod schemas used by request validation middleware
  - helper utilities used throughout

- `middlewares/`
  - `auth/authMiddleware.ts` — checks `Authorization` header and verifies access token
  - `validationMiddleware.ts` — runs Zod validation and returns 400 with errors when validation fails
  - other middlewares may exist (global error handling is defined inline in `server.ts`)

- `models/` — TypeScript typed objects (if present, used to centralize DTOs or DB-mapped types)

- `prisma/` — `schema.prisma` describes database models (users, refresh_tokens, posts, workouts, relations, enums)

- `server.ts` — Express app setup (body parser, routes, global error handler, Redis connect) and server start

---

## How a request flows (example flows)
All flows are similar; below are step-by-step examples with where code lives.

### Example: Registration (POST /api/auth/register)
1. Request arrives at `server.ts` and is routed to `/api/auth/register` via `routes/index.ts` and `auth.routes.ts`.
2. `validate(registerSchema)` runs (middleware `validationMiddleware.ts`) — if payload invalid, 400 returned with `errors` array.
3. Controller `register` in `controllers/auth/auth.controller.ts` executes.
4. Controller calls `registerUser` in `services/auth/auth.service.ts` which:
   - checks for existing user using Prisma `prisma.users.findUnique`
   - hashes password via `utils/passwordUtils.ts`
   - creates user via `prisma.users.create`
5. Controller generates JWT access and refresh tokens using `utils/jwtUtils.ts` and stores refresh token in DB (`prisma.refresh_tokens.create`).
6. Controller returns 201 JSON with tokens and user summary.

### Example: Protected route (GET /api/auth/me)
1. Route is mounted with `authMiddleware`.
2. `authMiddleware` reads `Authorization` header and calls `verifyAccessToken` from `jwtUtils`. If invalid/expired -> 401 returned.
3. On success `req.user` is set (JwtPayload) and controller (`me`) reads `req.user.userId` and calls `getCurrentUserProfile` service.
4. Service queries multiple Prisma tables to compose followers/following and counts; controller returns the assembled profile JSON.

---

## Troubleshooting: Prisma Error P1001 — "Can't reach database server"
You saw this error earlier when running the dev script:

Error: P1001
Can't reach database server at `db.prisma.io:5432`

What this means:
- The Prisma client (or `prisma` CLI) attempted to connect to the database using the `DATABASE_URL` from `backend/.env` and could not reach the host.
- In your current setup `backend/.env` contains a `DATABASE_URL` that points to `db.prisma.io:5432` (a remote host used by Prisma Data Platform or a managed DB). If that host is not reachable from your environment, you'll get P1001.

How to fix (pick one option):

Option A — Run a local Postgres container and point `DATABASE_URL` to it (recommended for local development)
1. Add a Postgres service in `docker-compose.yml` (example):

```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: db-container
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_DB=postgres
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

2. Update `backend/.env` to point to the local docker host by using the service name `db` from the compose network (when backend runs as container) or `localhost` when running locally outside Docker. Example values:

- If running with docker-compose (backend container -> network service `db`):

```env
DATABASE_URL=postgres://postgres:postgres@db:5432/postgres
```

- If running backend on your host (not in Docker) and Postgres is exposed on localhost:5432:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
```

3. Bring up the DB (and backend) with docker-compose:

```bash
docker-compose up -d db redis
# or bring up all services:
docker-compose up -d
```

4. Run prisma migrations/generate (inside backend directory):

```bash
cd backend
npm install
npx prisma generate
npx prisma db push   # or `npx prisma migrate dev` if you manage migrations
```

Option B — Use the remote DB (if intended)
- Ensure the `DATABASE_URL` in `backend/.env` is correct and reachable from your machine / container. If it's a Prisma Data Platform URL, ensure any required network access or credentials are configured. If your environment (e.g., company network) blocks outbound connections to that host, P1001 will happen.

Option C — Use Prisma Data Proxy / access tokens
- If your project used Prisma Data Platform, follow the official Prisma instructions to configure access tokens and Data Proxy. This usually involves adding a `PRISMA_API_KEY` or using `prisma login` and a different connection format. Check your project README or Prisma docs.

Why your current `docker-compose.yml` caused the issue:
- The provided `docker-compose.yml` defines `redis`, `backend`, and `frontend`, but it does not define a Postgres database service. The backend container expects `DATABASE_URL` to point at a database. Because no DB service is defined, the connection fails.

---

## Quick run / setup notes (local dev)
1. Copy `.env.example` to `backend/.env` and set secrets (do not commit `.env`)

```bash
cp backend/.env.example backend/.env
# edit backend/.env to configure DATABASE_URL, JWT secrets, and R2 keys
```

2. Start services (example using docker-compose):

```bash
# If you added a db service to docker-compose, bring up everything
docker-compose up -d
# If you're only experimenting locally, ensure Postgres is running and env DATABASE_URL points to it
```

3. From `backend/` run (if developing locally without Docker):

```bash
cd backend
npm install
npx prisma generate
npx prisma db push   # or npx prisma migrate dev if you use migrations
npm run dev
```

4. If you run into JWT secret errors at startup, set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in `backend/.env`. The app will throw if they are missing.

---

## Removing a `src` folder from the repository root (brief)
If you have a stray `src/` directory in the repository root you want to remove safely:
1. Backup any files you need (move them into `backend/src` or `frontend/src` if they belong to those projects).
2. Remove the directory and commit:

```bash
git mv src <where-you-want-it>    # move files if needed
# or delete safely after backup
rm -rf src
git add -A
git commit -m "Remove root src folder (moved contents into backend/frontend)"
```

---

## Useful file references (where to read code)
- `backend/src/server.ts` — app entry
- `backend/src/routes/index.ts` — route mounts
- `backend/src/routes/auth/auth.routes.ts` — auth routes
- `backend/src/controllers/auth/auth.controller.ts` — auth controller
- `backend/src/services/auth/auth.service.ts` — auth business logic
- `backend/prisma/schema.prisma` — database schema
- `backend/src/utils/validationSchemas.ts` — zod request schemas
- `backend/src/utils/jwtUtils.ts` — token helpers
- `backend/src/controllers/uploads.controller.ts` — presign & proxy logic

---

## Final notes
- This documentation focuses on the core backend logic and excludes cache/Redis internals as requested. If you want, I can:
  - Generate a Postman collection or OpenAPI spec for all endpoints.
  - Produce a short README in `backend/` with exact commands to get a local DB running via `docker-compose` and to seed example data.
  - Create `backend/.env.example` with placeholders (if you'd like us to add one to the repo).

If you'd like me to convert this into a `README.md` at the repository root or add an OpenAPI JSON/YAML file, tell me which format you prefer and I'll add it. 

---

(End of backend documentation)

