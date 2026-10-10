# Lending Desk – equipment rental

Pick equipment (basketballs, laptops, tools...) from the list, see whether it's available and until when you can
have it, rent it, and mark it as returned when you bring it back. Items can't be rented again until they're returned.

| Part | Tech | Azure service |
|---|---|---|
| Frontend | Next.js 15 (TypeScript) | App Service (Linux, Node 22) |
| Backend / public API | Spring Boot 3.3, Java 21, Swagger | App Service (Linux, Java 21) |
| Database | PostgreSQL 18 | Azure Database for PostgreSQL – Flexible Server |
| Background job | Azure Functions (Node 22, timer trigger) | Function App (Consumption) |
| CI/CD | GitHub Actions | |

```
CloudComputingTask3/
├── backend/            Spring Boot API  (http://localhost:8080/swagger-ui.html)
├── frontend/           Next.js web app  (http://localhost:3000)
├── functions/          Overdue checker, runs every 15 minutes
├── docker-compose.yml  Local PostgreSQL + Azurite (storage emulator for Functions)
└── .github/workflows/  Deploy pipelines (one per app)
```

On first start the backend fills an empty database with 12 items and 2 example rentals (one of them already past
its due date, so the overdue checker has something to flag).

## Run locally

```bash
docker compose up -d                       # PostgreSQL on localhost:5432, Azurite on 10000-10002

cd backend && mvn spring-boot:run          # or run RentalApplication from IntelliJ

cd frontend
cp .env.example .env.local
npm install
npm run dev

cd functions                               # optional: needs Azure Functions Core Tools
cp local.settings.json.example local.settings.json
npm install
npm start
```

## API

**Items**

| Method | Path | Description |
|---|---|---|
| GET | `/api/items?category=&available=&page=&size=&sort=` | List (paged, filterable), each with its `currentRental` |
| GET | `/api/items/{id}` | Read one |
| POST | `/api/items` | Create (201) |
| PUT | `/api/items/{id}` | Update |
| DELETE | `/api/items/{id}` | Delete (204, 409 if rented out) |

Validation: `name` String (2–100), `category` enum, `dailyPrice` decimal (0–10000, 2 decimals),
`maxRentalDays` integer (1–90), `purchaseDate` date (not in the future).

**Rentals**

| Method | Path | Description |
|---|---|---|
| GET | `/api/rentals?status=&page=&size=` | List (paged, filter by `ACTIVE`/`OVERDUE`/`RETURNED`) |
| GET | `/api/rentals/{id}` | Read one |
| POST | `/api/items/{itemId}/rentals` | Rent an item (201, 409 if already rented out) |
| PUT | `/api/rentals/{id}` | Change or extend (409 if already returned) |
| POST | `/api/rentals/{id}/return` | Mark as returned, item becomes available again |
| DELETE | `/api/rentals/{id}` | Delete; cancels it if the item is still out |

Validation: `renterName` String (2–100), `renterEmail` String (email format), `startDate` date (today up to 14 days
ahead), `rentalDays` integer (1 to the item's `maxRentalDays`), `agreedToTerms` boolean (must be true).
The due date is `startDate + rentalDays`.

All validation errors return 400 with a `fieldErrors` map.

## Background job

`functions/` holds an Azure Function with a timer trigger that runs every 15 minutes. It sets every `ACTIVE` rental
whose due date has passed to `OVERDUE`, directly in the database, and logs who has which item. It runs separately
from the website, so it keeps working while the backend's App Service is idle.

Function App settings in Azure: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL=true`.
