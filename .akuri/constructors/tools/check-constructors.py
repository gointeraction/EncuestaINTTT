#!/usr/bin/env python3
"""Verificador de los constructores project-local (L4) de EncuestaINTTT.

Comprueba que cada orquestador/how-to del catálogo existe y declara el doc-type
correcto. Contract: ENTRY ARGUMENTS in, RESULT out. Exit 0 PASS / 1 FAIL.
"""

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

EXPECTED = {
    "orchestrate-create-read-model/orchestrate-create-read-model.md": "ORCHESTRATOR",
    "orchestrate-create-reporting-endpoint/orchestrate-create-reporting-endpoint.md": "ORCHESTRATOR",
    "orchestrate-create-summarization-job/orchestrate-create-summarization-job.md": "ORCHESTRATOR",
    "how-to-create-report-export/how-to-create-report-export.md": "HOW_TO",
    "how-to-create-access-policy/how-to-create-access-policy.md": "HOW_TO",
    "how-to-generate-api-sdk/how-to-generate-api-sdk.md": "HOW_TO",
}


def doc_type(path: Path) -> str | None:
    text = path.read_text(encoding="utf-8")
    m = re.search(r"(?m)^doc-type:\s*(\S+)", text)
    return m.group(1) if m else None


def main() -> int:
    ap = argparse.ArgumentParser(description="Verifica los constructores project-local.")
    ap.add_argument("--action", default="audit", choices=["create", "audit", "fix"])
    ap.add_argument("--path", default=str(ROOT))
    args = ap.parse_args()

    root = Path(args.path)
    if not root.is_dir():
        print(f"FAIL: ruta no encontrada: {root}")
        return 1

    failures = []
    for rel, expected in EXPECTED.items():
        p = root / rel
        if not p.exists():
            failures.append(f"falta el constructor: {rel}")
            continue
        dt = doc_type(p)
        if dt != expected:
            failures.append(f"{rel}: doc-type={dt!r}, se esperaba {expected!r}")

    if failures:
        for f in failures:
            print(f"FAIL: {f}")
        return 1
    print(f"PASS: {len(EXPECTED)} constructores presentes y con doc-type correcto")
    return 0


if __name__ == "__main__":
    sys.exit(main())
