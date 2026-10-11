#!/usr/bin/env python3
"""GATE for rule: session-guard (EncuestaINTTT).

Protected console routes must declare a session guard (canActivate).
Exit 0 PASS / 1 FAIL.
"""

import argparse
import sys
from pathlib import Path

SKIP = {"node_modules", ".git", "dist", ".next", ".angular"}


def violations(root: Path):
    out = []
    for p in root.rglob("*.routes.ts"):
        if any(s in p.parts for s in SKIP):
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        if "canActivate" not in text:
            out.append(p)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Console routes declare a session guard.")
    ap.add_argument("--action", default="audit", choices=["create", "audit", "fix"])
    ap.add_argument("--path", default="analytics/console/src/app/modules")
    args = ap.parse_args()

    root = Path(args.path)
    if not root.exists():
        print(f"PASS: no module routes yet ({args.path})")
        return 0

    bad = violations(root)
    if bad:
        for p in bad:
            print(f"FAIL: protected route without session guard: {p}")
        return 1
    print("PASS: console routes declare a session guard (or none exist)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
