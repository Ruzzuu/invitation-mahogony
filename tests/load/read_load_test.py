#!/usr/bin/env python3
"""Read-only concurrency test for the invitation website and Supabase wishes API.

This script never sends POST, PATCH, PUT, or DELETE requests. Production reads require
an explicit --allow-production-read flag to prevent accidental traffic.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import statistics
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from typing import Optional, TypedDict


class RequestResult(TypedDict):
    type: str
    status: int
    duration: float
    bytes: int
    valid: bool
    rows: int
    error: str


class UserResult(TypedDict):
    user: int
    requests: list[RequestResult]

PRODUCTION_SUPABASE_HOST = "yxkvfrhezzjnfttvpavt.supabase.co"


def percentile(values: list[float], percentage: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = max(0, min(len(ordered) - 1, round((len(ordered) - 1) * percentage)))
    return ordered[index]


def get(url: str, headers: dict[str, str], timeout: float) -> tuple[int, bytes, float]:
    request = urllib.request.Request(url, headers=headers, method="GET")
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read()
            return response.status, body, time.perf_counter() - started
    except urllib.error.HTTPError as error:
        return error.code, error.read(), time.perf_counter() - started


def run_virtual_user(
    user_number: int,
    page_url: Optional[str],
    wishes_url: Optional[str],
    anon_key: Optional[str],
    expected_slug: str,
    timeout: float,
) -> UserResult:
    result: UserResult = {"user": user_number, "requests": []}
    common_headers = {
        "Accept": "application/json, text/html;q=0.9, */*;q=0.8",
        "User-Agent": "InvitationReadLoadTest/1.0",
        "Cache-Control": "no-cache",
    }

    if page_url:
        status, body, duration = get(page_url, common_headers, timeout)
        result["requests"].append({
            "type": "page",
            "status": status,
            "duration": duration,
            "bytes": len(body),
            "valid": 200 <= status < 400 and len(body) > 0,
            "rows": 0,
            "error": "",
        })

    if wishes_url:
        headers = dict(common_headers)
        headers["apikey"] = anon_key or ""
        status, body, duration = get(wishes_url, headers, timeout)
        valid = 200 <= status < 300
        isolation_valid = False
        row_count = 0

        if valid:
            try:
                rows = json.loads(body)
                row_count = len(rows) if isinstance(rows, list) else -1
                isolation_valid = (
                    isinstance(rows, list)
                    and row_count <= 50
                    and all(row.get("invitation_slug") == expected_slug for row in rows)
                )
            except (json.JSONDecodeError, TypeError):
                isolation_valid = False

        result["requests"].append({
            "type": "wishes",
            "status": status,
            "duration": duration,
            "bytes": len(body),
            "rows": row_count,
            "valid": valid and isolation_valid,
            "error": "",
        })

    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Simulate simultaneous read-only invitation visitors.",
    )
    parser.add_argument("--page-url", help="Deployed invitation URL to test.")
    parser.add_argument(
        "--supabase-url",
        default=os.environ.get("TEST_SUPABASE_URL"),
        help="Supabase project URL (or TEST_SUPABASE_URL).",
    )
    parser.add_argument(
        "--anon-key",
        default=os.environ.get("TEST_SUPABASE_ANON_KEY"),
        help="Supabase publishable/anon key (or TEST_SUPABASE_ANON_KEY).",
    )
    parser.add_argument(
        "--slug",
        default=os.environ.get("TEST_INVITATION_SLUG", "alfa-rizaldy"),
        help="Invitation slug to read.",
    )
    parser.add_argument("--users", type=int, default=200, help="Concurrent users.")
    parser.add_argument("--timeout", type=float, default=20, help="Per-request timeout in seconds.")
    parser.add_argument("--p95-ms", type=float, default=2000, help="Maximum accepted p95 latency.")
    parser.add_argument("--max-failure-rate", type=float, default=0.01, help="Maximum failure ratio.")
    parser.add_argument(
        "--allow-production-read",
        action="store_true",
        help="Explicitly allow read-only traffic to the configured production Supabase host.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if not args.page_url and not args.supabase_url:
        print("ERROR: provide --page-url and/or --supabase-url", file=sys.stderr)
        return 2
    if args.users < 1 or args.users > 1000:
        print("ERROR: --users must be between 1 and 1000", file=sys.stderr)
        return 2

    wishes_url = None
    if args.supabase_url:
        if not args.anon_key:
            print("ERROR: --anon-key is required with --supabase-url", file=sys.stderr)
            return 2
        parsed = urllib.parse.urlparse(args.supabase_url)
        if parsed.hostname == PRODUCTION_SUPABASE_HOST and not args.allow_production_read:
            print(
                "REFUSED: production Supabase reads require --allow-production-read",
                file=sys.stderr,
            )
            return 2
        query = urllib.parse.urlencode({
            "select": "id,invitation_slug,created_at",
            "invitation_slug": f"eq.{args.slug}",
            "order": "created_at.desc",
            "limit": "50",
        })
        wishes_url = f"{args.supabase_url.rstrip('/')}/rest/v1/wishes?{query}"

    print(f"Starting read-only test with {args.users} simultaneous users...")
    started = time.perf_counter()
    results: list[UserResult] = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.users) as executor:
        futures = [
            executor.submit(
                run_virtual_user,
                number,
                args.page_url,
                wishes_url,
                args.anon_key,
                args.slug,
                args.timeout,
            )
            for number in range(1, args.users + 1)
        ]
        for future in concurrent.futures.as_completed(futures):
            try:
                results.append(future.result())
            except Exception as error:  # noqa: BLE001 - load test must collect all failures
                results.append({"user": 0, "requests": [{
                    "type": "exception",
                    "status": 0,
                    "duration": args.timeout,
                    "bytes": 0,
                    "valid": False,
                    "rows": 0,
                    "error": str(error),
                }]})

    requests = [request for result in results for request in result["requests"]]
    durations_ms = [request["duration"] * 1000 for request in requests]
    failures = [request for request in requests if not request["valid"]]
    failure_rate = len(failures) / len(requests) if requests else 1.0
    status_counts = Counter(request["status"] for request in requests)
    elapsed = time.perf_counter() - started

    print("\nResults")
    print("-------")
    print(f"Users:           {args.users}")
    print(f"Requests:        {len(requests)}")
    print(f"Wall time:       {elapsed:.2f} s")
    print(f"Throughput:      {len(requests) / elapsed:.2f} req/s")
    print(f"Success rate:    {(1 - failure_rate) * 100:.2f}%")
    print(f"Status codes:    {dict(sorted(status_counts.items()))}")
    print(f"Mean latency:    {statistics.mean(durations_ms):.2f} ms")
    print(f"p50 latency:     {percentile(durations_ms, 0.50):.2f} ms")
    print(f"p95 latency:     {percentile(durations_ms, 0.95):.2f} ms")
    print(f"p99 latency:     {percentile(durations_ms, 0.99):.2f} ms")
    print(f"Transferred:     {sum(request['bytes'] for request in requests) / 1024:.2f} KiB")

    if failures:
        examples = failures[:5]
        print("\nFailure examples:")
        for failure in examples:
            print(f"- type={failure['type']} status={failure['status']} error={failure.get('error', 'invalid response')}")

    p95 = percentile(durations_ms, 0.95)
    passed = failure_rate <= args.max_failure_rate and p95 <= args.p95_ms
    print(f"\nThreshold result: {'PASS' if passed else 'FAIL'}")
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
