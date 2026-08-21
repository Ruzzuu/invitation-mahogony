#!/usr/bin/env python3
"""Read-only Supabase REST security smoke test.

No write methods are implemented. Production access requires an explicit flag.
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Optional, Tuple

PRODUCTION_SUPABASE_HOST = "yxkvfrhezzjnfttvpavt.supabase.co"


def request_json(url: str, key: str, timeout: float = 20) -> Tuple[int, Optional[object]]:
    request = urllib.request.Request(
        url,
        headers={"apikey": key, "Accept": "application/json"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.status, json.loads(response.read())
    except urllib.error.HTTPError as error:
        body = error.read()
        try:
            return error.code, json.loads(body)
        except json.JSONDecodeError:
            return error.code, None


def endpoint(base_url: str, table: str, params: dict[str, str]) -> str:
    return f"{base_url.rstrip('/')}/rest/v1/{table}?{urllib.parse.urlencode(params)}"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run read-only Supabase security checks.")
    parser.add_argument("--supabase-url", default=os.environ.get("TEST_SUPABASE_URL"))
    parser.add_argument("--anon-key", default=os.environ.get("TEST_SUPABASE_ANON_KEY"))
    parser.add_argument("--slug", default=os.environ.get("TEST_INVITATION_SLUG", "alfa-rizaldy"))
    parser.add_argument("--allow-production-read", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.supabase_url or not args.anon_key:
        print("ERROR: --supabase-url and --anon-key are required", file=sys.stderr)
        return 2

    hostname = urllib.parse.urlparse(args.supabase_url).hostname
    if hostname == PRODUCTION_SUPABASE_HOST and not args.allow_production_read:
        print("REFUSED: production reads require --allow-production-read", file=sys.stderr)
        return 2

    checks: list[tuple[str, bool, int]] = []

    status, invitations = request_json(endpoint(args.supabase_url, "invitations", {
        "select": "slug,is_active",
        "slug": f"eq.{args.slug}",
        "limit": "1",
    }), args.anon_key)
    checks.append((
        "active invitation is publicly readable",
        status == 200
        and isinstance(invitations, list)
        and len(invitations) == 1
        and invitations[0].get("slug") == args.slug
        and invitations[0].get("is_active") is True,
        status,
    ))

    status, wishes = request_json(endpoint(args.supabase_url, "wishes", {
        "select": "id,invitation_slug,created_at",
        "invitation_slug": f"eq.{args.slug}",
        "order": "created_at.desc",
        "limit": "50",
    }), args.anon_key)
    checks.append((
        "filtered wishes contain only the requested slug",
        status == 200
        and isinstance(wishes, list)
        and len(wishes) <= 50
        and all(row.get("invitation_slug") == args.slug for row in wishes),
        status,
    ))

    status, unknown_wishes = request_json(endpoint(args.supabase_url, "wishes", {
        "select": "id,invitation_slug",
        "invitation_slug": "eq.__security-probe-does-not-exist__",
        "limit": "1",
    }), args.anon_key)
    checks.append((
        "unknown invitation slug returns no wishes",
        status == 200 and unknown_wishes == [],
        status,
    ))

    status, rsvp_rows = request_json(endpoint(args.supabase_url, "rsvp", {
        "select": "id",
        "limit": "1",
    }), args.anon_key)
    rsvp_private = status in (401, 403) or (status == 200 and rsvp_rows == [])
    checks.append((
        "anonymous user cannot read RSVP rows",
        rsvp_private,
        status,
    ))

    print("Supabase read-only security checks")
    print("----------------------------------")
    for name, passed, status in checks:
        print(f"{'PASS' if passed else 'FAIL'}  HTTP {status:<3}  {name}")

    passed_count = sum(1 for _, passed, _ in checks if passed)
    print(f"\nResult: {passed_count}/{len(checks)} checks passed")
    return 0 if passed_count == len(checks) else 1


if __name__ == "__main__":
    raise SystemExit(main())
