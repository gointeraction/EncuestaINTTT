#!/usr/bin/env python3
"""GATE for rule: access-audit-required (EncuestaINTTT).

Protected reads (@Get without @Public) must reference the access audit.
Exit 0 PASS / 1 FAIL.
"""

import argparse
import sys
from pathlib import Path

SKIP = {"node_modules", ".git", "dist", ".next", ".angular"}
AUDIT_MARKERS = ("accessAudit", "AccessAudit", "audit.read", "audit.log", "registrarLectura")


def violations(root: Path):
    out = []
    for p in root.rglob("*.controller.ts"):
        if any(s in p.parts for s in SKIP):
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        if "@Get(" in text and "@Public(" not in text:
            if not any(m in text for m in AUDIT_MARKERS):
                out.append(p)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Protected reads are access-audited.")
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
            print(f"FAIL: protected read without access audit: {p}")
        return 1
    print("PASS: protected reads reference the access audit (or none exist)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
