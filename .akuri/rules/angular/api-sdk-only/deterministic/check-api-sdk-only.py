#!/usr/bin/env python3
"""GATE for rule: api-sdk-only (EncuestaINTTT).

Console pages must not use HttpClient directly; they consume the api-sdk.
Exit 0 PASS / 1 FAIL.
"""

import argparse
import sys
from pathlib import Path

SKIP = {"node_modules", ".git", "dist", ".next", ".angular"}
OFFENSE = ("HttpClient", "http.get(", "http.post(", "new HttpHeaders")


def violations(root: Path):
    out = []
    for p in root.rglob("*.ts"):
        if any(s in p.parts for s in SKIP):
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        if any(m in text for m in OFFENSE):
            out.append(p)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Console pages use the api-sdk only.")
    ap.add_argument("--action", default="audit", choices=["create", "audit", "fix"])
    ap.add_argument("--path", default="analytics/console/src/app/modules")
    args = ap.parse_args()

    root = Path(args.path)
    if not root.exists():
        print(f"PASS: no console pages yet ({args.path})")
        return 0

    bad = violations(root)
    if bad:
        for p in bad:
            print(f"FAIL: direct HttpClient use in a page: {p}")
        return 1
    print("PASS: console pages use the api-sdk only")
    return 0


if __name__ == "__main__":
    sys.exit(main())
