#!/usr/bin/env python3
"""GATE for rule: no-write-to-public (EncuestaINTTT).

Fails if analytics/api/src issues writes on the read-only public client.
Exit 0 PASS / 1 FAIL.
"""

import argparse
import re
import sys
from pathlib import Path

SKIP = {"node_modules", ".git", "dist", ".next", ".angular"}
WRITE_CALL = re.compile(
    r"publicRead\s*\.\s*(?:\w+\s*\.\s*)?(create|update|delete|upsert|createMany|updateMany|deleteMany)\b"
)
RAW_WRITE = re.compile(r"publicRead\s*\.\s*\$execute(Raw|Unsafe|Command)\b")


def violations(root: Path):
    out = []
    for p in root.rglob("*.ts"):
        if any(s in p.parts for s in SKIP):
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        if WRITE_CALL.search(text) or RAW_WRITE.search(text):
            out.append(p)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="No writes to the public schema from the back-office.")
    ap.add_argument("--action", default="audit", choices=["create", "audit", "fix"])
    ap.add_argument("--path", default="analytics/api/src")
    args = ap.parse_args()

    root = Path(args.path)
    if not root.exists():
        print(f"PASS: no target yet ({args.path})")
        return 0

    bad = violations(root)
    if bad:
        for p in bad:
            print(f"FAIL: write to public schema: {p}")
        return 1
    print("PASS: no writes to the public schema")
    return 0


if __name__ == "__main__":
    sys.exit(main())
