import { useState } from 'react';

// Load sql.js from CDN — returns a fresh DB with sample tables
async function createSampleDb(): Promise<any> {
  // Load the WASM engine
  if (!(window as any).initSqlJs) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load SQL engine'));
      document.head.appendChild(script);
    });
  }

  const SQL = await (window as any).initSqlJs({
    locateFile: (file: string) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`,
  });

  const db = new SQL.Database();

  db.run(`
    CREATE TABLE utenti (
      id INTEGER PRIMARY KEY, nome TEXT, email TEXT,
      creato_il DATE, fonte TEXT
    );
    CREATE TABLE ordini (
      id INTEGER PRIMARY KEY, utente_id INTEGER, importo REAL,
      data_ordine DATE, prodotto TEXT, categoria TEXT
    );
    CREATE TABLE eventi (
      id INTEGER PRIMARY KEY, utente_id INTEGER, tipo TEXT,
      data_evento DATE, pagina TEXT
    );

    INSERT INTO utenti VALUES (1, 'Marco Rossi', 'marco@ex.com', '2025-01-15', 'google');
    INSERT INTO utenti VALUES (2, 'Giulia Bianchi', 'giulia@ex.com', '2025-01-20', 'facebook');
    INSERT INTO utenti VALUES (3, 'Luca Verdi', 'luca@ex.com', '2025-02-01', 'direct');
    INSERT INTO utenti VALUES (4, 'Sara Neri', 'sara@ex.com', '2025-02-10', 'google');
    INSERT INTO utenti VALUES (5, 'Paolo Gialli', 'paolo@ex.com', '2025-02-15', 'linkedin');
    INSERT INTO utenti VALUES (6, 'Elena Blu', 'elena@ex.com', '2025-03-01', 'google');
    INSERT INTO utenti VALUES (7, 'Franco Viola', 'franco@ex.com', '2025-03-05', 'facebook');
    INSERT INTO utenti VALUES (8, 'Maria Rosa', 'maria@ex.com', '2025-03-10', 'direct');

    INSERT INTO ordini VALUES (1, 1, 150.00, '2025-01-20', 'Scarpe running', 'Sport');
    INSERT INTO ordini VALUES (2, 1, 89.90, '2025-02-15', 'Maglietta tecnica', 'Abbigliamento');
    INSERT INTO ordini VALUES (3, 2, 220.00, '2025-01-25', 'Orologio GPS', 'Elettronica');
    INSERT INTO ordini VALUES (4, 2, 45.00, '2025-02-20', 'Cappello', 'Abbigliamento');
    INSERT INTO ordini VALUES (5, 3, 340.00, '2025-02-05', 'Cuffie Bluetooth', 'Elettronica');
    INSERT INTO ordini VALUES (6, 4, 75.50, '2025-02-22', 'Boraccia', 'Sport');
    INSERT INTO ordini VALUES (7, 5, 120.00, '2025-03-01', 'Pantaloni running', 'Abbigliamento');
    INSERT INTO ordini VALUES (8, 3, 199.00, '2025-03-10', 'Smartwatch', 'Elettronica');
    INSERT INTO ordini VALUES (9, 6, 55.00, '2025-03-15', 'Fascia cardio', 'Sport');
    INSERT INTO ordini VALUES (10, 1, 310.00, '2025-03-20', 'Scarpe trail', 'Sport');
    INSERT INTO ordini VALUES (11, 8, 180.00, '2025-03-22', 'Giacca antivento', 'Abbigliamento');

    INSERT INTO eventi VALUES (1, 1, 'page_view', '2025-01-15', '/home');
    INSERT INTO eventi VALUES (2, 1, 'page_view', '2025-01-15', '/prodotti/sport');
    INSERT INTO eventi VALUES (3, 1, 'purchase', '2025-01-20', '/checkout');
    INSERT INTO eventi VALUES (4, 2, 'page_view', '2025-01-20', '/home');
    INSERT INTO eventi VALUES (5, 2, 'page_view', '2025-01-25', '/prodotti/elettronica');
    INSERT INTO eventi VALUES (6, 2, 'purchase', '2025-01-25', '/checkout');
    INSERT INTO eventi VALUES (7, 3, 'page_view', '2025-02-01', '/prodotti/elettronica');
    INSERT INTO eventi VALUES (8, 3, 'purchase', '2025-02-05', '/checkout');
    INSERT INTO eventi VALUES (9, 4, 'page_view', '2025-03-01', '/home');
    INSERT INTO eventi VALUES (10, 5, 'page_view', '2025-03-01', '/home');
    INSERT INTO eventi VALUES (11, 3, 'page_view', '2025-03-08', '/prodotti/elettronica');
    INSERT INTO eventi VALUES (12, 3, 'purchase', '2025-03-10', '/checkout');
  `);

  return { db, SQL };
}

function renderTable(columns: string[], rows: string[][]): string {
  let html =
    '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;margin-top:0.5rem">';
  html += '<thead><tr>';
  columns.forEach((col) => {
    html += `<th style="border:1px solid rgba(255,255,255,0.12);padding:0.4rem 0.6rem;text-align:left;color:var(--color-accent);background:rgba(204,255,0,0.06)">${col}</th>`;
  });
  html += '</tr></thead><tbody>';
  rows.forEach((row) => {
    html += '<tr>';
    row.forEach((cell) => {
      html += `<td style="border:1px solid rgba(255,255,255,0.06);padding:0.35rem 0.6rem;color:#e2e8f0">${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  html += `<p style="color:#64748b;font-size:0.75rem;margin-top:0.4rem">${rows.length} righe</p>`;
  return html;
}

interface Props {
  description: string;
  hint?: string;
  initialQuery?: string;
  solutionQuery?: string;
}

export function SqlExercise({ description, hint, initialQuery, solutionQuery }: Props) {
  const [query, setQuery] = useState(initialQuery || '');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [running, setRunning] = useState(false);

  const runQuery = async () => {
    if (!query.trim()) return;
    setRunning(true);
    setResult(null);
    setError(null);

    try {
      const { db } = await createSampleDb();
      const queryResult = db.exec(query);
      db.close();

      if (queryResult.length === 0) {
        setResult('✅ Query eseguita (nessun risultato da mostrare)');
      } else {
        const { columns, values } = queryResult[0];
        const rows = values.map((row: any[]) => row.map((v: any) => (v === null ? 'NULL' : String(v))));
        setResult(renderTable(columns, rows));
      }
    } catch (err: any) {
      setError(err.message || 'Errore SQL');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div
      style={{
        border: '1px solid rgba(204,255,0,0.15)',
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.02)',
        padding: '1.5rem',
        margin: '2rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.2rem' }}>🖥️</span>
        <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.95rem' }}>Prova tu!</span>
      </div>

      <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 1rem', lineHeight: 1.6 }}>
        {description}
      </p>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Scrivi la tua query SQL qui..."
        rows={5}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runQuery();
        }}
        style={{
          width: '100%',
          padding: '0.8rem',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.4)',
          color: '#e2e8f0',
          fontSize: '0.85rem',
          fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
          resize: 'vertical',
          outline: 'none',
          lineHeight: 1.6,
          boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={runQuery}
          disabled={running || !query.trim()}
          style={{
            padding: '0.55rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: running ? 'rgba(204,255,0,0.3)' : 'var(--color-accent)',
            color: '#0a0f1e',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: running ? 'wait' : 'pointer',
          }}
        >
          {running ? 'Esecuzione...' : '▶ Esegui'}
        </button>

        <span style={{ color: '#475569', fontSize: '0.72rem' }}>Ctrl+Enter per eseguire</span>

        {hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: '#94a3b8',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {showHint ? 'Nascondi suggerimento' : '💡 Suggerimento'}
          </button>
        )}

        {solutionQuery && (
          <button
            onClick={() => setShowSolution(!showSolution)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(148,163,184,0.3)',
              background: 'transparent',
              color: '#64748b',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {showSolution ? 'Nascondi soluzione' : '👁️ Soluzione'}
          </button>
        )}
      </div>

      {showHint && hint && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(204,255,0,0.05)',
            border: '1px solid rgba(204,255,0,0.15)',
            color: '#a3e635',
            fontSize: '0.85rem',
          }}
        >
          💡 {hint}
        </div>
      )}

      {showSolution && solutionQuery && (
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 0.4rem' }}>Soluzione:</p>
          <pre
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#a3e635',
              fontSize: '0.82rem',
              fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              overflow: 'auto',
              margin: 0,
            }}
          >
            {solutionQuery}
          </pre>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.2)',
            color: '#f87171',
            fontSize: '0.85rem',
          }}
        >
          ❌ {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.06)',
            maxWidth: '100%',
            overflow: 'auto',
          }}
          dangerouslySetInnerHTML={{ __html: result }}
        />
      )}
    </div>
  );
}
