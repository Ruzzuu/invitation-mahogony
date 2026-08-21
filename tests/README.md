# Test Strategy

The test suite is split into safe local tests, read-only remote tests, and manual database audits.

## 1. React component tests

File:

```text
src/components/GalleryRSVP.test.jsx
```

All Supabase methods are mocked. An unexpected real request is impossible because the real Supabase module is replaced before the component is imported.

Covered behavior:

### Database isolation

- Reads only `invitation_slug=alfa-rizaldy`.
- Sorts newest first.
- Limits output to 50 Wishes.
- Displays an empty state.
- Displays a load failure safely.

### Content safety

- HTML/script payloads render as text.
- No injected `<script>` or attacker-controlled `<img>` element is created.

### Wishes

- Trims names and messages.
- Includes the correct invitation slug.
- Selects only expected public columns after insert.
- Rejects a filled honeypot.
- Rejects whitespace-only values.
- Enforces `required`, name `maxLength=100`, and message `maxLength=1000`.
- Locks rapid duplicate submissions.
- Disables the submit button while sending.
- Recovers and displays a safe error after failure.

### RSVP

- Includes the correct invitation slug.
- Stores the selected guest count.
- Stores zero guests for `Tidak Hadir`.
- Rejects a filled honeypot.
- Locks rapid duplicate submissions.
- Does not show false success after failure.

### Gallery

- Opens the fullscreen popup.
- Closes with Escape.

## 2. Read-only Supabase REST security test

File:

```text
tests/security/rest_security_test.py
```

Checks:

1. The requested invitation exists and is active.
2. Filtered Wishes contain only the requested slug.
3. A fake invitation slug returns no Wishes.
4. Anonymous access cannot retrieve RSVP rows.

It implements only HTTP GET. There is no write code in this test.

## 3. SQL audit

File:

```text
tests/security/supabase_security_audit.sql
```

Run manually in Supabase SQL Editor. It verifies configuration that REST alone cannot reliably prove:

- RLS enabled state;
- policy expressions;
- table grants;
- anonymous CRUD privilege matrix;
- indexes;
- foreign keys;
- CHECK constraints;
- invalid existing records;
- row counts by invitation slug.

## 4. Read-only load test

File:

```text
tests/load/read_load_test.py
```

The default scenario launches 200 workers at once. Each worker performs one page request, one Supabase request, or both depending on supplied arguments.

The test intentionally does not simulate 200 Wish/RSVP inserts. Load tests must not pollute production data. Controlled write tests should use a dedicated staging project with fixture cleanup and explicit rate-limit goals.

Metrics:

- HTTP status distribution;
- request count;
- wall-clock duration;
- throughput;
- success rate;
- mean latency;
- p50/p95/p99 latency;
- transferred bytes;
- response slug isolation.

## 5. Tests still requiring staging infrastructure

These should not run against real guest data:

- direct REST rejection of names over 100 characters;
- direct REST rejection of messages over 1,000 characters;
- direct REST rejection of guest counts below 0 or above 10;
- unknown/inactive invitation insert rejection;
- anonymous update/delete denial;
- Turnstile invalid/replayed-token rejection;
- per-IP rate-limit verification;
- 20 simultaneous identical RSVP writes;
- idempotent retry after a committed request times out;
- guest-token uniqueness across browser tabs and devices.

A separate Supabase staging project is recommended before implementing these destructive tests.

## Acceptance criteria for approximately 200 guests

- Unit tests: 100% pass.
- Production build: pass.
- Read-only load failure rate: below 1%.
- Read-only p95: below 2 seconds.
- No cross-invitation Wish response.
- No anonymous RSVP disclosure.
- No anonymous update/delete grants.
- Indexed Wish lookup on `(invitation_slug, created_at DESC)`.
- No database validation violations.

## Important limitation

A frontend honeypot is not a complete anti-spam solution. Advanced bots can call Supabase directly. If abuse occurs, route writes through a trusted server or Edge Function and verify Cloudflare Turnstile plus a server-side rate limit before inserting data.
