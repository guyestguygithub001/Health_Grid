# Health Grid Platform

**Internal Developer Repo - CONFIDENTIAL**

> **Note to DevOps:** Before deploying this to Vercel/Render, make sure the NEON_DATABASE_URL is set. The serverless driver will hard crash on boot if it can't find it. See the runbook below.

This is the core repository for the Health Grid. We recently migrated off the legacy local JSON mock DB and moved entirely to Neon Postgres to handle the Vercel serverless edge scaling.

## Local Setup

### Prerequisites
- Node.js v24+
- PostgreSQL (if running locally without Neon)

### Quickstart
1. npm install (make sure you don't commit the package-lock.json if there are conflicts)
2. Create a .env file in the root. Ask the lead dev for the Neon staging keys if you don't have them.
3. Run: node --env-file=.env server/server.js
4. The server spins up on http://localhost:8082

## Architecture & Tech Debt

- **Monolith to Microservices (WIP):** Right now, the Express.js app is acting as a monolithic router for both the EHR (Hospital) and PHC (Rural) modules. 
- **In-Memory Cache (Danger):** We are currently simulating Redis using native Node Map() and Set() objects in server.js. I've bounded them to 5000 items to prevent Vercel 1024MB RAM OOMs, but we *must* rip this out and replace it with Upstash Redis before Q4 production launch.
- **Offline Sync:** The PHC module writes to localStorage when offline. When workers hit a network zone, they click "Sync". Don't break the payload schema in /api/v2/phc/sync or you'll drop rural data.

## Migrations

We aren't using Prisma or TypeORM yet (too heavy for this iteration).
To migrate the DB:
node run_migrations.js

*Make sure you test your SQL scripts locally before pushing to Neon.*

## Build Version
Current Build: v0.8.4-beta

*If you find a bug in the clinical notes parsing logic, please assign the ticket to the frontend team. Do not just patch server.js directly.*
