import { useState } from 'react';
import { describeCorrect, describeResponse } from '../utils/questions';
import { CheckIcon, CrossIcon } from './Icons';

function verdict(pct) {
  if (pct >= 90) return 'Excellent work';
  if (pct >= 70) return 'Solid run';
  if (pct >= 40) return 'Getting there';
  return 'Worth another pass';
}

function ScoreRing({ pct }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-line)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display text-4xl font-semibold">
        {pct}%
      </div>
    </div>
  );
}

export default function ResultScreen({ results, onRetake, onRetryWrong, onHome }) {
  const [filter, setFilter] = useState('all');
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const wrong = total - correct;
  const pct = total ? Math.round((correct / total) * 100) : 0;

  const shown = results
    .map((r, i) => ({ ...r, n: i + 1 }))
    .filter((r) => (filter === 'wrong' ? !r.correct : true));

  return (
    <div className="space-y-6">
      <section className="flex flex-col items-center gap-6 rounded-3xl border border-line bg-card p-6 text-center shadow-card sm:flex-row sm:p-10 sm:text-left">
        <ScoreRing pct={pct} />
        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold">{verdict(pct)}</h1>
          <p className="mt-2 text-ink-soft">
            You answered <strong className="text-right-ink">{correct}</strong> of {total} correctly
            {wrong > 0 && (
              <>
                {' '}and missed <strong className="text-wrong-ink">{wrong}</strong>
              </>
            )}
            .
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
            <button
              type="button"
              onClick={onRetake}
              className="rounded-xl bg-brand px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Retake, reshuffled
            </button>
            {wrong > 0 && (
              <button
                type="button"
                onClick={onRetryWrong}
                className="rounded-xl border-2 border-brand px-5 py-3 font-semibold text-brand transition-colors hover:bg-brand-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Retry the {wrong} I missed
              </button>
            )}
            <button
              type="button"
              onClick={onHome}
              className="rounded-xl px-5 py-3 font-semibold text-ink-soft transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Back to start
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Review</h2>
          <div className="flex rounded-xl bg-white p-1 text-sm font-medium shadow-sm" role="tablist" aria-label="Filter answers">
            {[
              ['all', `All (${total})`],
              ['wrong', `Missed (${wrong})`],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded-lg px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                  filter === key ? 'bg-brand text-white' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="rounded-2xl border border-line bg-card p-6 text-center text-ink-soft">
            Nothing missed. Every answer was correct.
          </p>
        ) : (
          <ul className="space-y-3">
            {shown.map((r) => (
              <li key={r.question.id + r.n}>
                <details
                  open={!r.correct}
                  className="group rounded-2xl border border-line bg-card px-4 py-3 shadow-sm sm:px-5"
                >
                  <summary className="flex cursor-pointer list-none items-start gap-3 focus-visible:outline-2 focus-visible:outline-brand">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
                        r.correct ? 'bg-right' : 'bg-wrong'
                      }`}
                    >
                      {r.correct ? <CheckIcon className="h-3.5 w-3.5" /> : <CrossIcon className="h-3.5 w-3.5" />}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap font-medium leading-snug">
                      <span className="text-ink-soft">{r.n}. </span>
                      {r.question.ques}
                    </span>
                  </summary>
                  <dl className="mt-3 space-y-2 pl-9 text-sm">
                    <div>
                      <dt className="text-ink-soft">Your answer</dt>
                      <dd className={`font-medium ${r.correct ? 'text-right-ink' : 'text-wrong-ink'}`}>
                        {describeResponse(r.question, r.response)}
                      </dd>
                    </div>
                    {!r.correct && (
                      <div>
                        <dt className="text-ink-soft">Correct answer</dt>
                        <dd className="font-medium text-right-ink">{describeCorrect(r.question)}</dd>
                      </div>
                    )}
                    {r.question.explanation && (
                      <div className="rounded-xl bg-paper p-3 leading-relaxed">{r.question.explanation}</div>
                    )}
                  </dl>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
