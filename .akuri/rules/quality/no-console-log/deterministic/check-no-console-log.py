#!/usr/bin/env python3
"""GATE for rule: no-console-log (EncuestaINTTT project rule).

- --action=audit : FAIL if any src/**/*.{ts,tsx} contains console.log/console.debug.
- --action=create/fix : report the offending files; FAIL if any remain.

Exit 0 PASS / 1 FAIL.
"""

import argparse
import sys
from pathlib import Path

SKIP_DIRS = {"node_modules", ".git", ".next", "dist", "build"}


def offenses(root: Path):
    out = []
    for ext in ("*.ts", "*.tsx"):
        for p in root.rglob(ext):
            if any(s in p.parts for s in SKIP_DIRS) or p.name.endswith(".d.ts"):
                continue
            text = p.read_text(encoding="utf-8", errors="ignore")
            if "console.log(" in text or "console.debug(" in text:
                out.append(p)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="No console.log in EncuestaINTTT application code.")
    ap.add_argument("--action", default="audit", choices=["create", "audit", "fix"])
    ap.add_argument("--path", default="src")
    args = ap.parse_args()

    root = Path(args.path)
    if not root.exists():
        print(f"FAIL: path not found: {args.path}")
        return 1

    bad = offenses(root)
    if bad:
        for p in bad:
            print(f"FAIL: console.log/debug: {p}")
        print("FAIL: use console.error/warn in catch blocks, not console.log")
        return 1
    print("PASS: no console.log/debug")
    return 0


if __name__ == "__main__":
    sys.exit(main())
