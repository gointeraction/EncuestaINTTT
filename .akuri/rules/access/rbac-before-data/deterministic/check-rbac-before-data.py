#!/usr/bin/env python3
"""GATE for rule: rbac-before-data (EncuestaINTTT).

Every module controller must declare a guard/policy or be @Public().
Exit 0 PASS / 1 FAIL.
"""

import argparse
import sys
from pathlib import Path

SKIP = {"node_modules", ".git", "dist", ".next", ".angular"}
MARKERS = ("@UseGuards(", "@Roles(", "@Public(", "@Authenticated(")


def violations(root: Path):
    out = []
    for p in root.rglob("*.controller.ts"):
        if any(s in p.parts for s in SKIP):
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        if not any(m in text for m in MARKERS):
            out.append(p)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Back-office controllers declare access control.")
    ap.add_argument("--action", default="audit", choices=["create", "audit", "fix"])
    ap.add_argument("--path", default="analytics/api/src/modules")
    args = ap.parse_args()

    root = Path(args.path)
    if not root.exists():
        print(f"PASS: no module controllers yet ({args.path})")
        return 0

    bad = violations(root)
    if bad:
        for p in bad:
            print(f"FAIL: controller without guard/policy/public: {p}")
        return 1
    print("PASS: every controller declares access control")
    return 0


if __name__ == "__main__":
    sys.exit(main())
