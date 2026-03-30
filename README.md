# KeyPop API

Express + TypeScript + MongoDB (Mongoose) backend for the KeyPop survey platform. Provides authentication, user and country management, surveys, survey responses, exports (PDF/CSV), and contact requests.

---

## Requirements

- **Node.js** 18+ recommended  
- **MongoDB** (connection string via `MONGO_URI`)

---

## Project setup

### 1. Clone and install

```bash
git clone <repository-url>
cd keypop-api
npm install
```

### 2. Environment variables

Copy the example file and edit values:

```bash
cp .env_example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP port (default `8000` in `env` config; `server.ts` may use `5000` fallback—set explicitly in production). |
| `MONGO_URI` | **Yes** | MongoDB connection string. |
| `JWT_SECRET` | **Yes** (prod) | Secret for signing JWTs (do not use defaults in production). |
| `NODE_ENV` | No | `development` / `production`. |
| `FRONTEND_URL` | No | **Admin** portal origin (e.g. `https://admin.keypopapp.org`). Used for `LOGO_URL` / `FOOTER_LOGO_URL` (static images under `/static/...`). |
| `FRONTEND_URL_WEB` | No | **Participant web** origin (e.g. `https://app.keypopapp.org`). Used for participant email links (login, reset password, dashboard). If unset, templates fall back to `FRONTEND_URL`. |
| `EMAIL_USER` / `EMAIL_PASS` | No | Nodemailer (if used). |
| `RESEND_API_KEY` | No | Resend API (if used for email). |
| `EMAIL_FROM` | No | From address (has a code default). |
| `EXPIRE_TIME` | No | Optional expiry-related config if wired in your deployment. |

### 3. Run locally (development)

```bash
npm run dev
```

Runs `nodemon` → `ts-node ./src/server.ts`, watches `src/**/*.ts`.

### 4. Production build

```bash
npm run build
npm start
```

- Compiles TypeScript to `dist/` and copies `src/assets` → `dist/assets`.
- `npm start` runs `node dist/server.js`.

### 5. PM2 (optional)

```bash
npm run build
npm run pm2-start    # name: apcom-backend
npm run pm2-logs
```

---

## API base URL

All JSON routes are prefixed with **`/api`**.

- Local example: `http://localhost:8000/api/auth/login` (use the port from your `.env`).

### Conventions

- **JSON body:** `Content-Type: application/json`
- **Auth:** `Authorization: Bearer <JWT>`
- **Success:** `{ "success": true, "message": string, "data"?: any }`
- **Many errors:** `{ "success": false, "message": string }` (plus optional `stack` in development)
- **Admin gate `403`:** `{ "success": false, "error": string }`

### Roles

`user` | `admin` | `superadmin` | `communityadmin`

Admin-only handlers use **`requireAdminRole`**: `admin`, `superadmin`, `communityadmin`.

---

## Authentication

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/api/auth/signup` | No | `name`, `email`, `password`, optional `gender`, `sexualOrientation`, `keyPopulation[]`, `age`, `country` |
| POST | `/api/auth/login` | No | `email`, `password`, **`admin`:** `true` for admin panel (only admin roles), omit/false for app users |
| POST | `/api/auth/forgot-password` | No | `email` |
| POST | `/api/auth/reset-password` | No | `otp`, `password` |

**Response (login/signup):** `data: { user, token }`

---

## Users (`/api/user`)

| Method | Path | Notes |
|--------|------|--------|
| POST | `/createUser` | Auth + admin. Body: user fields (`name`, `email`, `password`, optional `role`, `gender`, etc.) |
| GET | `/users` | Auth + admin. All users (sensitive fields may be present—avoid exposing passwords in UI). |
| GET | `/admin-users` | Auth + admin. Query: `page`, `limit`. Paginated `admin` + `communityadmin` users. |
| GET | `/admin-users/all` | Auth + admin. Query: optional `startDate`, `endDate`. |
| GET | `/user-info` | Auth + admin. Current user from token. |
| GET | `/admin-role-counts` | Auth + admin. Counts by admin role. |
| POST | `/check-email` | **No auth.** Body: `{ email }` → `{ exists: boolean }` |
| PUT | `/:id` | Auth + admin. Body: `name`, `email`, `role`, `password` (min 8 chars if set), etc. |
| DELETE | `/:id` | Auth. Query: `forceDelete=true` optional. |

---

## Countries (`/api/country`)

| Method | Path | Notes |
|--------|------|--------|
| POST | `/` | Auth + admin. Body: `name`, `code` |
| GET | `/all` | **Public.** All countries |
| GET | `/` | **Public.** Query: `code` or `id` |
| GET | `/:id` | Auth. Country by Mongo ID |
| PUT | `/update-status/:id` | Auth + admin. Body: `isActive` |
| DELETE | `/:id` | Auth + admin |

---

## Surveys (`/api/survey`)

| Method | Path | Notes |
|--------|------|--------|
| POST | `/` | Auth + admin. Create survey (body matches survey schema). |
| GET | `/all` | Auth + admin. All surveys. |
| GET | `/admin/responses` | Auth + admin. **Admin response list.** Query: `page`, `limit` (max 100), optional `surveyId`, `status` (`complete` \| `partial`). Superadmin/admin: all; communityadmin: filtered by respondent `User.country`. |
| GET | `/admin/responses/:responseId` | Auth + admin. **Readable detail** for one submission: respondent, survey, `howToRead`, and `sections[]` with `items[]` (`questionText`, `answerTypeLabel`, `readableAnswer`, indices). Same community scope as delete. |
| DELETE | `/admin/responses/:responseId` | Auth + admin. Deletes one `SurveyResponse` by Mongo id. Communityadmin: only if respondent’s `User.country` matches theirs. Updates survey `hasResponses` if none left. |
| GET | `/user-country` | Auth. Survey for token user’s country. |
| GET | `/country/:country` | Auth. |
| POST | `/submit` | Auth. Final submit: `surveyId`, `answers`, optional `skippedQuestions`, etc. |
| GET | `/progress` | Auth. |
| PUT | `/progress` | Auth. Body: `surveyId`, `answers[]`. |
| GET | `/responses` | Auth. **Current user only** (participant history). |
| GET | `/response/:surveyId` | Auth. **Current user only.** |
| DELETE | `/response/:surveyId` | Auth. Deletes **own** submitted response for that survey (participant). Updates survey `hasResponses` if needed. |
| GET | `/:id` | Auth. Survey detail. |
| PUT | `/:id` | Auth + admin. |
| DELETE | `/:id` | Auth + admin. |

---

## Export (`/api/export`)

Auth + **admin** for all routes below. Responses are **binary** (PDF/CSV), not JSON.

| Method | Path | Query / body |
|--------|------|----------------|
| POST | `/` | Body: `{ "type": "pdf" \| "csv", "tableData": [ ... ] }` (generic table export). |
| GET | `/response/:userId/:surveyId` | `format=pdf` or `format=csv` |
| GET | `/all-responses/:surveyId` | `format=pdf` or `format=csv` |
| GET | `/summary/:surveyId` | `format=pdf` or `format=csv` |

Community admins get data scoped to their community (respondents with matching `User.country`).

---

## Contact requests (`/api/contact-request`)

| Method | Path | Notes |
|--------|------|--------|
| POST | `/` | **No auth.** `name`, `email`, `phoneNumber`, `message` |
| GET | `/` | Auth + admin. Query: `page`, `limit`, `startDate`, `endDate` |
| PUT | `/update-status/:id` | Auth + admin. Body: `status` |

---

## Static files

- **Development:** `/static` → `src/assets`
- **Production:** `/static` → `dist/assets` (after build)

---

## Flow diagrams

See **[docs/FLOW.md](docs/FLOW.md)** for authentication, participant survey, admin/export, and contact-request flows (Mermaid).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Develop with nodemon + ts-node |
| `npm run build` | `tsc` + copy assets |
| `npm start` | Run `dist/server.js` |
| `npm run pm2-start` / `pm2-stop` / `pm2-restart` / `pm2-logs` | PM2 process management |

---

## Security notes

- Never commit real `.env` or production `MONGO_URI` / `JWT_SECRET`.
- Avoid logging full connection strings in production.
- Some user list endpoints may return password hashes; strip or hide in clients.
- Set a strong `JWT_SECRET` in production; the codebase may fall back to a weak default if unset.

---

## License

ISC (per `package.json`).
