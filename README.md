# InternTM Backend (NestJS + PostgreSQL + TypeORM)

## Run
1. Install PostgreSQL (14+) on your machine and make sure it is running.
2. Create the database:
```bash
# Linux / macOS
psql -U postgres -c "CREATE DATABASE interntm;"
# Windows: open "SQL Shell (psql)" and run: CREATE DATABASE interntm;
```
3. Configure and start:
```bash
cp .env.example .env        # set DB_USER / DB_PASSWORD to your local Postgres login, and change the secrets!
npm install
npm run start:dev
```
- API: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/docs` (click **Authorize**, paste the access token)
- On first start an admin is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` and (if `SEED_DEMO=true`) demo data is inserted.

> `DB_SYNC=true` auto-creates tables - fine for development. For production set it to `false` and use TypeORM migrations.

## Auth
- `POST /auth/register` - student signup (role is always `student`)
- `POST /auth/login` -> `{ user, accessToken, refreshToken }`
- `POST /auth/refresh` (rotating refresh tokens), `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password`
- Send `Authorization: Bearer <accessToken>`. Every route is protected unless marked `@Public()`; admin routes use `@Roles(Role.ADMIN)`.

## Endpoints by screen
| Screen | Endpoints |
|---|---|
| Home | `GET /stats`, `GET /categories` (popular tags), `GET /internships?search=` |
| Internship list | `GET /internships?search&location&categoryId&type=remote,hybrid&level=beginner&sort=recent\|oldest\|popular&page&limit`, `GET /internships/meta/locations` |
| Detail | `GET /internships/:id` (counts views, returns applicationsCount / isSaved / hasApplied), `POST /saved/:id`, `DELETE /saved/:id` |
| Apply form | `POST /uploads/resume`, `POST /internships/:id/apply` |
| Dashboard | `GET /dashboard`, `GET /applications` |
| Companies | `GET /companies?search&industry`, `GET /companies/industries`, `GET /companies/:id` |
| Profile | `GET/PATCH /users/me`, `POST /uploads/image` |
| Messages | `GET /messages/conversations`, `GET /messages/conversations/:id`, `POST /messages/conversations/:id/messages`, `POST /messages/conversations`, `GET /messages/unread-count` |

## Admin panel API (role = admin)
- `GET /admin/overview` - totals, applications by status, top internships, recent applications
- Users: `GET /admin/users`, `GET|PATCH|DELETE /admin/users/:id` (change role, enable/disable)
- Applications: `GET /admin/applications`, `PATCH /admin/applications/:id/status` (student is auto-notified in Messages)
- Conversations: `GET /admin/conversations`, `GET /admin/conversations/:id`, `POST /admin/conversations/:id/messages` (reply as the company)
- Content CRUD (admin-only writes): `/companies`, `/internships`, `/categories`; `GET /companies/admin/all` and `GET /internships/admin/all` include inactive items

## Structure
```
src/
  auth/ users/ companies/ categories/ internships/ applications/
  saved/ messages/ stats/ admin/ uploads/ seed/ common/
```
