# Lending Desk – equipment rental

Rent equipment (basketballs, laptops, tools...) with an account, see who rented what, and block renting until an item is returned.

| Part | Tech | Azure service |
|---|---|---|
| Frontend | Next.js 15 (TypeScript) | App Service (Linux, Node 22) |
| Backend / public API | Spring Boot 3.3, Java 21, Swagger | App Service (Linux, Java 21) |
| Database | PostgreSQL 16 | Azure Database for PostgreSQL – Flexible Server |
| CI/CD | GitHub Actions | |

```
CloudComputingTask3/
├── backend/            Spring Boot API  (http://localhost:8080/swagger-ui.html)
├── frontend/           Next.js web app  (http://localhost:3000)
├── docker-compose.yml  Local PostgreSQL
└── .github/workflows/  Deploy pipelines (one per app)
```

## Run locally

```bash
docker compose up -d                       # PostgreSQL on localhost:5432

cd backend && mvn spring-boot:run          # or run RentalApplication from IntelliJ

cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/items?category=&available=&page=&size=&sort=` | List (paged, filterable) |
| GET | `/api/items/{id}` | Read one |
| POST | `/api/items` | Create (201) |
| PUT | `/api/items/{id}` | Update |
| DELETE | `/api/items/{id}` | Delete (204, 409 if rented out) |

Validation on create/update: `name` String (2–100), `category` enum, `dailyPrice` decimal (0–10000, 2 decimals),
`maxRentalDays` integer (1–90), `purchaseDate` date (not in the future). Errors return 400 with a `fieldErrors` map.
