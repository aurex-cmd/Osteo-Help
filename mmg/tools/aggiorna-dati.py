#!/usr/bin/env python3
"""Copia dati clinici e motori di Osteo Help (../../index.html) in mmg/osteohelp-dati.js.

Osteo Help non viene modificato: si legge il suo index.html e se ne estraggono
- la sezione «DATI CLINICI» e il «MOTORE» (fino all'inizio dell'INTERFACCIA);
- la mappa delle categorie (FORMA_CAT) e le etichette dei risultati (badgeOf).
Rilanciare dopo ogni modifica dei contenuti clinici di Osteo Help:
    python3 mmg/tools/aggiorna-dati.py
"""
import hashlib, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parents[2]
src = (root / "index.html").read_text(encoding="utf-8")

def cut(start_pat, end_pat):
    s = re.search(start_pat, src, re.M)
    e = re.search(end_pat, src[s.start():], re.M) if s else None
    if not s or not e:
        sys.exit(f"Sezione non trovata in index.html: {start_pat!r}")
    return src[s.start():s.start() + e.start()].rstrip() + "\n"

dati = cut(r"^/\* =+\n\s*DATI CLINICI", r"^/\* =+\n\s*INTERFACCIA")
m = re.search(r"^const FORMA_CAT = \{[\s\S]*?\};\n", src, re.M)
if not m:
    sys.exit("FORMA_CAT non trovato in index.html")
cat = m.group(0)
badge = re.search(r"^function badgeOf\(.*$", src, re.M).group(0) + "\n"

digest = hashlib.sha256(src.encode("utf-8")).hexdigest()[:12]
out = (
    "/* File generato da mmg/tools/aggiorna-dati.py: NON modificare a mano.\n"
    "   Dati clinici e motori copiati senza modifiche da Osteo Help (index.html, sha256 " + digest + "). */\n"
    + dati + "\n" + cat + badge
)
dest = root / "mmg" / "osteohelp-dati.js"
dest.write_text(out, encoding="utf-8")
print(f"Scritto {dest.relative_to(root)} ({len(out.splitlines())} righe, index.html {digest})")
