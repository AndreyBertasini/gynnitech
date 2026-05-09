#!/usr/bin/env python3
"""
GinnyTech Bulk Lesson Rewriter — Gemini-powered.
Processes all underweight lessons (<2000 chars body) across all modules.
Uses Gemini 2.5 Pro API for high-quality educational content generation.
"""
import os, json, re, sys, time, subprocess
from pathlib import Path

API_KEY = "AIzaSyCE7nO_bqR9Oyzf35wVLbwH6gaEW03ExMw"
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"
COURSE_ROOT = Path("/root/projects/gynnitech/src/content/corso")
LOG_FILE = Path("/root/projects/gynnitech/rewrite_log.txt")
MIN_CHARS = 5000  # Rewrite files below this char count (body only)

SYSTEM_PROMPT = """Sei un professore universitario italiano di data analytics e data engineering che scrive per la piattaforma GinnyTech. Riscrivi completamente la lezione seguente seguendo queste regole FERREE:

STRUTTURA:
- Frontmatter YAML preservato IDENTICO all'originale
- H1 che matcha il titolo
- Intro narrativa di 150-200 parole con: azienda reale nominata + numeri specifici + anno
- 4-6 sezioni H2 sostanziali (ognuna 300-500 parole)
- Almeno 2 casi studio reali con aziende nominate (es. Netflix, Spotify, Airbnb, Stripe, Zalando, Tesla, Revolut, Bolt, Wise) + metriche specifiche
- Almeno 1 blocco di codice SQL o Python FUNZIONANTE (non pseudocodice)
- Sezione di laboratorio con 2-3 esercizi progressivi
- Sezione Summary/Riepilogo
- Sezione References con ≥2 citazioni accademiche reali (autore, anno, pubblicazione)

REGOLE DI QUALITÀ:
- Minimo 8000 caratteri totali, almeno 3500 parole
- MAI frasi AI-style: "è importante notare", "in conclusione", "si colloca dentro", "fondamentale", "cruciale"
- NIENTE sezioni scolastiche come "Quiz", "Laboratorio", "Checkpoint" usate come H2 — integra gli esercizi nella narrativa
- Italiano naturale, universitario ma accessibile. Periodi variati.
- Ogni affermazione tecnica deve essere supportata da un esempio concreto
- I casi studio devono includere numeri reali o verosimili (es. "ridusse i costi del 34%", "aumentò la retention di 12 punti percentuali")
- Il tono è da lezione universitaria: rigoroso ma coinvolgente, mai paternalistico

FORMATO OUTPUT: restituisci SOLO il file MDX completo (frontmatter + corpo), nessun commento aggiuntivo."""

def count_chars_body(content):
    """Count characters in body only (after frontmatter)."""
    parts = content.split('---', 2)
    if len(parts) >= 3:
        return len(parts[2].strip())
    return len(content)

def call_gemini(original_mdx):
    """Call Gemini API to rewrite a lesson."""
    prompt = f"{SYSTEM_PROMPT}\n\n--- LEZIONE ORIGINALE DA RISCRIVERE COMPLETAMENTE ---\n\n{original_mdx}\n\n--- FINE LEZIONE ORIGINALE ---\n\nRiscrivi l'intera lezione ora. Restituisci SOLO il file MDX completo."
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 8192,
            "topP": 0.95
        }
    }
    
    for attempt in range(3):
        try:
            result = subprocess.run(
                ["curl", "-s", "-X", "POST", f"{API_URL}?key={API_KEY}",
                 "-H", "Content-Type: application/json",
                 "-d", json.dumps(payload)],
                capture_output=True, text=True, timeout=120
            )
            
            if result.returncode != 0:
                time.sleep(5 * (attempt + 1))
                continue
            
            data = json.loads(result.stdout)
            
            if "candidates" in data and len(data["candidates"]) > 0:
                candidate = data["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    text = candidate["content"]["parts"][0].get("text", "")
                    if text:
                        return text
            
            # Rate limit or error
            if "error" in data:
                err = data["error"]
                log(f"  API error: {err.get('message', str(err))[:200]}")
                if "429" in str(err) or "RESOURCE_EXHAUSTED" in str(err):
                    wait = min(30 * (attempt + 1), 60)
                    log(f"  Rate limited, waiting {wait}s...")
                    time.sleep(wait)
                else:
                    time.sleep(5 * (attempt + 1))
            else:
                log(f"  Unexpected response: {str(data)[:300]}")
                time.sleep(5)
                
        except json.JSONDecodeError as e:
            log(f"  JSON decode error: {e}")
            time.sleep(5)
        except Exception as e:
            log(f"  Exception: {e}")
            time.sleep(10)
    
    return None

def log(msg):
    """Log with timestamp."""
    ts = time.strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def process_module(module_path, module_name):
    """Process all files in a module."""
    files = sorted(module_path.glob("*.mdx"))
    if not files:
        return 0, 0
    
    to_rewrite = []
    for f in files:
        content = f.read_text(encoding="utf-8")
        body_chars = count_chars_body(content)
        if body_chars < MIN_CHARS:
            to_rewrite.append((f, content, body_chars))
    
    if not to_rewrite:
        log(f"  {module_name}: all {len(files)} files OK ({min(count_chars_body(f.read_text()) for f in files)}-{max(count_chars_body(f.read_text()) for f in files)} chars)")
        return len(files), 0
    
    log(f"  {module_name}: {len(to_rewrite)}/{len(files)} need rewrite ({', '.join(f'{f.name}({c}c)' for f,_,c in to_rewrite[:5])}{'...' if len(to_rewrite)>5 else ''})")
    
    rewritten = 0
    for fpath, original, orig_chars in to_rewrite:
        log(f"    Rewriting {fpath.name} ({orig_chars} chars)...")
        new_content = call_gemini(original)
        
        if new_content:
            # Validate it starts with frontmatter
            if not new_content.strip().startswith('---'):
                log(f"    ⚠️  Output doesn't start with frontmatter, prepending original")
                # Try to extract original frontmatter
                fm_end = original.find('---', 3)
                if fm_end > 0:
                    orig_fm = original[:fm_end+3]
                    body_start = new_content.find('---', 3)
                    if body_start > 0:
                        new_content = orig_fm + "\n" + new_content[body_start+3:]
                    else:
                        new_content = orig_fm + "\n\n" + new_content
            
            new_chars = count_chars_body(new_content)
            if new_chars > orig_chars:
                # Write back
                backup = fpath.with_suffix(".mdx.bak")
                fpath.rename(backup)
                fpath.write_text(new_content, encoding="utf-8")
                log(f"    ✅ {fpath.name}: {orig_chars}→{new_chars} chars (+{new_chars-orig_chars})")
                rewritten += 1
            else:
                log(f"    ⚠️  {fpath.name}: output too short ({new_chars} < {orig_chars}), keeping original")
        else:
            log(f"    ❌ {fpath.name}: Gemini API failed after retries")
        
        # Small delay between calls to avoid rate limits
        time.sleep(3)
    
    return len(files), rewritten

def main():
    log("=" * 60)
    log("GINNYTECH BULK REWRITER — GEMINI 2.5 PRO")
    log(f"Min chars threshold: {MIN_CHARS}")
    log("=" * 60)
    
    # Discover all modules
    modules = sorted([d for d in COURSE_ROOT.iterdir() if d.is_dir()])
    
    # Priority: worst modules first
    priority_modules = [
        "analisi-marketing",
        "marketing-data-science", 
        "direzioni-analitica",
        "kafka-streaming",
        "real-time-analytics",
        "filosofia-analisi-dati",
        "analisi-prodotto",
        "dashboard-visualizzazione",
        "gestione-data-driven",
        "advanced-sql",
        "analytics-engineering",
        "data-warehousing",
        "s3-data-lake",
        "data-collection",
        "infrastructure-ops",
        "matematica-analisi-dati",
        "metriche-fondamenti",
        "panoramica",
        "significativita-statistica",
    ]
    
    # Sort modules by priority
    module_map = {m.name: m for m in modules}
    ordered = []
    for name in priority_modules:
        if name in module_map:
            ordered.append(module_map[name])
    for name in module_map:
        if name not in priority_modules:
            ordered.append(module_map[name])
    
    total_files = 0
    total_rewritten = 0
    
    for mod_path in ordered:
        log(f"\n--- Module: {mod_path.name} ---")
        files, rewritten = process_module(mod_path, mod_path.name)
        total_files += files
        total_rewritten += rewritten
        log(f"  Module complete: {rewritten}/{files} rewritten")
    
    log(f"\n{'=' * 60}")
    log(f"COMPLETE: {total_rewritten}/{total_files} files rewritten across all modules")
    log(f"{'=' * 60}")

if __name__ == "__main__":
    main()
