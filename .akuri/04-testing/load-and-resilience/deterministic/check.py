#!/usr/bin/env python3
"""DETERMINISTIC GATE: load-and-resilience set (EncuestaINTTT)

Closes the testing instruction set: checks that every document carries a complete
FRONTMATTER, that the protocol document keeps the agreed CHAPTER/SECTION structure,
that the declared instruction set is complete, and that the declared A3 suite exists
(A2<->A3 coherence).

Contract: ENTRY ARGUMENTS in, RESULT out.

Usage:
    python3 deterministic/check.py [--path .]

Exit:
    0 -> PASS
    1 -> FAIL
"""

import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SET_ROOT = os.path.dirname(HERE)

REQUIRED_DOCS = [
    "README.md",
    "01-load-test-protocol.md",
    "02-endpoint-inventory.md",
    "03-thresholds-and-verdict.md",
]

BASE_FIELDS = ["file", "doc-type", "level", "area", "position", "title", "summary"]

PROTOCOL_STRUCTURE = [
    r"## CHAPTER 1:",
    r"#+ SECTION 01-PURPOSE",
    r"#+ SECTION 02-USE-MODES",
    r"#+ SECTION 01-TECHNOLOGIES",
    r"## CHAPTER 3:",
    r"## CHAPTER 4: EVALUATION & CLOSING",
]


def parse_frontmatter(path):
    text = open(path, "r", encoding="utf-8").read()
    if not text.startswith("---\n"):
        return None
    end = text.find("\n---", 4)
    if end == -1:
        return None
    fields = {}
    for line in text[4:end].splitlines():
        m = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", line)
        if m:
            fields[m.group(1)] = m.group(2).strip()
    return fields


def check_frontmatter(root, failures):
    for name in sorted(os.listdir(root)):
        if not name.endswith(".md"):
            continue
        fields = parse_frontmatter(os.path.join(root, name))
        if fields is None:
            failures.append(f"{name}: missing FRONTMATTER")
            continue
        missing = [k for k in BASE_FIELDS if not fields.get(k) or fields[k].startswith("<")]
        if missing:
            failures.append(f"{name}: missing frontmatter fields: {', '.join(missing)}")


def check_docs(root, failures):
    for name in REQUIRED_DOCS:
        if not os.path.isfile(os.path.join(root, name)):
            failures.append(f"missing required document: {name}")


def check_protocol_structure(root, failures):
    path = os.path.join(root, "01-load-test-protocol.md")
    if not os.path.isfile(path):
        return
    content = open(path, "r", encoding="utf-8").read()
    for pattern in PROTOCOL_STRUCTURE:
        if not re.search(pattern, content, re.MULTILINE):
            failures.append(f"01-load-test-protocol.md missing structure: {pattern}")


def check_a3(root, failures):
    manifest_path = os.path.join(root, "manifest.json")
    if not os.path.isfile(manifest_path):
        failures.append("missing manifest.json")
        return
    data = json.loads(open(manifest_path, "r", encoding="utf-8").read())
    a3_root = data.get("a3_root", "")
    if not os.path.isdir(a3_root):
        failures.append(f"a3_root not found: {a3_root}")
        return
    for rel in data.get("required_suite_files", []):
        if not os.path.isfile(os.path.join(a3_root, rel)):
            failures.append(f"declared A3 suite file missing: {rel}")


def report(passed, lines):
    for line in lines:
        print(("PASS: " if passed else "FAIL: ") + line)
    return 0 if passed else 1


def main() -> int:
    parser = argparse.ArgumentParser(description="Gate the load-and-resilience instruction set.")
    parser.add_argument("--path", default=SET_ROOT, help="Path to the instruction set.")
    args = parser.parse_args()
    root = os.path.abspath(args.path)

    failures = []
    check_docs(root, failures)
    check_frontmatter(root, failures)
    check_protocol_structure(root, failures)
    check_a3(root, failures)

    if failures:
        return report(False, failures)
    return report(True, ["load-and-resilience instruction set conforms (A2 == A3)"])


if __name__ == "__main__":
    sys.exit(main())
