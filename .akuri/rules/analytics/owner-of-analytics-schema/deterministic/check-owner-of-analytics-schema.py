#!/usr/bin/env python3
"""GATE for rule: owner-of-analytics-schema (EncuestaINTTT).

Fails if any writable model in analytics/api/prisma/schema.prisma lacks @@schema("analytics").
Exit 0 PASS / 1 FAIL.
"""

import argparse
import re
import sys
from pathlib import Path

MODEL = re.compile(r"model\s+(\w+)\s*\{(.*?)\}", re.DOTALL)


def violations(schema: Path):
    out = []
    text = schema.read_text(encoding="utf-8", errors="ignore")
    for name, block in MODEL.findall(text):
        if '@@schema("analytics")' not in block.replace("'", '"'):
            out.append(f"model {name} is not declared in @@schema(\"analytics\")")
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Back-office owns only the analytics schema.")
    ap.add_argument("--action", default="audit", choices=["create", "audit", "fix"])
    ap.add_argument("--path", default="analytics/api/prisma/schema.prisma")
    args = ap.parse_args()

    schema = Path(args.path)
    if not schema.exists():
        print(f"PASS: no analytics schema yet ({args.path})")
        return 0

    bad = violations(schema)
    if bad:
        for item in bad:
            print(f"FAIL: {item}")
        return 1
    print("PASS: every model is declared in the analytics schema")
    return 0


if __name__ == "__main__":
    sys.exit(main())
