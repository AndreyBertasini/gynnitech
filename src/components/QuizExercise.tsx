import { useEffect, useState } from 'react';
import { trackEvent } from '../utils/analytics';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Props {
  quizId: string;
  title?: string;
  questions: Question[];
}

const STORAGE_PREFIX = 'ginnytech_quiz_';

function loadAnswers(quizId: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + quizId);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAnswer(quizId: string, questionId: string, answerIndex: number) {
  const answers = loadAnswers(quizId);
  answers[questionId] = answerIndex;
  localStorage.setItem(STORAGE_PREFIX + quizId, JSON.stringify(answers));
}

export function QuizExercise({ quizId, title, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers(loadAnswers(quizId));
  }, [quizId]);

  const handleSelect = (qId: string, idx: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
    saveAnswer(quizId, qId, idx);
  };

  const handleSubmit = () => {
    setRevealed(Object.keys(answers).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    setSubmitted(true);
    const correctCount = questions.filter((q) => answers[q.id] === q.correctIndex).length;
    const pct = Math.round((correctCount / questions.length) * 100);
    trackEvent('quiz_submit', { quiz_id: quizId, correct: correctCount, total: questions.length, pct });
  };

  const handleReset = () => {
    setAnswers({});
    setRevealed({});
    setSubmitted(false);
    localStorage.removeItem(STORAGE_PREFIX + quizId);
  };

  const correctCount = questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const pct = Math.round((correctCount / questions.length) * 100);
  const scoreLabel =
    pct === 100 ? 'Perfetto' : pct >= 80 ? 'Ottimo' : pct >= 60 ? 'Buono' : pct >= 40 ? 'Da rivedere' : 'Ripasso';

  return (
    <div
      style={{
        border: '1px solid rgba(204,255,0,0.18)',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.015)',
        padding: '1.75rem',
        margin: '2.5rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: submitted ? '1rem' : '1.25rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>[QUIZ]</span>
        <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '1rem' }}>
          {title || 'Mettiti alla prova'}
        </span>
        <span style={{ color: '#475569', fontSize: '0.8rem', marginLeft: 'auto' }}>
          {questions.length} domande
        </span>
      </div>

      {questions.map((q, qi) => {
        const selected = answers[q.id];
        const isRevealed = revealed[q.id];
        const isCorrect = isRevealed && selected === q.correctIndex;

        return (
          <div
            key={q.id}
            style={{
              marginBottom: qi < questions.length - 1 ? '1.5rem' : submitted ? '1.5rem' : '0',
              paddingBottom: qi < questions.length - 1 ? '1.5rem' : submitted ? '1.5rem' : '0',
              borderBottom:
                qi < questions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <p
              style={{
                color: '#e2e8f0',
                fontWeight: 600,
                fontSize: '0.9rem',
                margin: '0 0 0.75rem',
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: 'var(--color-accent)', marginRight: '0.4rem' }}>{qi + 1}.</span>
              {q.text}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {q.options.map((opt, oi) => {
                const isSelected = selected === oi;
                const showCorrect = isRevealed && oi === q.correctIndex;
                const showWrong = isRevealed && isSelected && !isCorrect;

                let bg = 'rgba(255,255,255,0.03)';
                let border = '1px solid rgba(255,255,255,0.08)';
                let dot = '( )';
                let labelColor = '#94a3b8';

                if (isSelected && !isRevealed) {
                  bg = 'rgba(204,255,0,0.06)';
                  border = '1px solid rgba(204,255,0,0.35)';
                  dot = '(x)';
                  labelColor = 'var(--color-accent)';
                }
                if (showCorrect) {
                  bg = 'rgba(34,197,94,0.08)';
                  border = '1px solid rgba(34,197,94,0.3)';
                  dot = 'OK';
                  labelColor = '#22c55e';
                }
                if (showWrong) {
                  bg = 'rgba(248,113,113,0.08)';
                  border = '1px solid rgba(248,113,113,0.25)';
                  dot = 'NO';
                  labelColor = '#f87171';
                }

                return (
                  <button
                    key={oi}
                    onClick={() => !isRevealed && handleSelect(q.id, oi)}
                    disabled={isRevealed}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.65rem 1rem',
                      borderRadius: '10px',
                      border,
                      background: bg,
                      color: labelColor,
                      fontSize: '0.84rem',
                      cursor: isRevealed ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        minWidth: '1.4rem',
                        textAlign: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {dot}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {isRevealed && (
              <div
                style={{
                  marginTop: '0.6rem',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '8px',
                  background: isCorrect
                    ? 'rgba(34,197,94,0.06)'
                    : 'rgba(248,113,113,0.05)',
                  border: isCorrect
                    ? '1px solid rgba(34,197,94,0.15)'
                    : '1px solid rgba(248,113,113,0.12)',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                }}
              >
                {isCorrect ? 'Corretto:' : 'Rivedi:'} {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginTop: submitted ? '0' : '1rem',
        }}
      >
        {submitted ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}>{scoreLabel}</span>
              <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                {correctCount}/{questions.length} corrette ({pct}%)
              </span>
            </div>
            <button
              onClick={handleReset}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(148,163,184,0.3)',
                background: 'transparent',
                color: '#94a3b8',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Riprova
            </button>
          </>
        ) : (
          <>
            <span style={{ color: '#475569', fontSize: '0.78rem' }}>
              {allAnswered
                ? 'Tutte risposte date - invia per vedere i risultati!'
                : `${questions.filter((q) => answers[q.id] !== undefined).length}/${questions.length} risposte`}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background: allAnswered ? 'var(--color-accent)' : 'rgba(204,255,0,0.2)',
                color: allAnswered ? '#0a0f1e' : 'rgba(204,255,0,0.4)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: allAnswered ? 'pointer' : 'not-allowed',
              }}
            >
              Verifica risposte
            </button>
          </>
        )}
      </div>
    </div>
  );
}
