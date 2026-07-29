# Mini Case Tracker

A MERN take-home project for a small operations team that manages client cases, assigns work to agents, collects documents, and closes each case with a verdict.

## Features

- JWT login with Manager and Agent roles
- Manager case creation, assignment, review, and verdict workflow
- Agent case queue, comments, document/photo upload, and submission
- Server-side status transition enforcement
- Audit log for every status change
- Search, status filter, agent filter, and pagination
- Case detail timeline, comments, and uploaded documents
- Dashboard stat tiles
- Swagger API docs
- Seeded test users

## Tech Stack

- React + Vite + MUI
- Node.js + Express
- MongoDB + Mongoose
- JWT auth, bcrypt password hashing
- Multer local file uploads
- Zod write validation

## Quick Start

### 1. Requirements

- Node.js 20+
- MongoDB running locally or an Atlas connection string

### 2. Install

```bash
npm run install:all
```

### 3. Environment

Copy the examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update `server/.env` if your MongoDB URL differs.

### 4. Seed Demo Data

```bash
npm run seed
```

### 5. Run

```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000  
Swagger docs: http://localhost:5000/api/docs

## Test Credentials

Manager:

- Email: `manager@example.com`
- Password: `Password123!`

Agents:

- Email: `agent.ava@example.com`
- Password: `Password123!`

- Email: `agent.noah@example.com`
- Password: `Password123!`

## Status Rules

The API enforces this workflow:

`New -> Assigned -> In Progress -> Submitted -> Cleared / Discrepant`

- Managers can create cases and move cases to `Assigned`, `Cleared`, or `Discrepant`.
- Agents can start assigned cases, add notes, upload files, and submit assigned cases.
- Agents can only read and update cases assigned to them.
- Every status change writes an audit event with the actor, old status, new status, and timestamp.

## API Overview

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users/agents`
- `GET /api/cases`
- `POST /api/cases`
- `GET /api/cases/stats`
- `GET /api/cases/:id`
- `PATCH /api/cases/:id/status`
- `PATCH /api/cases/:id/assign`
- `POST /api/cases/:id/comments`
- `POST /api/cases/:id/documents`

Swagger details are available at `/api/docs` while the server is running.

## Assumptions

- Local file storage is acceptable for uploads, as allowed in the brief.
- A manager can assign or reassign a case before final verdict.
- Agent notes are implemented as case comments.
- Submitted cases are read-only for agents until a manager gives a verdict.
- Discrepant and Cleared are terminal statuses for this take-home.

## Deployment Notes

- Frontend can deploy to Vercel or Netlify with `VITE_API_URL` set to the backend URL.
- Backend can deploy to Render, Railway, or Fly.io with `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`.
- MongoDB Atlas free tier works for `MONGO_URI`.
- For production uploads, replace local disk uploads with S3, Cloudinary, or similar object storage.

## Rough Hours Spent

Built as a focused take-home implementation in roughly 6-8 hours of equivalent effort.
