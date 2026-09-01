# Phase 7 — Deployment and Security

## Docker services

```text
api-gateway
fastapi
worker
scheduler
neon-postgresql
object-storage
```

Neon PostgreSQL is a managed external database, so the application does not run a local PostgreSQL container in production.

## Production

```text
Internet
  ↓
Load Balancer
  ↓
Express replicas
  ↓
Neon PostgreSQL + FastAPI
  ↓
Background workers
  ↓
External APIs
```

## Secrets

Never expose in the frontend:

```text
DATABASE_URL
DATA_GOV_IN_API_KEY
OPENAQ_API_KEY
COPERNICUS_CLIENT_ID
COPERNICUS_CLIENT_SECRET
MOSDAC credentials
object storage credentials
```

Use environment variables/secret management.

## Suggested limits

```text
normal GET: 100 requests/min/IP
map: 30 requests/min/IP
analytics: 30 requests/min/IP
exports: 5 jobs/hour/IP
```

Tune using load tests.

## Database performance

Use:

```text
time-based indexes
location + timestamp composite indexes
spatial indexes where supported
summary/materialized tables for repeated analytics
connection pooling
bounded export queries
```

Do not open a new database connection for every request.

## Monitoring

Track:

```text
API latency
5xx rate
provider latency/failures
data freshness
queue depth
database connection usage
database query latency
satellite processing failures
```

Suggested tools:

```text
OpenTelemetry
Prometheus
Grafana
Sentry
Pino
```

## Failure behavior

If a provider fails:

```text
last validated data
+
quality = stale
+
provider status
```

Never invent values.

No public user login is required; protect the infrastructure and provider credentials instead.
