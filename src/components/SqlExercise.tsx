import { useMemo, useState } from 'react';
import initSqlJs, { type Database, type SqlJsStatic, type SqlValue } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { currentSiteLanguage } from '../utils/language';
import { trackEvent } from '../utils/analytics';

type ResultTable = {
  columns: string[];
  rows: string[][];
};

interface Props {
  description: string;
  hint?: string;
  initialQuery?: string;
  solutionQuery?: string;
}

let sqlModulePromise: Promise<SqlJsStatic> | null = null;

const getSqlModule = () => {
  sqlModulePromise ??= initSqlJs({
    locateFile: () => sqlWasmUrl,
  });
  return sqlModulePromise;
};

async function createSampleDb(): Promise<Database> {
  const SQL = await getSqlModule();
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
    INSERT INTO utenti VALUES (9, 'Nadia Argento', 'nadia@ex.com', '2025-03-18', 'newsletter');

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
    INSERT INTO ordini VALUES (12, 1, 89.90, '2025-02-15', 'Maglietta tecnica', 'Abbigliamento');
    INSERT INTO ordini VALUES (13, 7, 19.90, '2025-03-23', 'Sticker pack', 'Accessori');
    INSERT INTO ordini VALUES (14, 7, 260.00, '2025-03-24', 'Action camera', 'Elettronica');
    INSERT INTO ordini VALUES (15, 8, 95.00, '2025-03-25', 'Zaino running', 'Sport');

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
    INSERT INTO eventi VALUES (13, 5, 'page_view', '2025-03-11', '/prodotti/elettronica');
    INSERT INTO eventi VALUES (14, 5, 'page_view', '2025-03-11', '/products/electronics');

    CREATE VIEW users AS
      SELECT id, nome AS name, email, creato_il AS created_at, fonte AS source
      FROM utenti;

    CREATE VIEW orders AS
      SELECT
        id,
        utente_id AS user_id,
        importo AS amount,
        data_ordine AS order_date,
        prodotto AS product,
        categoria,
        CASE categoria
          WHEN 'Sport' THEN 'Sports'
          WHEN 'Abbigliamento' THEN 'Clothing'
          WHEN 'Elettronica' THEN 'Electronics'
          WHEN 'Accessori' THEN 'Accessories'
          ELSE categoria
        END AS category
      FROM ordini;

    CREATE VIEW events AS
      SELECT
        id,
        utente_id AS user_id,
        tipo AS type,
        data_evento AS event_date,
        pagina,
        CASE pagina
          WHEN '/prodotti/elettronica' THEN '/products/electronics'
          WHEN '/prodotti/sport' THEN '/products/sport'
          ELSE pagina
        END AS page
      FROM eventi;
  `);

  return db;
}

const formatSqlValue = (value: SqlValue): string => {
  if (value === null) return 'NULL';
  if (value instanceof Uint8Array) return `[blob ${value.byteLength} bytes]`;
  return String(value);
};

const copyByLanguage = {
  it: {
    title: 'Prova tu',
    placeholder: 'Scrivi la tua query SQL qui...',
    running: 'Esecuzione...',
    run: 'Esegui',
    shortcut: 'Ctrl+Enter per eseguire',
    showHint: 'Suggerimento',
    hideHint: 'Nascondi suggerimento',
    showSolution: 'Soluzione',
    hideSolution: 'Nascondi soluzione',
    solutionLabel: 'Soluzione:',
    emptyResult: 'Query eseguita. Nessun risultato da mostrare.',
    rows: 'righe',
    errorFallback: 'Errore SQL',
  },
  en: {
    title: 'Try it yourself',
    placeholder: 'Write your SQL query here...',
    running: 'Running...',
    run: 'Run',
    shortcut: 'Ctrl+Enter to run',
    showHint: 'Hint',
    hideHint: 'Hide hint',
    showSolution: 'Solution',
    hideSolution: 'Hide solution',
    solutionLabel: 'Solution:',
    emptyResult: 'Query executed. No result to show.',
    rows: 'rows',
    errorFallback: 'SQL error',
  },
};

export function SqlExercise({ description, hint, initialQuery, solutionQuery }: Props) {
  const language = currentSiteLanguage();
  const copy = copyByLanguage[language];
  const [query, setQuery] = useState(initialQuery || '');
  const [table, setTable] = useState<ResultTable | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [running, setRunning] = useState(false);

  const normalizedQuery = useMemo(() => query.replaceAll('\\n', '\n'), [query]);
  const normalizedSolution = useMemo(() => solutionQuery?.replaceAll('\\n', '\n'), [solutionQuery]);

  const runQuery = async () => {
    if (!normalizedQuery.trim()) return;
    setRunning(true);
    setTable(null);
    setMessage(null);
    setError(null);

    try {
      const db = await createSampleDb();
      const queryResult = db.exec(normalizedQuery);
      db.close();
      trackEvent('sql_run', { rows: queryResult.length > 0 ? queryResult[0].values.length : 0 });

      if (queryResult.length === 0) {
        setMessage(copy.emptyResult);
      } else {
        const { columns, values } = queryResult[0];
        setTable({
          columns,
          rows: values.map((row) => row.map(formatSqlValue)),
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : copy.errorFallback);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div
      data-sql-exercise
      style={{
        border: '1px solid rgba(204,255,0,0.15)',
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.02)',
        padding: '1.5rem',
        margin: '2rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span aria-hidden="true" style={{ fontSize: '1rem', fontWeight: 700 }}>[SQL]</span>
        <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.95rem' }}>{copy.title}</span>
      </div>

      <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 1rem', lineHeight: 1.6 }}>
        {description}
      </p>

      <textarea
        value={normalizedQuery}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={copy.placeholder}
        rows={5}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) runQuery();
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
          disabled={running || !normalizedQuery.trim()}
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
          {running ? copy.running : copy.run}
        </button>

        <span style={{ color: '#475569', fontSize: '0.72rem' }}>{copy.shortcut}</span>

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
            {showHint ? copy.hideHint : copy.showHint}
          </button>
        )}

        {normalizedSolution && (
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
            {showSolution ? copy.hideSolution : copy.showSolution}
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
          {hint}
        </div>
      )}

      {showSolution && normalizedSolution && (
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 0.4rem' }}>{copy.solutionLabel}</p>
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
            {normalizedSolution}
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
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#cbd5e1',
            fontSize: '0.85rem',
          }}
        >
          {message}
        </div>
      )}

      {table && (
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
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            <thead>
              <tr>
                {table.columns.map((column) => (
                  <th
                    key={column}
                    style={{
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: '0.4rem 0.6rem',
                      textAlign: 'left',
                      color: 'var(--color-accent)',
                      background: 'rgba(204,255,0,0.06)',
                    }}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={`${rowIndex}-${row.join('|')}`}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${rowIndex}-${cellIndex}`}
                      style={{
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '0.35rem 0.6rem',
                        color: '#e2e8f0',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.4rem' }}>
            {table.rows.length} {copy.rows}
          </p>
        </div>
      )}
    </div>
  );
}
