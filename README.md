# mini2-student-manage

A **FARS-stack** student management system: **F**astAPI + **R**eact + **S**QLite.

Built as a learning project sized for ~5 users. Three services, each running in its own
location with its own IP, talking to each other over plain HTTP.

## Architecture

```
Browser
   │
   ▼
┌──────────────────────┐   HTTP    ┌──────────────────────┐   HTTP + X-API-Key    ┌──────────────────────┐
│ frontend  (LXC 2)    │ ────────► │ backend   (LXC 1)    │ ─────────────────────► │ data-service (VM)    │
│ React + Vite :5173   │           │ FastAPI   :8000      │                        │ FastAPI   :8001      │
└──────────────────────┘           └──────────────────────┘                        │        + SQLite     │
                                                                                    └──────────────────────┘
```

- **data-service** owns the SQLite database. Every other service is just a HTTP client of it.
- **backend** is the business API: login/tokens, role checks (admin/student), validation.
- **frontend** is the React UI. It never touches the database directly.

### Trust model (each hop authenticated)
| Hop | Auth |
|-----|------|
| Browser → backend | User token (HMAC-signed, Bearer header) after `POST /api/auth/login` |
| backend → data-service | `X-API-Key: <shared secret>` on every request |

## Project layout

```
mini2-student-manage/
├── data-service/        # VM :8001 — owns SQLite (users, students, courses, grades)
├── backend/             # LXC :8000 — auth + business API, calls data-service
├── frontend/            # LXC :5173 — React + Vite + Tailwind + Playwright
├── data/                # the SQLite file lives here, separate from code (gitignored)
└── README.md
```

## Quick start (local dev)

### 1. Data service (:8001)

```bash
cd data-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

On first run it creates `data/student.db` (if missing) and **auto-seeds**:
2 users, 8 students, 5 courses, 40 grades. Restarting later does **not** re-seed.

### 2. Backend (:8000)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Frontend (:5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Demo logins
| Role | Username | Password |
|------|----------|----------|
| admin | `admin` | `admin123` |
| student | `student` | `student123` |

## Environment variables

Every value has a dev default; override in production via environment (or `.env`).

| Service | Variable | Default | Purpose |
|---------|----------|---------|---------|
| data-service | `DB_PATH` | `../data/student.db` | where the SQLite file lives |
| data-service | `API_KEY` | `dev-shared-key-change-me` | must match backend |
| backend | `DB_API_URL` | `http://127.0.0.1:8001` | data-service address |
| backend | `API_KEY` | `dev-shared-key-change-me` | must match data-service |
| backend | `SECRET_KEY` | `dev-secret-change-me` | signs login tokens |
| frontend | `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | backend address |

See `.env.example` in each service folder.

## API surface

### data-service (:8001) — requires `X-API-Key`
- `POST /login` (public) · `POST /users`
- CRUD `GET/POST/PUT/DELETE /students`, `/courses`, `/grades`
- `GET /dashboard/stats`

### backend (:8000) — requires `Authorization: Bearer <token>`
- `POST /api/auth/login` (public)
- `GET/POST/PUT/DELETE /api/students`, `/api/courses` (admin only)
- `GET/POST/PUT/DELETE /api/grades` (admin: all; student: own only)
- `GET /api/dashboard/stats` (admin only)

### Frontend pages
`/login` · `/` dashboard · `/students` · `/courses` · `/grades` (admin) · `/my-grades` (student)

## Automated tests (Playwright)

Page-by-page end-to-end tests against the live backend + data-service:

```bash
# all 3 services must be running first (see Quick start)
cd frontend
npx playwright test              # run everything
npx playwright test e2e/login.spec.js   # just one page
```

25 tests cover: login flow, role redirects, dashboard stats, student/course CRUD,
grade assignment (with a temp student created and cleaned up via API), and role-blocking.

## Deploying to Proxmox (as designed)

Three guests on the Proxmox bridge network, each with its own IP:

| Guest | Runs | IP : Port |
|-------|------|-----------|
| VM | data-service + `data/student.db` | e.g. `10.10.x.A:8001` |
| LXC 1 | backend | `10.10.x.B:8000` |
| LXC 2 | frontend (Vite dev server or `vite build`) | `10.10.x.C:5173` |

Set the env vars to the real addresses:

```bash
# on the VM
export DB_PATH=/data/student.db
export API_KEY=supersecret-shared-key

# on LXC 1 (backend)
export DB_API_URL=http://10.10.x.A:8001
export API_KEY=supersecret-shared-key
export SECRET_KEY=another-secret

# on LXC 2 (frontend), before `npm run dev` / `npm run build`
export VITE_API_BASE_URL=http://10.10.x.B:8000
```

Notes:
- Plain HTTP is fine here (private network, ≤5 users, learning project). Do **not** expose
  the backend or data-service to the public internet without adding TLS/reverse-proxy.
- The data-service should **only** be reachable from the backend's IP (firewall/VM network).
- To reset to a fresh seeded database: stop data-service and delete `data/student.db`.