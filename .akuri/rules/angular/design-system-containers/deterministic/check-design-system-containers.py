#!/usr/bin/env python3
"""GATE for rule: design-system-containers (EncuestaINTTT).

Pages (modules/**) and layouts (shared/layouts/**) must build their structure with
the design system container `<ds-container>`. Exit 0 PASS / 1 FAIL.
"""

import argparse
import sys
from pathlib import Path

SKIP = {"node_modules", ".git", "dist", ".next", ".angular"}
ROOTS = ("analytics/console/src/app/modules", "analytics/console/src/app/shared/layouts")


def violations(root: Path):
    out = []
    for base in ROOTS:
        d = root / base
        if not d.is_dir():
            continue
        for p in d.rglob("*.component.ts"):
            if any(s in p.parts for s in SKIP):
                continue
            text = p.read_text(encoding="utf-8", errors="ignore")
            if "<ds-container" not in text:
                out.append(p)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Pages/layouts use ds-container (design system).")
    ap.add_argument("--action", default="audit", choices=["create", "audit", "fix"])
    ap.add_argument("--path", default=".")
    args = ap.parse_args()

    root = Path(args.path)
    if not root.is_dir():
        print(f"FAIL: ruta no encontrada: {root}")
        return 1

    bad = violations(root)
    if bad:
        for p in bad:
            print(f"FAIL: componente sin <ds-container>: {p}")
        return 1
    print("PASS: páginas y layouts usan los containers del design system")
    return 0


if __name__ == "__main__":
    sys.exit(main())
