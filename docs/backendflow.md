 # Aqua Seal Backend Flow

## 1. Purpose

The Aqua Seal backend is a Go HTTP API for registering fish catches, tracking their handling history, publicly verifying batches, supporting marketplace sales, and registering catches through USSD.

The backend is organized into four main layers:

- `cmd/api`: application startup and dependency wiring
- `internal/api`: HTTP routes, request decoding, and response formatting
- `internal/services`: business rules and workflows
- `internal/repository`: storage interfaces and PostgreSQL/in-memory implementations

Shared domain structures are defined in `internal/models`, database connectivity in `internal/database`, and authorization helpers in `internal/security`.

## 2. Application Startup

The entrypoint is `backend/cmd/api/main.go`.

Startup flow:

1. Load `HTTP_ADDR` and `DATABASE_URL` from the environment.
2. Configure structured JSON logging with Go `slog`.
3. Create the in-memory batch repository.
4. Create the traceability, batch, dashboard, marketplace, and USSD services.
5. If `DATABASE_URL` exists, connect to PostgreSQL and wait for it to become ready.
6. Use PostgreSQL for USSD sessions when a database is configured; otherwise use memory.
7. Register HTTP routes and listen on the configured address.

Defaults:

- HTTP address: `:8080`
- PostgreSQL connection pool: maximum 10 connections, minimum 1
- PostgreSQL connection lifetime: 30 minutes

## 3. HTTP Routes

### Health

```text
GET /
GET /health
GET /health/db
```

The normal health routes return JSON. `/health/db` returns `503` when PostgreSQL is not configured or the database ping fails.

### Batches

```text
GET /api/v1/batches
POST /api/v1/batches
GET /api/v1/batches/{id}
POST /api/v1/batches/{id}/events
GET /api/v1/batches/{id}/trace
GET /api/v1/verify/{batch-code}
```

The API validates JSON bodies and returns consistent status codes for validation errors, missing records, and trace verification failures.

### Dashboards

```text
GET /api/v1/bmu/dashboard
GET /api/v1/admin/dashboard
```

The BMU dashboard accepts `bmu_clerk` and `admin` claims. The admin dashboard accepts only `admin` claims.

### Marketplace

```text
GET /api/v1/marketplace
POST /api/v1/marketplace/listings
POST /api/v1/purchase-requests
```

### USSD

```text
POST /api/v1/ussd
```

The USSD endpoint accepts form fields named `sessionId`, `phoneNumber`, and `text`, and returns plain-text `CON` or `END` responses.

## 4. Batch Registration Flow

Batch creation is handled by `BatchService`.

Required input:

- Species ID
- Landing-site ID
- Boat ID
- Positive weight in kilograms
- Harvest method

When a batch is created:

1. The input is validated.
2. A batch code is generated if one was not supplied.
3. The batch starts with `landed` status.
4. Verification starts as `unverified`.
5. Freshness starts as `grade_a`.
6. A landing event is added to the batch.
7. The batch is saved in the repository.

Batch IDs are normalized by removing whitespace and converting letters to uppercase when retrieving them.

Adding an inspection event changes the batch to:

- Status: `verified`
- Verification: `verified`

## 5. USSD Catch Registration Flow

The USSD workflow is implemented as a session state machine.

The steps are:

1. `menu`: display the Aqua Seal menu.
2. `boat`: collect boat registration number.
3. `species`: select Tilapia, Nile Perch, or Other.
4. `weight`: collect a positive weight in kilograms.
5. `method`: select Wild or Cage.
6. `landing_site`: collect the landing site.
7. `confirm`: confirm or cancel the catch.

The first menu currently supports catch registration. The other displayed options are not implemented yet and return a message explaining that only catch registration is available.

Sessions contain:

- Session ID
- Phone number
- Current step
- Temporary workflow data
- Expiration timestamp

Sessions expire after 15 minutes. The memory repository is concurrency-safe. The PostgreSQL repository stores temporary data as JSONB and ignores expired sessions when loading them.

After confirmation:

1. A cryptographically random batch code is generated.
2. The catch is passed to `BatchService.CreateWithCode`.
3. An `END` response includes the new batch ID.
4. An SMS is sent when a notification provider is configured.

Batch codes use the `SK` prefix and exclude ambiguous characters such as `0`, `1`, `I`, and `O`.

## 6. Traceability and Tamper Detection

Traceability is implemented by `TraceabilityService`.

Each event includes:

- Event ID and batch ID
- Event type
- Timestamp
- Location
- Actor role
- Notes and metadata
- Previous event hash
- Current event hash

Event hashes use SHA-256 over a canonical JSON representation. When appending an event, the service checks that its previous hash matches the latest stored event. It then calculates and stores the new hash.

Verification walks the full event list and checks:

1. The previous hash points to the prior event.
2. The event hash matches the event contents.

If either check fails, the trace is considered tampered and the API returns `409 Conflict`.

## 7. Public Verification

`GET /api/v1/verify/{batch-code}` returns a privacy-filtered response intended for customers or other public users.

The response includes:

- Batch code
- Species
- Landing site
- Landing time
- Harvest method
- Status
- Freshness description
- Verification checklist

It excludes fisherman identity, phone numbers, actor information, hashes, and internal metadata.

Verification checklist flags are derived from trace events:

- Catch registered
- Landed
- Inspected
- Cold storage recorded through an icing event

Public status is `VERIFIED` after inspection, `NEEDS_REVIEW` without inspection, and `EXPIRED` for expired batches.

## 8. Dashboards

`DashboardService` calculates:

- Today's catch count
- Total weight in kilograms
- Counts grouped by batch status
- The ten most recent traceability activities

BMU dashboards filter batches by `LandingSite.BMUID`. Admin dashboards aggregate all batches.

## 9. Marketplace

`MarketplaceService` currently stores listings, purchase requests, and transactions in memory with a read/write mutex.

Creating a listing requires:

- Batch ID
- Positive price per kilogram
- Positive quantity

New listings:

- Start as `active`
- Receive a generated ID
- Expire after 36 hours

Purchasing a listing:

1. Validates the listing and buyer IDs.
2. Checks that the listing exists.
3. Checks that it is active and not expired.
4. Marks the listing as sold.
5. Creates an agreed purchase request.
6. Creates an agreed transaction.

A second purchase attempt is rejected as unavailable.

## 10. PostgreSQL and Migrations

PostgreSQL access uses `pgxpool`.

The migrations create tables for:

- Roles and users
- BMUs, landing sites, fishermen, and boats
- Fish batches
- Trace events
- USSD sessions
- Notifications and audit logs
- Marketplace listings, purchase requests, and transactions

Seeded roles are:

- `fisherman`
- `bmu_clerk`
- `fishmonger`
- `buyer`
- `admin`

The directory repository supports PostgreSQL operations for users, BMUs, landing sites, fishermen, and boats. A PostgreSQL trace repository and USSD session repository are also available.

## 11. Security and Privacy

The security package provides request claims containing:

- User ID
- Role
- BMU ID

`RequireRoles` returns:

- `401 Unauthorized` when claims are missing
- `403 Forbidden` when the role is not allowed

The current code provides the authorization helper but does not yet implement authentication-token parsing. Claims must be attached to the request context by an upstream authentication layer.

Public verification is deliberately separated from internal batch and trace responses to avoid exposing personal or operational data.

## 12. Notifications

`AfricasTalkingSMSProvider` integrates with the Africa's Talking messaging API. It supports configurable credentials, sender name, request context, and custom HTTP clients for testing.

USSD registration treats SMS as a secondary notification. If SMS delivery fails, the catch registration still returns the created batch response.

## 13. Deployment

The backend includes a multi-stage Dockerfile:

1. Build the static Go binary in a Go Alpine image.
2. Copy it into a smaller Alpine runtime image.
3. Run it as a non-root `appuser`.

Docker Compose starts:

- PostgreSQL 16 on host port `5433`
- The API on host port `8080`

The database healthcheck must pass before the API starts. Migration files are mounted into PostgreSQL's initialization directory.

Run the stack with:

```bash
docker compose up --build
```

## 14. Tests

The backend tests cover:

- Health and root routes
- Batch creation and verification
- Event hash chaining
- Trace tamper detection
- Public verification privacy filtering
- BMU and admin dashboard authorization
- Dashboard aggregation and BMU scoping
- Marketplace listing and purchase behavior
- Duplicate marketplace purchases
- USSD full registration
- Invalid USSD weight handling
- Batch-code character safety
- Role middleware behavior

PostgreSQL integration tests run only when `TEST_DATABASE_URL` is set. Without that variable, they are skipped.

Run tests with:

```bash
cd backend
go test ./...
```

## 15. Current Limitations and Next Work

The current implementation is a functional foundation, but the following work remains:

1. Batch and marketplace storage still use memory in the main application.
2. PostgreSQL batch and marketplace repositories need to be wired into startup.
3. Authentication and token validation are not implemented.
4. Directory repository operations do not yet have HTTP endpoints.
5. Marketplace ownership and role checks need to be enforced.
6. Multi-step marketplace operations should use database transactions.
7. Audit-log writes are defined in the schema but not implemented.
8. USSD options for viewing batches, updating batches, sales, and help are not implemented.
9. Input validation should be expanded for ownership, event transitions, species, and landing sites.
10. OpenAPI documentation, metrics, request logging, and distributed tracing should be added.
11. Expired marketplace listings need a cleanup or scheduled-maintenance process.

## Summary

The backend now supports the core Aqua Seal workflow: a catch can be registered through HTTP or USSD, stored as a fish batch, enriched with traceability events, publicly verified without exposing private information, summarized in dashboards, and offered through a marketplace flow.

The architecture already separates transport, business logic, and persistence, making the next phase primarily about replacing remaining in-memory components with PostgreSQL and adding production authentication, authorization, auditing, and observability.
