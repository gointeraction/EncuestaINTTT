#!/usr/bin/env python3
"""DETERMINISTIC GATE: 05-data-analisys set (EncuestaINTTT)

Cierra el conjunto de presentación estadística: verifica que cada documento lleve
FRONTMATTER completo, que el conjunto conserve la estructura acordada y que las preguntas
de filtro y los tipos de conductor declarados existan en el cuestionario de la captura
(coherencia A2 <-> A3).

Contrato: ARGUMENTOS DE ENTRADA y RESULTADO de salida.

Uso:
    python3 deterministic/check.py [--path .]

Salida:
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
    "01-marco-estadistico.md",
    "02-camino-de-analisis.md",
    "03-catalogo-visual.md",
    "04-encaje-tecnico.md",
]

BASE_FIELDS = ["file", "doc-type", "level", "area", "position", "title", "summary"]

DOCS_STRUCTURE = [
    r"## CHAPTER 1:",
    r"## CHAPTER 4: EVALUATION & CLOSING",
]

README_STRUCTURE = DOCS_STRUCTURE + [r"## CHAPTER 3:"]


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


def check_docs(root, failures):
    for name in REQUIRED_DOCS:
        if not os.path.isfile(os.path.join(root, name)):
            failures.append(f"falta el documento requerido: {name}")


def check_frontmatter(root, failures):
    for name in REQUIRED_DOCS:
        path = os.path.join(root, name)
        if not os.path.isfile(path):
            continue
        fields = parse_frontmatter(path)
        if fields is None:
            failures.append(f"{name}: falta FRONTMATTER")
            continue
        missing = [k for k in BASE_FIELDS if not fields.get(k) or fields[k].startswith("<")]
        if missing:
            failures.append(f"{name}: faltan campos de frontmatter: {', '.join(missing)}")


def check_structure(root, failures):
    for name in REQUIRED_DOCS:
        path = os.path.join(root, name)
        if not os.path.isfile(path):
            continue
        content = open(path, "r", encoding="utf-8").read()
        patterns = README_STRUCTURE if name == "README.md" else DOCS_STRUCTURE
        for pattern in patterns:
            if not re.search(pattern, content, re.MULTILINE):
                failures.append(f"{name}: falta estructura: {pattern}")


def check_a3(root, failures):
    manifest_path = os.path.join(root, "manifest.json")
    if not os.path.isfile(manifest_path):
        failures.append("falta manifest.json")
        return
    data = json.loads(open(manifest_path, "r", encoding="utf-8").read())
    repo = os.path.normpath(os.path.join(SET_ROOT, data.get("a3_repo_rel", "../..")))
    source_rel = data.get("question_source", "src/lib/survey-data.ts")
    source = os.path.join(repo, source_rel)
    if not os.path.isfile(source):
        failures.append(f"cuestionario A3 no encontrado: {source_rel}")
        return
    text = open(source, "r", encoding="utf-8").read()
    for qid in data.get("required_filter_ids", []):
        if not re.search(r'id:\s*"%s"' % re.escape(qid), text):
            failures.append(f"filtro declarado ausente en A3: {qid}")
    for dt in data.get("required_driver_types", []):
        if not re.search(r'id:\s*"%s"' % re.escape(dt), text):
            failures.append(f"tipo de conductor declarado ausente en A3: {dt}")


def report(passed, lines):
    for line in lines:
        print(("PASS: " if passed else "FAIL: ") + line)
    return 0 if passed else 1


def main() -> int:
    parser = argparse.ArgumentParser(description="Gate del conjunto 05-data-analisys.")
    parser.add_argument("--path", default=SET_ROOT, help="Ruta del conjunto.")
    args = parser.parse_args()
    root = os.path.abspath(args.path)

    failures = []
    check_docs(root, failures)
    check_frontmatter(root, failures)
    check_structure(root, failures)
    check_a3(root, failures)

    if failures:
        return report(False, failures)
    return report(True, ["conjunto 05-data-analisys conforme (A2 == A3)"])


if __name__ == "__main__":
    sys.exit(main())
