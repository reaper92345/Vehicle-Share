# Need‑to‑Do‑This.md – Quick Setup Guide for Vehicle Share

This file contains the exact commands you need to run to get the **frontend** and **backend** of the Vehicle Share project up and running, and to log in as the admin user.

---

## 1️⃣ Prerequisites
- **Node.js** ≥ 20 (check with `node -v`).
- **PowerShell** (or any terminal) on Windows.
- Ensure you have internet access to download npm packages.

---

## 2️⃣ Project structure (important!)
```
Vehicle Share/
├─ frontend/   ← Next.js UI (has its own package.json)
├─ backend/    ← Express API (has its own package.json)
└─ .env        ← Shared environment variables
```
All `npm` commands must be run **inside** the `frontend` or `backend` folder – **not** from the repository root.

---

## 3️⃣ Install dependencies
```powershell
# ---------- Backend ----------
cd "D:/Rajendra/Vehicle Share/backend"
npm install   # installs express, pg, bcryptjs, dotenv, etc.

# ---------- Frontend ----------
cd "D:/Rajendra/Vehicle Share/frontend"
# The frontend package.json had an extra comma after the `swr` dependency.
# It has been fixed automatically, but if you ever edit it manually, ensure it looks like:
#   "swr": "^2.2.5"
# Then run:
npm install   # installs next, react, tailwind, swr, …
```
If any step fails, copy the error output and let me know.

---

## 4️⃣ (Optional) Create / refresh the admin account
```powershell
cd "D:/Rajendra/Vehicle Share/backend"
node scripts/create-admin.js   # will output: "Admin account created or credentials updated."
```
The admin credentials are:
- **Email:** `langoor92345@gmail.com`
- **Password:** `AdminPass!2023`

---

## 5️⃣ Start the servers (open two terminals)
```powershell
# Terminal 1 – Backend API
cd "D:/Rajendra/Vehicle Share/backend"
npm run dev   # runs `node --watch src/server.js`
# You should see: "EquipShare API listening on port 4000"

# Terminal 2 – Frontend UI
cd "D:/Rajendra/Vehicle Share/frontend"
npm run dev   # runs `next dev`
# You should see: "ready - started server on http://localhost:3000"
```
Leave both terminals running.

---

## 6️⃣ Test the login
1. Open a browser and navigate to **`http://localhost:3000/login`**.
2. Enter the admin credentials from step 4.
3. Successful login redirects you to **`/equipment`** and stores a JWT token in `localStorage`.
4. (Optional) Open DevTools → Network tab, find the `POST /api/auth/login` request and verify:
   - **Status:** `200`
   - **Response body** contains `{ "token": "…", "user": { … } }`

---

## 7️⃣ Troubleshooting checklist
| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `npm` error `ENOENT` (cannot find package.json) | Ran `npm` from the root folder | Run commands inside `frontend` or `backend` as shown above |
| `Invalid email or password` after login | Admin row missing or password mismatch | Re‑run `node scripts/create-admin.js` **while the backend is stopped**, then start the backend again |
| CORS error in browser console | `CORS_ORIGINS` in `.env` does not include `http://localhost:3000` | Ensure `.env` line `CORS_ORIGINS=http://localhost:3000` exists and restart the backend |
| Server crashes with `JWT_SECRET must contain at least 32 characters` | `.env` missing or malformed JWT secret | Set `JWT_SECRET` to any 32‑character string (the default line in `.env` is fine) |
| Frontend `npm install` fails with JSON parse error | stray comma in `frontend/package.json` | The file has been corrected (`swr` line now has no trailing comma). If you edit it manually, keep it valid JSON. |

---

## 8️⃣ Quick one‑liner to install both sides from the root (optional)
```powershell
npm install --prefix "./frontend" && npm install --prefix "./backend"
```
This tells npm to look for `package.json` in each sub‑folder, avoiding the ENOENT problem.

---

**You’re all set!** Follow the steps in order, and the admin login should work. If anything still goes wrong, copy the exact error message and share it here.

---


















Faster local dev (no containers)
While iterating on the UI you can skip Docker and run the Next.js dev server directly:

powershell
cd .\frontend
npm run dev   # starts http://localhost:3000 with hot‑module reloading
Tip: Keep the Docker containers running for production‑like testing, but use the local npm run dev loop while you’re tweaking the UI. When you’re happy with the changes, run the docker compose up -d --build frontend command to bake them into the container.

Let me know if you’d like a one‑liner script or any other help (e.g., viewing logs, checking container status).

5:51 PM
5:52 PM
You need a .env file at the project root for Docker Compose to inject the required secrets. I’ve created one with placeholder values:

Variable	Purpose
POSTGRES_PASSWORD	PostgreSQL password (used by DB & backend)
JWT_SECRET	Signing secret for JWT auth
JWT_EXPIRES_IN	JWT lifetime (default 1 hour)
CORS_ORIGINS	Allowed origins for the backend API
NEXT_PUBLIC_API_URL	API URL consumed by the Next.js frontend
File created: d:\Rajendra\Vehicle Share\6th-sem-project\.env

Now you can re‑run the container build:

powershell
# From the project root
docker compose up -d --build frontend
The placeholders (changeme_secure_password, changeme_jwt_secret) can be replaced with real secrets when you’re ready for production. After the rebuild, refresh http://localhost:3000 – the header should now span the full width.