# CampusIQ - College Discovery Platform Backend

A production-grade, highly scalable, and type-safe backend-only REST API for the **College Discovery Platform** built with **Next.js App Router**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

---

##  Key Features

* **JWT Authentication**: Secure endpoints using custom verification, payload extraction, and automatic bcrypt-based password hashing.
* **Global CORS & Logging**: Dynamic CORS controls and colored terminal performance logs.
* **Selectivity & Admission Predictor**: Novel admission predictor based on college entry rankings and cutoff probabilities.
* **Smart Compare Engine**: Custom weighted score compilation, percentage differences, and dynamic verdict reasoning.
* **Pagination, Filters & Search**: High-performance paginated endpoints with search indices, state filters, and fee ranges.
* **Standardized JSON Response Contracts**: Strict success and error JSON shapes with type validations using Zod.

---

##  Tech Stack & Dependencies

* **Framework**: Next.js 15 (App Router / API Routes)
* **Language**: TypeScript
* **Database**: PostgreSQL (compatible with Prisma)
* **ORM**: Prisma Client v5.22.0
* **Security & Auth**: `bcryptjs` for secure hashing, `jsonwebtoken` for access tokens
* **Validation**: Zod (type-safe request/query validation)
* **Linter & Formatter**: ESLint + Prettier

---

##  Project Directory Structure

```text
CampusIQ/
├── prisma/
│   ├── schema.prisma           # Relational Postgres database models
│   └── seed.ts                 # Full database seed script (26 Indian Colleges + default user)
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/
│   │       │   │   └── route.ts  # POST /api/auth/register
│   │       │   └── login/
│   │       │       └── route.ts  # POST /api/auth/login
│   │       ├── colleges/
│   │       │   ├── route.ts      # GET /api/colleges (paginated search)
│   │       │   └── [id]/
│   │       │       └── route.ts  # GET /api/colleges/[id]
│   │       ├── compare/
│   │       │   └── route.ts      # POST /api/compare (novel compare engine)
│   │       ├── predict/
│   │       │   └── route.ts      # POST /api/predict (novel admission predictor)
│   │       └── saved/
│   │           ├── route.ts      # GET/POST /api/saved (shortlist)
│   │           └── [id]/
│   │               └── route.ts  # DELETE /api/saved/[id]
│   ├── lib/
│   │   ├── prisma.ts           # Prisma singleton client
│   │   ├── auth.ts             # JWT signing & verification helpers
│   │   ├── middleware.ts       # withAuth wrapper, CORS config & rate limiter
│   │   ├── responses.ts        # successResponse & errorResponse helpers
│   │   ├── validators.ts       # Zod verification schemas
│   │   ├── logger.ts           # ANSI terminal logger with timing support
│   │   └── constants.ts        # Constant structures & engineering exams
│   └── middleware.ts           # Global App Router middleware
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
├── postman_collection.json     # Ready-to-import Postman JSON collection
├── .eslintrc.json
└── .prettierrc
```

---

##  Quick Start

### 1. Prerequisites
Ensure you have Node.js (v18+) and a PostgreSQL instance running (locally or on Neon.tech).

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory by copying the template:
```bash
cp .env.example .env
```
Inside `.env`, configure your PostgreSQL connection string and a secret JWT key:
```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<db>?schema=public"
JWT_SECRET="your_32_character_security_secret_string"
```

### 4. Run Migrations & Seeding
Deploy the PostgreSQL schema database and seed the mock college datasets (26 high-fidelity profiles across IITs, NITs, BITS Pilani, private colleges, and standard entrance benchmarks):
```bash
# Generate the client and run schema migrations
npx prisma migrate dev --name init

# Populate database with mock data and test user account
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```
The server will boot up immediately at `http://localhost:3000`.

---

##  Seeded Demo User Account

Use this account to obtain a JWT token immediately:
* **Email**: `demo@campusiq.com`
* **Password**: `password123`

---

##  REST API Specifications

All request payloads and query formats are validated strict-type using **Zod**. Every endpoint returns consistent JSON shapes:
* **Success**: `{ success: true, message: "...", data: {...} }`
* **Error**: `{ success: false, message: "..." }`

### 1. Authentication

#### `POST /api/auth/register`
* Register new candidate profiles.
* **Payload**:
  ```json
  {
    "email": "student@campusiq.com",
    "password": "strongPassword123"
  }
  ```

#### `POST /api/auth/login`
* Login candidates to yield shortlisting keys.
* **Payload**:
  ```json
  {
    "email": "demo@campusiq.com",
    "password": "password123"
  }
  ```
* **Response**: Returns a Bearer token inside `data.token`.

---

### 2. Colleges Search & Details

#### `GET /api/colleges`
* Search, filter, and page colleges dynamically.
* **Query Parameters**:
  - `search` (string): Partial name match (e.g. `search=IIT`)
  - `state` (string): Filter by state location (e.g. `state=Maharashtra`)
  - `maxFees` (number): Max fee filter (e.g. `maxFees=250000`)
  - `exam` (string): Filter accepted test (e.g. `exam=JEE`)
  - `sortBy` (`rating` | `fees` | `placementAvgSalary`): Defaults to `rating`
  - `order` (`asc` | `desc`): Defaults to `desc`
  - `page` (number): Current page (default `1`)
  - `limit` (number): Records per fetch (default `10`)
* **Example Request**: `/api/colleges?exam=JEE&state=Delhi&sortBy=fees&order=asc`

#### `GET /api/colleges/[id]`
* Fetch complete details of a single college.
* **Example Request**: `/api/colleges/1`

---

### 3. Admission Predictor

#### `POST /api/predict`
* Evaluates admission probabilities based on entrance ranks.
* **Payload**:
  ```json
  {
    "exam": "JEE",
    "rank": 1800
  }
  ```
* **Probability Logic**:
  - `rank < cutoff * 0.8` -> **90%** chance (Highly Safe)
  - `rank < cutoff` -> **65%** chance (Safe)
  - `rank < cutoff * 1.2` -> **35%** chance (Moderate/Borderline)
  - `otherwise` -> **10%** chance (Unlikely)

---

### 4. College Comparative Analytics

#### `POST /api/compare`
* Synthesizes comprehensive analysis and ranks options.
* **Payload**:
  ```json
  {
    "collegeIds": [1, 10, 18]
  }
  ```
* **Response Verdict Engine**: Calculates winners, relative percentages, and emits an intelligent text value verdict based on quality ratings, pricing indexes, and employment trends.

---

### 5. Shortlisted Saved Colleges (JWT Protected)

All requests require the `Authorization` header: `Bearer <auth_token>`.

#### `POST /api/saved`
* Shortlist a college.
* **Payload**: `{"collegeId": 3}`

#### `GET /api/saved`
* Fetch user's saved shortlist with underlying college records.

#### `DELETE /api/saved/[id]`
* Remove a saved college by `collegeId` or `SavedCollege` ID.

---

##  Production Deployment Guide

### Database Setup on Neon (PostgreSQL-as-a-Service)
1. Go to [Neon.tech](https://neon.tech/) and create a free PostgreSQL project.
2. Retrieve the standard **Connection string** (URI).
3. Ensure to append `?sslmode=require` to guarantee secure traffic.

### Application Hosting on Vercel
1. Push your repository code to GitHub/GitLab.
2. Sign in to [Vercel](https://vercel.com/) and choose **Add New Project**.
3. Import the repository.
4. Expand **Environment Variables** and fill:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `JWT_SECRET`: Random 32+ character key.
5. Deploy.
6. Post-deployment: execute migrations against production using your local command CLI pointing to your production DATABASE_URL, or configure a post-install phase in package.json:
   ```bash
   npx prisma migrate deploy
   ```
