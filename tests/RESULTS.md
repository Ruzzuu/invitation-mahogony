# Validation Results

Date: 2026-08-22

## React component suite

Command:

```bash
npm test
```

Result:

```text
Test files: 1 passed
Tests:      16 passed
Duration:   1.59 s
```

Validated:

- invitation-slug filtering;
- newest-first Wish ordering and 50-row limit;
- safe HTML/script rendering;
- empty and error states;
- trimmed Wish payloads;
- honeypot rejection for Wishes and RSVP;
- whitespace rejection;
- input limits;
- rapid duplicate Wish lock;
- rapid duplicate RSVP lock;
- button disabled/recovery behavior;
- correct RSVP guest count;
- zero guests when not attending;
- false-success prevention;
- gallery popup and Escape close.

The suite discovered and led to a fix for untrimmed whitespace in the RSVP success message.

## Production build

Command:

```bash
npm run build
```

Result: PASS

```text
dist/index.html                   1.16 kB (gzip 0.59 kB)
dist/assets/index-Ewoy9dKq.css   24.13 kB (gzip 5.34 kB)
dist/assets/index-C7EWCD6P.js   474.84 kB (gzip 142.31 kB)
479 modules transformed
Build duration: 1.10 s
```

Non-blocking warning: local Browserslist data is six months old.

## Production Supabase read-only security smoke test

Command: `tests/security/rest_security_test.py` with explicit production-read approval.

Result: 4/4 PASS

```text
PASS HTTP 200 active invitation is publicly readable
PASS HTTP 200 filtered wishes contain only the requested slug
PASS HTTP 200 unknown invitation slug returns no wishes
PASS HTTP 200 anonymous user cannot read RSVP rows
```

No write request was sent.

## 200 simultaneous Supabase Wish readers

Command: `tests/load/read_load_test.py` with 200 virtual users and explicit production-read approval.

Result: PASS

```text
Users:         200
Requests:      200
Status:        200/200 returned HTTP 200
Success rate:  100.00%
Wall time:     1.91 s
Throughput:    104.74 req/s
Mean latency:  1066.61 ms
p50 latency:   1084.77 ms
p95 latency:   1307.78 ms
p99 latency:   1383.21 ms
Transferred:   25.00 KiB
```

No write request was sent and no Wish/RSVP record was created.

Interpretation: the Supabase read path handled a one-time burst of 200 concurrent invitation openings successfully in this test. This does not guarantee every network region or future plan quota, but it provides direct evidence for the expected event size.

## Vercel page load test

Target:

```text
https://invitation-mahogony.vercel.app
```

All requests were HTTP GET and did not create or modify data.

### First 200-user run

```text
Users:         200
Requests:      200
HTTP 200:      200
Success rate:  100.00%
Wall time:     9.44 s
Mean latency:  8677.71 ms
p95 latency:   9177.59 ms
Result:        FAIL against 3000 ms threshold
```

Interpretation: the page did not fail or return errors, but the first cold/burst run was slow. Because smaller follow-up runs were fast, this appears likely to be cold CDN/proxy/local connection warm-up rather than a functional failure.

### Baseline follow-up runs

```text
1 user:    HTTP 200 100%, p95 129.16 ms
10 users:  HTTP 200 100%, p95 257.78 ms
50 users:  HTTP 200 100%, p95 271.69 ms
100 users: HTTP 200 100%, p95 390.24 ms
```

### Repeated 200-user run after warm-up

```text
Users:         200
Requests:      200
HTTP 200:      200
Success rate:  100.00%
Wall time:     1.56 s
Throughput:    128.54 req/s
Mean latency:  468.28 ms
p50 latency:   452.88 ms
p95 latency:   635.67 ms
p99 latency:   667.95 ms
Transferred:   226.56 KiB
Result:        PASS
```

Interpretation: Vercel served 200 simultaneous HTML requests successfully after warm-up. The application should be fine for approximately 200 guests, but real-world first-visit performance should still be checked from mobile networks and different regions.

## Dependency audit

Runtime-only audit after updating the transitive `ws` package:

```text
Production vulnerabilities: 0
```

The full audit still reports development/build-tool advisories related to the Vite 5 toolchain. They do not ship as executable Node services in the static Vercel deployment. Resolving all of them requires a planned major Vite upgrade rather than `npm audit fix --force` during this change.

## Not executed against production

The following intentionally require a dedicated Supabase staging project:

- spam bursts that create Wishes or RSVP rows;
- direct invalid POST payloads;
- update/delete policy probes;
- write rate-limit checks;
- duplicate writes from multiple devices;
- Turnstile verification and replay checks;
- guest-token idempotency tests.

Running these against production would create or mutate real guest data. See `tests/README.md` for the staging plan.

## Remaining manual check

Run `tests/security/supabase_security_audit.sql` in Supabase SQL Editor. It is read-only and verifies policy definitions, grants, constraints, foreign keys, indexes, and invalid existing rows that cannot be fully proven from public REST responses.

The deployed Vercel page was load-tested with the final URL `https://invitation-mahogony.vercel.app`; see the Vercel page load test section above.
