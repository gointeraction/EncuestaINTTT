#!/usr/bin/env python3
"""LOCAL CHECK (EncuestaINTTT): every functional document must be authored in Spanish.

Part of the project's local rules (.akuri/rules). Runs against every transversal AND
the epic index by doc-check-epic/check-transversal (N10). A line FAILs only when it
carries 2+ English markers (phrases/terms), which avoids false positives on Spanish
sentences that use a common noun like 'login', 'admin', 'api'.

Add/remove local checks in rules.yaml `checks`.

Usage:
    python3 check-documento-en-es.py --path <doc.md>

Exit: 0 PASS ; 1 FAIL
"""

import argparse
import re
import sys
from pathlib import Path

EN_MARKERS = [
    r"\buser story\b", r"\buse case\b", r"\bsign in\b", r"\bsign up\b",
    r"\bpassword\b", r"\bforgot\b", r"\bremember me\b", r"\bwelcome\b",
    r"\busername\b", r"\blogin\b", r"\blogout\b", r"\brecovery\b",
    r"\bvalidat\w+\b", r"\bauthentication\b", r"\bregister\b",
    r"\bdashboard\b", r"\bendpoint\b", r"\bbackend\b", r"\bfrontend\b",
    r"\bdatabase\b", r"\bdeployment\b", r"\binfrastructure\b",
    r"\bsurvey\b", r"\bquestion\b", r"\banswer\b", r"\bresponse\b",
]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", required=True)
    args = parser.parse_args()

    path = Path(args.path)
    if not path.exists():
        print("FAIL: document not found")
        return 1
    text = path.read_text(encoding="utf-8")
    body = text[text.find("---\n", 4) + 4 :] if text.startswith("---\n") else text

    fails = []
    for i, line in enumerate(body.splitlines(), 1):
        if not line.strip():
            continue
        found = [m for m in EN_MARKERS if re.search(m, line, re.IGNORECASE)]
        if len(found) >= 2:
            fails.append((i, found, line.strip()[:100]))

    if fails:
        for lineno, markers, sample in fails[:10]:
            print(f"FAIL (es): line {lineno}: markers {markers} -> {sample}")
        print(f"RESULT: FAIL ({len(fails)} lines) — document must be in Spanish")
        return 1
    print("PASS: document authored in Spanish")
    return 0


if __name__ == "__main__":
    sys.exit(main())