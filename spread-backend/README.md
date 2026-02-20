# Spread Backend (Node.js + TypeScript + Express + Supabase)

Backend starter for the Spread mobile app.

## Stack

- Node.js 20+
- TypeScript
- Express
- Supabase Postgres
- Supabase Auth
- Supabase Storage

## Features Included

- Email/password auth endpoints using Supabase Auth
- User profile endpoints
- Offers CRUD endpoints
- Claim flow with business rules:
  - Max 3 active claims per creator
  - Enforce offer slot limits
  - Atomic claim creation via Postgres function
- Submission flow:
  - Upload image proof to Supabase Storage
  - Review queue for admin/restaurant
  - Approval/rejection updates claim + offer slot
- CORS + JSON middleware + logging + centralized error handling
- SQL migration for schema + indexes + business RPC functions

## Project Structure

- `/src` application source
- `/supabase/migrations` SQL migrations
- `/.env.example` required env variables

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Fill `.env` with your Supabase values.

4. Create a Supabase Storage bucket matching `SUPABASE_STORAGE_BUCKET`.

5. Run SQL migration in Supabase SQL editor (or Supabase CLI):

- File: `/Users/akjain/Desktop/CODEX/spread-backend/supabase/migrations/202602170001_init.sql`

6. Start dev server:

```bash
npm run dev
```

Server default: `http://localhost:4000`

Frontend app URL: `http://localhost:4000/app`

## Environment Variables

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8081

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

SUPABASE_STORAGE_BUCKET=submission-proofs
```

## API Overview

Base URL: `http://localhost:4000`

### Auth

- `POST /auth/signup`
  - body: `{ email, password, role?, instagram_handle?, tiktok_handle? }`
- `POST /auth/login`
  - body: `{ email, password }`

### Users

- `GET /users/:id` (self or admin)
- `PATCH /users/:id` (self or admin)

### Offers

- `POST /offers` (restaurant/admin)
- `GET /offers?lat=&lng=&radius=&open_slots=`
- `GET /offers/:id`
- `PATCH /offers/:id` (owner restaurant/admin)
- `DELETE /offers/:id` (owner restaurant/admin)

### Claims

- `POST /claims` (creator)
  - body: `{ offer_id, expires_at? }`
- `GET /claims?creator_id=...`
  - creator role automatically gets own claims
- `PATCH /claims/:id`
  - body: `{ status }`

### Submissions

- `POST /submissions` (creator)
  - body:
    ```json
    {
      "claim_id": "uuid",
      "image_base64": "data:image/jpeg;base64,... or raw base64",
      "image_mime_type": "image/jpeg",
      "tiktok_url": "https://...",
      "caption_text": "optional"
    }
    ```
- `GET /submissions?status=pending` (restaurant/admin)
- `PATCH /submissions/:id/approve` (restaurant/admin)
- `PATCH /submissions/:id/reject` (restaurant/admin)

## Auth Header

Use Supabase access token:

```http
Authorization: Bearer <access_token>
```

## Business Rules Implemented

- Creator cannot hold more than 3 active/submitted claims.
- Offer claim blocked when `current_active_creators >= max_concurrent_creators`.
- On claim rejection/expiration, slot is released.
- On submission approval, claim becomes `approved` and slot is released.
- On submission rejection, claim becomes `rejected` and slot is released.

## Notes

- OAuth (Instagram/TikTok) is not wired by default. You can enable provider auth through Supabase Auth settings and add corresponding endpoints.
- For production, configure RLS policies and move sensitive admin logic behind trusted server-only routes.
