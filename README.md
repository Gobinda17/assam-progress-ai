# Assam Progress AI

A full-stack **RAG (Retrieval-Augmented Generation)** platform for uploading, processing, and semantically querying government PDF documents related to Assam's progress. Administrators upload PDFs (categorized by domain, state, and district); they are asynchronously ingested, embedded with OpenAI, and stored in a Qdrant vector database for AI-powered retrieval.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
  - [1. Infrastructure (Docker)](#1-infrastructure-docker)
  - [2. Backend](#2-backend)
  - [3. Frontend](#3-frontend)
- [API Reference](#api-reference)
- [Frontend Routes](#frontend-routes)
- [Roles & Permissions](#roles--permissions)
- [Document Ingestion Pipeline](#document-ingestion-pipeline)
- [License](#license)

---

## Features

- **JWT Authentication** — Secure access & refresh token pair stored as `HttpOnly` cookies
- **Role-based access control** — `SUPERADMIN` and `USER` roles; the first registered user becomes `SUPERADMIN`
- **PDF Upload** — SUPERADMIN can upload PDFs with metadata (category, state, district)
- **Async Ingestion** — Documents are queued in BullMQ (backed by Redis) and processed in the background
- **Vector Embeddings** — PDFs are chunked, embedded via OpenAI `text-embedding-3-small`, and stored in Qdrant (1536-dimensional cosine-similarity collection)
- **Filtered Retrieval** — Payload indexes on `category`, `state`, `district`, and `documentId` for fast filtered vector search
- **Dashboard UI** — Real-time status tracking (queued → processing → ready / failed), search, and delete
- **Profile Management** — Users can update their password
- **Internationalisation** — i18next with automatic browser language detection

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 3, React Router 7, Axios, i18next |
| **Backend** | Node.js (ESM), Express 5, Mongoose 9, BullMQ 5, Pino |
| **AI / ML** | OpenAI API (`text-embedding-3-small`), Qdrant vector database |
| **Job Queue** | BullMQ + Redis 7 |
| **Databases** | MongoDB 7 (document metadata), Qdrant (vectors) |
| **Auth** | JWT (jsonwebtoken), bcrypt |
| **Infrastructure** | Docker Compose |

---

## Architecture

```
┌─────────────────────┐        ┌──────────────────────────────────────┐
│   React Frontend    │  HTTP  │         Express Backend (5000)        │
│  (Vite dev :5173)   │◄──────►│  /api/auth  |  /api/admin/documents  │
└─────────────────────┘        └───────────┬──────────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                       │
             ┌──────▼──────┐     ┌─────────▼────────┐   ┌────────▼──────┐
             │  MongoDB    │     │   BullMQ Queue   │   │    Qdrant     │
             │  (27018)    │     │   (Redis :6379)  │   │  (6333/6334)  │
             │  metadata   │     │  ingest worker   │   │   vectors     │
             └─────────────┘     └──────────────────┘   └───────────────┘
```

---

## Project Structure

```
assam-progress-ai/
├── docker-compose.yml          # MongoDB, Redis, Qdrant services
├── backEnd/
│   └── src/
│       ├── server.js           # Express app entry point
│       ├── config/
│       │   ├── db.js           # MongoDB connection
│       │   └── auth.js         # JWT config helpers
│       ├── controllers/
│       │   ├── auth.controller.js          # register, login, refresh, logout, updatePassword
│       │   └── adminDocuments.controller.js # upload, list, status
│       ├── middlewares/
│       │   └── auth.js         # requireAuth, requireRole, validation error handler
│       ├── models/
│       │   ├── User.js         # email, name, passwordHash, role, refreshTokenHash
│       │   └── Document.js     # filename, category, state, district, status, progress
│       ├── queue/
│       │   ├── ingestQueue.js  # BullMQ queue definition
│       │   └── redis.js        # IORedis connection
│       ├── routes/
│       │   ├── auth.routes.js           # /api/auth/*
│       │   └── adminDocuments.routes.js  # /api/admin/*
│       ├── services/
│       │   └── qdrant.js       # Qdrant client + ensureQdrantCollection()
│       ├── utils/
│       │   ├── jwt.js          # signAccessToken, signRefreshToken, verifyAccess, verifyRefresh
│       │   └── upload.js       # Multer middleware (PDF only, configurable max size)
│       └── validations/
│           └── auth.validation.js  # express-validator schemas
└── frontEnd/
    └── src/
        ├── App.jsx             # Root component (i18n + auth + router providers)
        ├── main.jsx            # React DOM entry
        ├── context/
        │   └── AuthContext.jsx # User state, login/register/logout/updatePassword helpers
        ├── i18n/               # i18next setup + locale files (auto-loaded by glob)
        ├── pages/
        │   ├── home/           # Landing page
        │   ├── login/          # Login form
        │   ├── register/       # Registration form
        │   ├── dashboard/      # PDF management dashboard (upload, list, search)
        │   │   ├── profile/    # Profile & change-password page
        │   │   └── users/      # User management page
        │   └── NotFound.jsx    # 404 page
        ├── router/
        │   └── config.jsx      # Route definitions + ProtectedRoute wrapper
        └── mocks/
            └── pdfs.js         # Mock PDF data for local development
```

---

## Prerequisites

- **Node.js** ≥ 18
- **Docker & Docker Compose** (for MongoDB, Redis, Qdrant)
- An **OpenAI API key** with access to `text-embedding-3-small`

---

## Environment Variables

### Backend (`backEnd/.env`)

| Variable | Example | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Express server port |
| `MONGO_URI` | `mongodb://localhost:27018/assam_rag` | MongoDB connection string |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `QDRANT_URL` | `http://localhost:6333` | Qdrant REST endpoint |
| `QDRANT_COLLECTION` | `assam_docs` | Qdrant collection name |
| `OPENAI_API_KEY` | `sk-...` | OpenAI API key |
| `JWT_ACCESS_SECRET` | `<random string>` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | `<random string>` | Secret for signing refresh tokens |
| `ACCESS_TOKEN_EXPIRES` | `15m` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRES` | `7d` | Refresh token lifetime |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin (frontend URL) |
| `UPLOAD_DIR` | `storage/uploads` | Directory for stored PDF files |
| `MAX_UPLOAD_MB` | `250` | Maximum PDF upload size in MB |
| `NODE_ENV` | `development` | `production` sets secure cookies |

---

## Getting Started

### 1. Infrastructure (Docker)

Start MongoDB, Redis, and Qdrant with Docker Compose:

```bash
docker compose up -d
```

Services exposed:
| Service | Host Port |
|---------|-----------|
| MongoDB | `27018` |
| Redis | `6379` |
| Qdrant REST | `6333` |
| Qdrant gRPC | `6334` |

### 2. Backend

```bash
cd backEnd
cp .env.example .env   # fill in your values
npm install
npm run dev            # starts with nodemon (hot-reload)
# or
npm start              # production
```

The API will be available at `http://localhost:5000`.

> **First user** registered automatically becomes `SUPERADMIN`.

### 3. Frontend

```bash
cd frontEnd
npm install
npm run dev            # Vite dev server at http://localhost:5173
```

---

## API Reference

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Returns `{ ok: true }` |

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | Public | Register a new user |
| `POST` | `/login` | Public | Login and receive auth cookies |
| `POST` | `/refresh` | Cookie | Rotate refresh token, issue new access token |
| `POST` | `/logout` | Cookie | Invalidate refresh token and clear cookies |
| `GET` | `/me` | Cookie | Return current user profile |
| `POST` | `/me/update-password` | Cookie | Change current user's password |

**Register / Login body:**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```

**Auth cookies set on login/register/refresh:**
- `access_token` — 15-minute JWT, `HttpOnly`
- `refresh_token` — 7-day JWT, `HttpOnly`

### Admin Documents — `/api/admin` *(SUPERADMIN only)*

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/documents/upload` | Upload a PDF (`multipart/form-data`, field `file`) |
| `GET` | `/documents` | List all documents (sorted newest first) |
| `GET` | `/documents/:id/status` | Get ingestion status for a document |

**Upload form fields:**

| Field | Type | Description |
|-------|------|-------------|
| `file` | File (PDF) | The PDF document |
| `category` | string | `health` \| `education` \| `infrastructure` \| `all` |
| `state` | string | State name (optional) |
| `district` | string | District name (optional) |

**Document statuses:** `queued` → `processing` → `ready` / `failed`

---

## Frontend Routes

| Path | Protection | Description |
|------|-----------|-------------|
| `/` | Public | Landing page |
| `/register` | Public | Registration form |
| `/login` | Public | Login form |
| `/dashboard` | Auth required | PDF management dashboard |
| `/dashboard/profile` | Auth required | User profile & password change |
| `/dashboard/users` | Auth required | User management |
| `*` | Public | 404 Not Found |

---

## Roles & Permissions

| Action | USER | SUPERADMIN |
|--------|------|-----------|
| Register / Login | ✅ | ✅ |
| View dashboard | ✅ | ✅ |
| Upload PDFs | ❌ | ✅ |
| List / status documents | ❌ | ✅ |
| Change own password | ✅ | ✅ |

> The first user to register is automatically assigned the `SUPERADMIN` role.

---

## Document Ingestion Pipeline

```
1. SUPERADMIN POSTs PDF  →  multer saves to tmp_uploads/
2. Controller moves file  →  storage/uploads/<documentId>.pdf
3. Document record created in MongoDB  (status: "queued")
4. Job added to BullMQ queue  ("doc.ingest", { documentId })
5. Worker picks up job:
   a. Reads PDF with pdfjs-dist
   b. Chunks text
   c. Embeds chunks via OpenAI text-embedding-3-small (1536 dims)
   d. Upserts vectors into Qdrant collection
   e. Updates Document status → "ready"
6. Frontend polls  GET /api/admin/documents/:id/status  until done
```

Qdrant payload indexes created on collection init:
- `documentId` (keyword)
- `category` (keyword)
- `state` (keyword)
- `district` (keyword)

---

## License

[MIT](LICENSE)
