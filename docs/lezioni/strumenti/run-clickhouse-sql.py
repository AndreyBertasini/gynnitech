#!/usr/bin/env python3
"""Esegue in chDB i blocchi ```sql di una lezione, in ordine, in una sessione pulita.

Uso: run-clickhouse-sql.py <lezione.mdx> [--show]

Exit 0 se ogni istruzione gira, 1 al primo errore. Con --show stampa le righe
di risultato di SELECT/EXPLAIN/SHOW e, per ogni SELECT, rows_read e bytes_read:
sono i numeri da copiare nel testo della lezione.
Ambiente: python3 -m venv <dir>/chvenv && <dir>/chvenv/bin/pip install chdb
"""
import json
import re
import sys

import chdb
from chdb import session

LETTURE = ("select", "with", "explain", "show", "describe")


def blocchi_sql(testo):
    """Restituisce (riga_di_partenza, contenuto) per ogni blocco ```sql."""
    righe = testo.split("\n")
    out, corrente, partenza = [], None, 0
    for numero, riga in enumerate(righe, start=1):
        if corrente is None:
            if re.match(r"^\s*```\s*sql\s*$", riga, re.IGNORECASE):
                corrente, partenza = [], numero + 1
        elif re.match(r"^\s*```\s*$", riga):
            out.append((partenza, "\n".join(corrente)))
            corrente = None
        else:
            corrente.append(riga)
    return out


def istruzioni(blocco, riga_blocco):
    """Divide su ';' fuori da stringhe e commenti. Restituisce (riga, testo)."""
    out, buf, i, riga, inizio = [], [], 0, riga_blocco, None
    stato = None  # None, "'", '"', "`", "--", "/*"
    while i < len(blocco):
        c, due = blocco[i], blocco[i:i + 2]
        if stato is None:
            if due == "--":
                stato = "--"
            elif due == "/*":
                stato = "/*"
            elif c in "'\"`":
                stato = c
            elif c == ";":
                testo = "".join(buf).strip()
                if testo:
                    out.append((inizio, testo))
                buf, inizio = [], None
                i += 1
                continue
        elif stato == "--" and c == "\n":
            stato = None
        elif stato == "/*" and due == "*/":
            buf.append(due)
            i += 2
            stato = None
            continue
        elif stato in "'\"`" and c == "\\":
            buf.append(blocco[i:i + 2])
            riga += blocco[i:i + 2].count("\n")
            i += 2
            continue
        elif stato in "'\"`" and c == stato:
            stato = None
        if inizio is None and not c.isspace() and stato != "--" and due not in ("--", "/*"):
            inizio = riga
        if c == "\n":
            riga += 1
        buf.append(c)
        i += 1
    testo = "".join(buf).strip()
    if testo and not re.fullmatch(r"(--[^\n]*\n?\s*)+", testo):
        out.append((inizio or riga_blocco, testo))
    return out


def main(argv):
    mostra = "--show" in argv
    percorsi = [a for a in argv[1:] if not a.startswith("--")]
    if len(percorsi) != 1:
        print(__doc__)
        return 2
    with open(percorsi[0], encoding="utf-8") as f:
        testo = f.read()

    lista = [(r, s) for partenza, b in blocchi_sql(testo) for r, s in istruzioni(b, partenza)]
    if not lista:
        print("ERR: nessun blocco sql trovato")
        return 1

    s = session.Session()
    versione = str(s.query("SELECT version()", "CSV")).strip().strip('"')
    for riga, istruzione in lista:
        lettura = istruzione.lstrip().lower().startswith(LETTURE)
        try:
            risultato = s.query(istruzione, "JSON" if lettura else "TabSeparated")
        except Exception as errore:  # chDB solleva eccezioni generiche con il messaggio del server
            print(f"ERR L{riga}: {str(errore).strip().splitlines()[0]}")
            return 1
        print(f"ok  L{riga}")
        if mostra and lettura:
            try:
                dati = json.loads(str(risultato))
            except ValueError:
                print(str(risultato).rstrip())
                continue
            for r in dati.get("data", []):
                print("    " + "\t".join(str(v) for v in r.values()))
            stat = dati.get("statistics", {})
            if stat and not istruzione.lstrip().lower().startswith("explain"):
                print(f"    rows_read={stat.get('rows_read')} bytes_read={stat.get('bytes_read')}")
    print(f"ClickHouse {versione} · chDB {chdb.__version__}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
