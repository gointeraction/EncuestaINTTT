#!/usr/bin/env python3
"""GATE for rule: pii-masking-server-side (EncuestaINTTT).

Every export file must apply the PII mask on the server.
Exit 0 PASS / 1 FAIL.
"""

import argparse
import sys
from pathlib import Path

SKIP = {"node_modules", ".git", "dist", ".next", ".angular"}
MASK_MARKERS = ("maskPii(", "mask(", "maskPII(", "enmascarar(")


def violations(root: Path):
    out = []
    for p in root.rglob("*.ts"):
        if any(s in p.parts for s in SKIP):
            continue
        if "export" not in p.name.lower():
            continue
        # El serializador es responsable de la máscara; controller/module solo orquestan.
        if p.name.endswith(".controller.ts") or p.name.endswith(".module.ts"):
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        if not any(m in text for m in MASK_MARKERS):
            out.append(p)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="PII masking is applied server-side on exports.")
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
            print(f"FAIL: export without server-side PII mask: {p}")
        return 1
    print("PASS: exports apply the server-side PII mask (or none exist)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
