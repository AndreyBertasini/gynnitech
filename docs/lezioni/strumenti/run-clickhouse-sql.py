#!/usr/bin/env python3
"""Esegue in chDB i blocchi ```sql di una lezione, in ordine, in una sessione pulita.

Uso: run-clickhouse-sql.py <lezione.mdx> [--show]

Exit 0 se ogni istruzione gira, 1 al primo errore, 2 se l'uso è sbagliato. Con --show stampa le righe
di risultato di SELECT/EXPLAIN/SHOW e, per ogni SELECT, rows_read e bytes_read:
sono i numeri da copiare nel testo della lezione.
Direttive, come commenti subito prima dell'istruzione:
  -- ripeti: N                 esegue l'istruzione N volte (N insert separati)
  -- errore atteso: CODICE     l'istruzione deve fallire con CODICE (es. TOO_MANY_PARTS);
                               con "ripeti" si ferma al primo errore e stampa a quale ripetizione
Un blocco ```sql con attributi (```sql title="...") viene eseguito come gli altri. Una riga
"-- ripeti:" o "-- errore atteso:" scritta male (es. codice in minuscolo) è un errore, non un commento.
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
            if re.match(r"^\s*```\s*sql(\s|$)", riga, re.IGNORECASE):
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


def senza_commenti_iniziali(istruzione):
    """Toglie i commenti prima dell'istruzione, per riconoscerne il tipo."""
    return re.sub(r"^(\s*(--[^\n]*(\n|$)|/\*.*?\*/))*\s*", "", istruzione, flags=re.DOTALL)


DIRETTIVA = re.compile(r"^\s*--\s*(ripeti|errore atteso)\b.*$", re.MULTILINE)
RIPETI = re.compile(r"^\s*--\s*ripeti:\s*(\d+)\s*$", re.MULTILINE)
ATTESO = re.compile(r"^\s*--\s*errore atteso:\s*([A-Z_]+)\s*$", re.MULTILINE)


def direttive(istruzione):
    """Legge `-- ripeti: N` e `-- errore atteso: CODICE`. Restituisce (ripetizioni, atteso, scritte_male)."""
    ripeti, atteso = RIPETI.search(istruzione), ATTESO.search(istruzione)
    valide = {m.group(0) for m in RIPETI.finditer(istruzione)} | {m.group(0) for m in ATTESO.finditer(istruzione)}
    scritte_male = [m.group(0).strip() for m in DIRETTIVA.finditer(istruzione) if m.group(0) not in valide]
    return (int(ripeti.group(1)) if ripeti else 1), (atteso.group(1) if atteso else None), scritte_male


def main(argv):
    mostra = "--show" in argv
    percorsi = [a for a in argv[1:] if not a.startswith("--")]
    if len(percorsi) != 1:
        print(__doc__)
        return 2
    with open(percorsi[0], encoding="utf-8") as f:
        testo = f.read()

    blocchi = blocchi_sql(testo)
    lista = [(r, s) for partenza, b in blocchi for r, s in istruzioni(b, partenza)]
    if not lista:
        print("ERR: nessun blocco sql trovato")
        return 1

    s = session.Session()
    versione = str(s.query("SELECT version()", "CSV")).strip().strip('"')
    for riga, istruzione in lista:
        tipo = senza_commenti_iniziali(istruzione).lower()
        lettura = tipo.startswith(LETTURE)
        ripetizioni, atteso, scritte_male = direttive(istruzione)
        if scritte_male:
            print(f"ERR L{riga}: direttiva non riconosciuta: {scritte_male[0]}")
            return 1
        risultato, fallita = None, None
        for n in range(1, ripetizioni + 1):
            try:
                risultato = s.query(istruzione, "JSON" if lettura else "TabSeparated")
            except Exception as errore:  # chDB solleva eccezioni generiche con il messaggio del server
                fallita = (n, (str(errore).strip().splitlines() or ["errore senza messaggio"])[0])
                break
        if atteso:
            if fallita is None:
                print(f"ERR L{riga}: atteso l'errore {atteso} ma l'istruzione è riuscita")
                return 1
            if f"({atteso})" not in fallita[1]:
                print(f"ERR L{riga}: atteso {atteso}, ricevuto: {fallita[1]}")
                return 1
            print(f"ok  L{riga} errore atteso {atteso} alla ripetizione {fallita[0]}")
            continue
        if fallita:
            print(f"ERR L{riga}: {fallita[1]}")
            return 1
        print(f"ok  L{riga}" + (f" x{ripetizioni}" if ripetizioni > 1 else ""))
        if mostra and lettura:
            try:
                dati = json.loads(str(risultato))
            except ValueError:
                print(str(risultato).rstrip())
                continue
            for r in dati.get("data", []):
                print("    " + "\t".join(str(v) for v in r.values()))
            stat = dati.get("statistics", {})
            if stat and not tipo.startswith("explain"):
                print(f"    rows_read={stat.get('rows_read')} bytes_read={stat.get('bytes_read')}")
    print(f"{len(blocchi)} blocchi, {len(lista)} istruzioni eseguite")
    print(f"ClickHouse {versione} · chDB {chdb.__version__}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
