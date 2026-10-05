# EquipShare

EquipShare is a peer-to-peer marketplace for short-term agricultural and construction equipment rentals. The project uses a Next.js frontend, Express REST API, and PostgreSQL.

## Project structure

```text
equipshare/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── sql/schema.sql
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── controllers/
│       ├── db/pool.js
│       ├── middleware/
│       ├── routes/
│       └── utils/
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── package.json
    ├── app/
    └── lib/
```

## Run with Docker Desktop

Requirements: Docker Desktop with Docker Compose v2 enabled.

From the project root in PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
```

Open the frontend at `http://localhost:3000`. The API health check is at `http://localhost:4000/api/health`; PostgreSQL is published on port `5432`.

Compose starts PostgreSQL, initializes the schema on the first database-volume creation, waits for database and API health checks, and then starts the frontend. The frontend's `NEXT_PUBLIC_API_URL` is compiled into the Next.js browser bundle. For non-local deployments, set it to the API URL reachable by users, and rebuild the frontend image.

To inspect output:

```powershell
docker compose logs -f
docker compose logs -f backend
```

To stop containers while preserving database data:

```powershell
docker compose down
```

To permanently remove the local database volume and its data as well:

```powershell
docker compose down -v
```

**Warning:** the example `.env` values are only for local development. Replace both passwords/secrets before deploying. If changing database credentials after the PostgreSQL volume has already been initialized, update/recreate that local volume; initialization variables only apply to an empty volume.

## Run without Docker

1. Install Node.js 20+ and PostgreSQL 13+.
2. Create a PostgreSQL database and apply `backend/sql/schema.sql`.
3. In `backend/`, install dependencies, copy `backend/.env.example` to `backend/.env`, configure the database connection and a JWT secret of at least 32 characters, and run `npm run dev`.
4. In `frontend/`, install dependencies and run `npm run dev`.
5. Open `http://localhost:3000`.

## Dependency security

Run `npm audit --audit-level=low` in both `backend/` and `frontend/` to check the complete locked dependency trees. The frontend uses Next.js 15 and Tailwind CSS 4 to include available security fixes; Tailwind's PostCSS integration is configured in `frontend/postcss.config.js`, with a PostCSS override to keep nested copies patched as well.

The Next ESLint config was removed because its development-only dependency tree pulled in vulnerable glob-matching packages with no patched compatible release available. The frontend production build still performs TypeScript checks. Reintroduce a lint setup once its dependency chain has a patched release.

## API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register an account with a bcrypt-hashed password |
| POST | `/api/auth/login` | Public | Verify credentials and return a JWT |
| GET | `/api/equipment` | Public | Browse available listings; supports category, location, search and pagination |
| GET | `/api/equipment/:id` | Public | Get one listing and owner name |
| POST | `/api/equipment` | Owner or both | Create a listing |
| PUT | `/api/equipment/:id` | Owner or both | Update an owned listing |
| GET | `/api/bookings/me` | Authenticated | List the current user's bookings |
| POST | `/api/bookings` | Renter or both | Request equipment for a date range |
| PATCH | `/api/bookings/:id/status` | Authenticated owner | Approve or cancel a pending booking |
| POST | `/api/reviews` | Authenticated booking participant | Submit a review |
| GET | `/api/reviews/user/:userId` | Public | List reviews for a user |

For authenticated endpoints, use `Authorization: Bearer <token>`. User types are `renter`, `owner`, and `both`; equipment categories are `Agriculture` and `Construction`.

**Admin username:** `admin_user_202310`

**Admin password:** `AdminPass!2023`

## Setup & Admin Login

### 1️⃣ Start the Docker stack
```powershell
# From the project root (d:\\Rajendra\\Vehicle Share)
Docker compose up -d   # starts db, backend, and frontend containers
```

### 2️⃣ Verify PostgreSQL is running (optional)
```powershell
# Open a psql shell inside the DB container
docker compose exec -T db psql -U equipshare -d equipshare
```
You should see a `equipshare=#` prompt. Run `SELECT version();` to confirm.

### 3️⃣ Create the admin user
```powershell
# Still from the project root
node backend/scripts/create-admin.js
```
You should see `Admin user created successfully.` (or `Admin user already exists.` if it was run before).

### 4️⃣ Test the login
#### Via API (cURL)
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"langoor92345@gmail.com","password":"AdminPass!2023"}'
```
You will receive a JSON response containing a JWT token.

#### Via UI
1. Open `http://localhost:3000/login` in your browser.
2. Enter the admin email **langoor92345@gmail.com** and password **AdminPass!2023**.
3. You should be logged in and see the admin UI.

### 5️⃣ (Optional) Use a local PostgreSQL client
If you prefer not to use Docker, install the PostgreSQL client (`psql`) on Windows, start a local PostgreSQL server, and set the following in `.env`:
```dotenv
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_local_password
PGDATABASE=postgres
```
Then run `node backend/scripts/create-admin.js` again.

---
*These steps assume the Docker containers are running and the `.env` file contains the correct `POSTGRES_PASSWORD` (default: `EquipShare-Local-Database-Password-Change-Me`).*
