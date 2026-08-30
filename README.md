# ReachInbox — Full-Stack Email Scheduler

**ReachInbox Software Development Intern Assignment**

---

## Author

**Abdul Rahman**

---

## Overview

ReachInbox is a full-stack email scheduling platform that allows users to compose, schedule, and send emails to multiple recipients with configurable delays and hourly rate limits. The system is built with a Next.js frontend and an Express.js backend, using PostgreSQL for persistence, BullMQ + Redis for reliable job scheduling, Elasticsearch for full-text search, and Ethereal SMTP for test email delivery.

---

## Key Features

- **Google OAuth authentication** with HTTP-only JWT cookies
- **Email scheduling** with configurable start time and delay between recipients
- **CSV/TXT bulk upload** for recipient lists
- **BullMQ delayed jobs** for reliable, restart-persistent scheduling
- **Hourly rate limiting** with automatic job rescheduling
- **Slack OAuth integration** for rate-limit notifications
- **Elasticsearch full-text search** across recipients, subjects, and email bodies
- **Bull Board dashboard** for real-time queue monitoring
- **Email deletion** with BullMQ job cancellation
- **Compact dashboard UI** matching Figma design specifications

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Express.js 5, TypeScript, Zod validation |
| Database | PostgreSQL 16 (via Prisma 6.19 ORM) |
| Queue | BullMQ 6.3 + Redis 7 |
| Search | Elasticsearch 8.15 |
| Email | Nodemailer + Ethereal SMTP |
| Auth | Google OAuth 2.0, JWT (http-only cookies) |
| Notifications | Slack Web API (OAuth) |
| Infrastructure | Docker Compose |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│          React 19 · TypeScript · Tailwind CSS           │
│  Dashboard · Compose · Search · Email Detail · Login    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP (credentials)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Express.js API                         │
│            Controllers · Services · Middleware           │
│  Auth · Emails · Senders · Search · Slack · Bull Board   │
└──┬──────────┬──────────┬──────────┬──────────┬──────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
┌──────┐ ┌──────┐ ┌──────────┐ ┌──────┐ ┌─────────┐
│Postgr│ │Redis │ │Elastic-  │ │Ethere│ │Slack    │
│eSQL  │ │      │ │search    │ │al    │ │Web API  │
│ 16   │ │  7   │ │  8.15    │ │SMTP  │ │         │
└──────┘ └──┬───┘ └──────────┘ └──────┘ └─────────┘
            │
            ▼
     ┌──────────────┐
     │   BullMQ     │
     │  email-send  │
     │    Queue     │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │ Email Worker  │
     │  Nodemailer   │
     │  → Ethereal   │
     └──────────────┘
```

**Component Responsibilities:**

- **Next.js Frontend** — User interface for login, dashboard, composing, scheduling, searching, and viewing emails
- **Express API** — REST API handling authentication, email CRUD, scheduling, sender management, search proxy, and Slack integration
- **PostgreSQL** — Source of truth for users, senders, and email records
- **Redis** — Backing store for BullMQ job state and rate-limit counters
- **BullMQ** — Delayed job queue that holds scheduled emails until their send time
- **Email Worker** — Background process that picks up due jobs, checks rate limits, and sends via Ethereal
- **Elasticsearch** — Secondary index for full-text search across email fields
- **Ethereal SMTP** — Fake SMTP server for test email delivery with preview URLs
- **Slack Web API** — Sends rate-limit notification DMs to connected users

---

## Project Structure

```
Email Schedular/
├── backend/
│   ├── src/
│   │   ├── config/              # Prisma, Redis, Elasticsearch, Ethereal clients
│   │   ├── controllers/         # Route handlers (auth, email, slack)
│   │   ├── middleware/          # JWT authentication middleware
│   │   ├── queues/              # BullMQ queue definition
│   │   ├── routes/              # Express route definitions
│   │   ├── services/            # Business logic (email, auth, search, slack)
│   │   ├── utils/               # Rate limiting (Redis Lua script)
│   │   ├── workers/             # BullMQ email worker
│   │   └── server.ts            # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── .env.example             # Environment variable template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── dashboard/       # Main dashboard page
│   │   │   ├── login/           # Login page
│   │   │   └── page.tsx         # Root redirect
│   │   ├── components/
│   │   │   ├── emails/          # EmailTable, EmailRow, EmailDetail, ComposePage, FileUpload
│   │   │   ├── layout/          # Sidebar, Header
│   │   │   └── ui/              # Button, Input, Toast
│   │   ├── hooks/               # useScheduledEmails, useSentEmails, useSearchEmails
│   │   ├── services/            # API client (axios)
│   │   └── types/               # TypeScript type definitions
│   ├── .env.local               # Frontend environment variables
│   └── package.json
├── docker-compose.yml           # PostgreSQL, Redis, Elasticsearch
└── README.md
```

---

## How the System Works

1. **User authenticates** via Google OAuth. The backend exchanges the authorization code, creates/updates the user record, and sets an HTTP-only JWT cookie.

2. **User composes an email** in the dashboard, selecting a sender, adding recipients (manually or via CSV upload), writing a subject/body, and choosing a start time and delay between sends.

3. **Backend schedules emails** by creating a PostgreSQL record for each recipient and adding a BullMQ delayed job with the computed send time. The delay is `max(userDelay, MIN_SEND_DELAY_MS)`.

4. **BullMQ holds jobs** in Redis until their scheduled time. When a job becomes due, the worker picks it up.

5. **Worker processes the job** — checks idempotency (skips if already sent), enforces hourly rate limits (reschedules if exceeded), sends the email via Ethereal SMTP, updates PostgreSQL status to "sent", and updates the Elasticsearch index.

6. **User views results** on the dashboard — scheduled emails show with status badges, sent emails show with sent timestamps, and search queries hit Elasticsearch for fast full-text results.

---

## Scheduling Architecture

Email scheduling uses **BullMQ delayed jobs** backed by Redis.

**Flow:**

```
POST /api/emails/schedule
  → Create N PostgreSQL records (one per recipient)
  → Add N BullMQ delayed jobs (one per email)
  → Each job has delay = max(0, scheduledAt - now)
  → Index emails in Elasticsearch
```

**What happens at send time:**

```
BullMQ delayed job becomes due
  → Worker picks up job
  → Check idempotency (skip if already sent)
  → Check hourly rate limit
    → If allowed: send email, update DB, update ES
    → If exceeded: reschedule to next hourly window
  → Job completes
```

**Key design decisions:**

- **No cron jobs.** BullMQ's built-in delayed job scheduler handles all timing.
- **No node-cron, Agenda, or OS-level cron.** The queue is the sole scheduling mechanism.
- **Redis is the scheduler.** BullMQ uses Redis sorted sets to track delayed jobs.
- **PostgreSQL is the source of truth.** Email state (scheduled/sent/failed) lives in the database. Elasticsearch is a secondary search index.

---

## Persistence & Restart Recovery

Scheduled emails survive backend restarts because:

1. **PostgreSQL** stores the email record permanently
2. **Redis** persists the BullMQ job state (delayed jobs survive Redis restarts when persistence is configured)
3. On backend restart, the worker re-connects to Redis and picks up any due or delayed jobs
4. No scheduled work is lost

```
User schedules email
  → PostgreSQL record created
  → BullMQ delayed job added to Redis
  → Backend restarts
  → Worker starts, reconnects to Redis
  → Delayed job still available in queue
  → Email processed when scheduled time arrives
```

---

## BullMQ Worker Concurrency

The worker processes multiple email jobs concurrently.

**Configuration:**

| Setting | Default | Source |
|---------|---------|--------|
| Worker concurrency | `5` | `WORKER_CONCURRENCY` env var |
| Queue name | `email-send` | Hardcoded |
| Remove on complete | Last 100 jobs | Queue default options |
| Remove on fail | Last 50 jobs | Queue default options |

**Worker behavior:**

- Processes up to 5 jobs simultaneously
- Each job is independent (no shared state between concurrent jobs)
- Rate limiting is enforced per-sender using an atomic Redis Lua script
- Failed jobs are logged but do not block other jobs

---

## Email Delay / Throttling

The delay between consecutive emails to different recipients is configurable.

**How it works:**

- User specifies `delayBetweenEmails` in seconds (via the compose form)
- Backend enforces a minimum delay via `MIN_SEND_DELAY_MS` (default: `2000` ms)
- Effective delay: `max(userDelay, MIN_SEND_DELAY_MS)`
- Each recipient's send time is: `startTime + (index * effectiveDelay)`

**Example:**

- 3 recipients, start time 10:00 AM, delay 5 seconds
- Recipient 1: scheduled at 10:00:00
- Recipient 2: scheduled at 10:00:05
- Recipient 3: scheduled at 10:00:10

---

## Hourly Rate Limiting

The system enforces a per-sender hourly rate limit to prevent abuse.

**Configuration:**

| Setting | Default | Source |
|---------|---------|--------|
| Max emails per hour | `50` | `MAX_EMAILS_PER_HOUR` env var |

**Implementation:**

- Uses a Redis-backed atomic Lua script for concurrent-safe counting
- Rate limit key: `rate-limit:{senderId}:{hourWindow}` (hour window is a Unix timestamp rounded to the hour)
- Counter expires after 1 hour automatically (Redis TTL)
- Checked atomically via `checkAndIncrementRateLimit` before each email send

**When the limit is reached:**

1. The worker detects the rate limit exceeded
2. The email's `scheduledAt` is updated to the next hourly window
3. The job is moved to delayed state via `job.moveToDelayed()`
4. A Slack notification is sent (once per hour window per sender) informing the user that emails have been rescheduled
5. The next hourly window, jobs resume processing normally

**Multi-instance safety:**

- The Redis Lua script executes atomically, so concurrent workers or multiple backend instances cannot over-count
- Each sender has an independent rate limit counter

---

## Slack Rate-Limit Notifications

When a sender hits the hourly rate limit, the system notifies the user via Slack.

**Flow:**

1. User connects Slack via OAuth (`GET /api/slack/connect` → Slack OAuth → callback)
2. The Slack bot token and team ID are stored in the database
3. When a rate limit is hit, the worker calls `sendSlackNotification(userId, message)`
4. The service looks up the user's Slack connection, finds the bot token, and sends a DM
5. Notification is deduplicated per hour window using a Redis key (`slack-rate-notified:{senderId}:{hourWindow}`) with 1-hour TTL

**If Slack is not connected:**

- The notification attempt is silently skipped
- Rate limiting still functions correctly (emails are rescheduled regardless)
- No error is thrown

---

## Idempotency / Duplicate Prevention

The system prevents duplicate email sends through multiple mechanisms:

1. **Job ID convention:** Each BullMQ job uses `email-{emailId}` as the job ID. BullMQ deduplicates jobs with the same ID within the same queue.

2. **Worker status check:** Before processing, the worker reads the email from PostgreSQL. If `status === "sent"`, the job is skipped with `{ skipped: true }`.

3. **Database status transition:** After sending, the email status is updated to `"sent"`. Any subsequent processing of the same email will see this status and skip it.

4. **BullMQ retry behavior:** If a job fails, BullMQ retries it. The idempotency check ensures a retried job for an already-sent email is safely skipped.

**What happens on retry:**

- Worker loads the email record
- Sees `status === "sent"` (set by a previous successful attempt)
- Returns `{ skipped: true }` without sending again
- No duplicate email is delivered

---

## Elasticsearch Search

Elasticsearch provides full-text search across email fields.

**When emails are indexed:**

- Immediately after scheduling (in `scheduleEmails` service)
- When email status changes (sent/failed) via `updateEmailStatus`

**Searchable fields:**

| Field | Mapping |
|-------|---------|
| `recipient` | `text` with `keyword` sub-field |
| `subject` | `text` |
| `body` | `text` |
| `userId` | `keyword` (used for filtering) |

**Search endpoint:** `GET /api/emails/search?q=<query>`

- Uses `multi_match` across `recipient`, `subject`, and `body`
- Filters by `userId` to ensure users only see their own emails
- Returns matching email documents with IDs

**Relationship to PostgreSQL:**

- PostgreSQL is the source of truth for email state and delivery
- Elasticsearch is a secondary index optimized for search
- If Elasticsearch is unavailable, scheduled/sent lists still work (they query PostgreSQL directly)
- Search fails gracefully with a 503 error if Elasticsearch is down

---

## Authentication

The system uses **Google OAuth 2.0** for authentication.

**Flow:**

```
1. User clicks "Sign in with Google"
   → Frontend redirects to GET /api/auth/google
   → Backend generates Google OAuth URL
   → Redirects to Google

2. Google authenticates user
   → Redirects back to GET /api/auth/google/callback?code=...

3. Backend exchanges code for tokens
   → Fetches user info from Google
   → Creates or updates user in PostgreSQL
   → Signs JWT with userId + email
   → Sets HTTP-only cookie (7-day expiry)

4. Frontend calls GET /api/auth/me
   → Middleware verifies JWT from cookie
   → Returns user profile

5. Logout
   → POST /api/auth/logout
   → Clears the cookie
   → Redirects to /login
```

**Security details:**

- JWT is stored in an HTTP-only cookie (not accessible via JavaScript)
- Cookie is `SameSite: Lax`, `Secure` in production
- JWT expires after 7 days
- All API routes (except auth and health) require the `authenticate` middleware
- User scoping: all data queries filter by `userId` from the JWT

---

## Ethereal Email

The system uses **Ethereal** (ethereal.email) as the SMTP provider for test email delivery.

**Why Ethereal:**

- Ethereal is a fake SMTP service designed for testing
- Emails are not delivered to real inboxes
- Each sent email gets a **preview URL** that can be opened in a browser to view the email content
- No real email accounts or credentials are needed

**How it works:**

1. On first use, if no Ethereal credentials are configured, the system creates a test account via `nodemailer.createTestAccount()`
2. Credentials can also be provided via `ETHEREAL_USER` and `ETHEREAL_PASSWORD` environment variables
3. Emails are sent through `smtp.ethereal.email:587`
4. The preview URL is logged to the console and stored in the job result
5. Sent emails appear in the Ethereal dashboard for inspection

**Important clarification:** Ethereal is a testing/fake SMTP service. Emails are inspected through the Ethereal preview URL rather than being delivered to real email addresses.

---

## Frontend Features

| Feature | Description |
|---------|-------------|
| **Google OAuth Login** | Redirects to Google, handles callback, stores JWT in cookie |
| **Dashboard** | Lists scheduled and sent emails with tab navigation |
| **Compose Email** | Full compose form with sender selection, recipients, subject, body, delay, hourly limit, start time |
| **CSV/TXT Upload** | Parses uploaded files with PapaParse, extracts email addresses from all cells |
| **Email Detail** | Full email view with sender info, body, status, and metadata |
| **Email Deletion** | Confirmation dialog → DELETE API → BullMQ job cancellation → list refresh |
| **Elasticsearch Search** | Real-time search across recipients, subjects, and bodies |
| **Scheduled Emails** | Compact row with recipient, orange status badge with date, subject + preview |
| **Sent Emails** | Compact row with recipient, green "Sent" badge, subject + preview |
| **Slack Connection** | OAuth flow to connect Slack workspace for notifications |
| **User Dropdown** | Sidebar profile with name/email, click-outside close, logout |
| **Loading States** | Spinner components for async operations |
| **Empty States** | "No scheduled emails" / "No sent emails" messages |
| **Toast Notifications** | Success/error toasts with auto-dismiss (4 seconds) |
| **Responsive Layout** | Sidebar + content layout with proper overflow handling |

---

## API Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| `GET` | `/api/health` | Database health check | No |
| `GET` | `/api/auth/google` | Initiate Google OAuth | No |
| `GET` | `/api/auth/google/callback` | Google OAuth callback | No |
| `GET` | `/api/auth/me` | Get authenticated user profile | Yes |
| `POST` | `/api/auth/logout` | Clear auth cookie | No |
| `POST` | `/api/emails/schedule` | Schedule emails to recipients | Yes |
| `GET` | `/api/emails/scheduled` | List scheduled emails for user | Yes |
| `GET` | `/api/emails/sent` | List sent emails for user | Yes |
| `GET` | `/api/emails/search?q=` | Search emails via Elasticsearch | Yes |
| `GET` | `/api/emails/:id` | Get email detail with sender info | Yes |
| `DELETE` | `/api/emails/:id` | Delete email + cancel BullMQ job | Yes |
| `GET` | `/api/senders` | List user's sender accounts | Yes |
| `POST` | `/api/senders` | Create a new sender account | Yes |
| `GET` | `/api/slack/connect` | Initiate Slack OAuth | Yes |
| `GET` | `/api/slack/callback` | Slack OAuth callback | No |
| `GET` | `/api/slack/status` | Check Slack connection status | Yes |
| `POST` | `/api/slack/disconnect` | Disconnect Slack integration | Yes |
| `GET` | `/admin/queues` | Bull Board queue dashboard | No |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://reachinbox:password@localhost:5432/reachinbox` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `ELASTICSEARCH_URL` | Elasticsearch endpoint | `http://localhost:9200` |
| `JWT_SECRET` | Secret for signing JWTs | `your-secret-key` |
| `WORKER_CONCURRENCY` | Max concurrent email jobs | `5` |
| `MIN_SEND_DELAY_MS` | Minimum delay between sends (ms) | `2000` |
| `MAX_EMAILS_PER_HOUR` | Hourly rate limit per sender | `50` |
| `ETHEREAL_HOST` | SMTP host | `smtp.ethereal.email` |
| `ETHEREAL_PORT` | SMTP port | `587` |
| `ETHEREAL_USER` | Ethereal username (optional, auto-created if empty) | |
| `ETHEREAL_PASSWORD` | Ethereal password (optional, auto-created if empty) | |
| `SLACK_CLIENT_ID` | Slack app client ID | `your-slack-client-id` |
| `SLACK_CLIENT_SECRET` | Slack app client secret | `your-slack-client-secret` |
| `SLACK_REDIRECT_URI` | Slack OAuth callback URL | `http://localhost:5000/api/slack/callback` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `your-google-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `your-google-client-secret` |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL | `http://localhost:5000/api/auth/google/callback` |
| `FRONTEND_URL` | Frontend origin for CORS and redirects | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000` |

> **Warning:** Never commit `.env` files or secrets to version control.

---

## Local Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Google Cloud Console project with OAuth 2.0 credentials
- (Optional) Slack App with OAuth permissions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Email-Schedular.git
cd Email-Schedular
```

### 2. Start Docker infrastructure

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port `5433`
- Redis on port `6379`
- Elasticsearch on port `9200`

### 3. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in:
- `DATABASE_URL` (update port to `5433` if using Docker Compose)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET` (any random string)
- Slack credentials (optional)

### 4. Install backend dependencies and set up database

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the backend

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 6. Configure frontend environment

```bash
cd ../frontend
```

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 7. Install frontend dependencies and start

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

### 8. Open the application

Navigate to `http://localhost:3000` and sign in with Google OAuth.

---

## Docker

The `docker-compose.yml` defines three services:

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | `postgres:16` | `5433:5432` | Primary database |
| `redis` | `redis:7` | `6379:6379` | BullMQ job store + rate limiting |
| `elasticsearch` | `docker.elastic.co/elasticsearch/elasticsearch:8.15.0` | `9200:9200` | Full-text search index |

**Data persistence:**

All three services use named Docker volumes (`postgres_data`, `redis_data`, `elasticsearch_data`) so data survives container restarts.

**Start:**

```bash
docker-compose up -d
```

**Stop:**

```bash
docker-compose down
```

**Stop and remove data:**

```bash
docker-compose down -v
```

---

## Testing

### TypeScript & Build Checks

```bash
# Backend
cd backend
npx tsc --noEmit        # Type check
npm run build            # Compile

# Frontend
cd frontend
npx tsc --noEmit        # Type check
npm run build            # Production build
```

### Manual End-to-End Test Checklist

| # | Test | Expected Result |
|---|------|----------------|
| 1 | Open `/login` | Login page with Google button |
| 2 | Click "Sign in with Google" | Google OAuth flow, redirect to dashboard |
| 3 | Dashboard loads | Sidebar, header, scheduled email list |
| 4 | Click "Compose" | Compose page with sender, recipients, subject, body |
| 5 | Upload CSV file | Recipients parsed and displayed |
| 6 | Click "Send" or "Send Later" | Emails scheduled, success toast, return to dashboard |
| 7 | Scheduled list shows new emails | Orange status badges with scheduled dates |
| 8 | Open Bull Board (`/admin/queues`) | Queue dashboard showing jobs |
| 9 | Wait for scheduled time | Emails processed by worker, appear in Sent list |
| 10 | Open a sent email | Green "Sent" badge, detail view with body |
| 11 | Click delete on email detail | Confirmation dialog appears |
| 12 | Click "Cancel" | Dialog closes, email not deleted |
| 13 | Click "Delete" | Email removed, toast shown, list refreshes |
| 14 | Search for a recipient | Elasticsearch results appear in the list |
| 15 | Click a search result | Email detail opens |
| 16 | Restart backend (`Ctrl+C`, `npm run dev`) | Scheduled jobs survive, emails still send |
| 17 | Connect Slack (optional) | Slack OAuth flow, status shows connected |
| 18 | Trigger rate limit (send >50 emails/hour) | Slack notification, jobs rescheduled |
| 19 | Check Ethereal preview URL | Sent email visible in Ethereal dashboard |
| 20 | Click logout | Redirect to login, session cleared |

---

## Assignment Requirement Mapping

### Backend

| Requirement | Implementation | Status |
|------------|---------------|--------|
| Email scheduling | BullMQ delayed jobs with configurable start time and delay | Implemented |
| PostgreSQL persistence | Prisma ORM, email/user/sender records | Implemented |
| BullMQ | `email-send` queue with delayed jobs | Implemented |
| Redis | BullMQ backing store + rate-limit counters | Implemented |
| Concurrency | Worker concurrency configurable via `WORKER_CONCURRENCY` (default: 5) | Implemented |
| Delay between emails | Configurable `delayBetweenEmails` with `MIN_SEND_DELAY_MS` floor | Implemented |
| Hourly rate limiting | Redis Lua script, `MAX_EMAILS_PER_HOUR` (default: 50) | Implemented |
| Rate-limit rescheduling | `job.moveToDelayed()` to next hourly window | Implemented |
| Slack notification | Slack OAuth + DM via bot token on rate limit | Implemented |
| Elasticsearch | Index on schedule, `multi_match` search with userId filter | Implemented |
| Bull Board | `@bull-board/express` at `/admin/queues` | Implemented |
| Restart persistence | BullMQ delayed jobs persist in Redis across restarts | Implemented |
| Idempotency | Job ID `email-{id}` + worker status check before send | Implemented |
| Ethereal SMTP | Nodemailer with auto-created test accounts | Implemented |

### Frontend

| Requirement | Implementation | Status |
|------------|---------------|--------|
| Google login | Google OAuth 2.0 with JWT cookie | Implemented |
| Dashboard | Sidebar + header + email list + tab navigation | Implemented |
| Scheduled emails | Tab with status badges, scheduled dates | Implemented |
| Sent emails | Tab with sent status, sent timestamps | Implemented |
| Compose | Full form with sender, recipients, subject, body | Implemented |
| CSV upload | PapaParse-based file upload extracting emails | Implemented |
| Start time | DateTime picker in compose form | Implemented |
| Delay | Delay between emails input (seconds) | Implemented |
| Hourly limit | Displayed in compose form | Implemented |
| Search | Elasticsearch-backed real-time search | Implemented |
| Email detail | Full email view with sender, body, status | Implemented |
| Delete | Confirmation dialog + DELETE API + BullMQ job cancellation | Implemented |
| Loading states | Spinner components for async operations | Implemented |
| Empty states | "No emails" messages when lists are empty | Implemented |
| Error states | Toast notifications for failures | Implemented |
| Logout | Clears cookie, redirects to login | Implemented |

---

## Assumptions & Trade-offs

| Trade-off | Rationale |
|-----------|-----------|
| **Ethereal instead of production SMTP** | The assignment requires test email delivery. Ethereal provides a sandboxed SMTP server with preview URLs, avoiding the need for real email credentials. |
| **Google OAuth only** | Email/password authentication is not implemented. The login page email/password fields are visual only (disabled). Google OAuth is the sole authentication method. |
| **Elasticsearch as secondary index** | PostgreSQL is the source of truth. Elasticsearch provides fast full-text search but is not required for core functionality. Search degrades gracefully if ES is unavailable. |
| **Single-worker architecture** | The worker runs in-process with the Express server. For production, the worker would need to be extracted into a separate process. |
| **Rate limiting uses Redis atomic operations** | The Lua script ensures correctness under concurrency but adds Redis dependency for rate-limit state. |
| **BullMQ job IDs are deterministic** | Using `email-{id}` as the job ID ensures idempotency but means a job cannot be re-added with the same ID without removing the old one first. |
| **No email preview in-app** | Ethereal preview URLs are logged to the console rather than displayed in the UI. This keeps the frontend simpler while still allowing email inspection. |

---

## Code Quality

The project follows these engineering practices:

- **TypeScript throughout** — Both backend and frontend are written in TypeScript with strict type checking
- **Separation of concerns** — Controllers handle HTTP, services handle business logic, routes define endpoints, and middleware handles cross-cutting concerns
- **Authenticated user scoping** — All data queries filter by `userId` from the JWT, ensuring users cannot access each other's data
- **Prisma ORM** — Type-safe database access with migrations and schema management
- **Zod validation** — Request body validation using Zod schemas
- **Redis-backed atomic operations** — Rate limiting uses Lua scripts for correctness under concurrency
- **Worker separation** — The email worker is defined in a separate module but runs in the same process
- **Error handling** — Try/catch blocks with appropriate HTTP status codes and error messages
- **Non-fatal Elasticsearch** — Search indexing failures are logged but do not block email scheduling
- **Graceful shutdown** — The server handles `SIGINT`/`SIGTERM`, disconnecting Prisma and Redis before exiting
- **Reusable UI components** — Button, Input, Toast, and EmailRow are shared across the frontend
- **Custom React hooks** — `useScheduledEmails`, `useSentEmails`, and `useSearchEmails` encapsulate data fetching logic

---

## Author

**Abdul Rahman**

Built for the ReachInbox Software Development Intern Assignment.
