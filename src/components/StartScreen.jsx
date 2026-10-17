import { useState } from 'react';
import { ArrowIcon, ShuffleIcon } from './Icons';

const EXAMPLE = `[
  {
    "ques": "Which data structure is LIFO?",
    "type": "mcq",
    "options": ["Queue", "Stack", "Heap", "Tree"],
    "ans": 1,
    "explanation": "A stack removes the newest item first."
  },
  {
    "ques": "What is 12 x 12?",
    "type": "numerical",
    "ans": 144,
    "explanation": "12 x 12 = 144."
  },
  {
    "ques": "Which are even numbers?",
    "type": "multiple",
    "options": ["2", "3", "4", "5"],
    "ans": [0, 2],
    "explanation": "2 and 4 are divisible by 2."
  }
]`;

function Chip({ dot, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-sm font-medium">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

export default function StartScreen({ total, byType, problems, onStart }) {
  const [count, setCount] = useState(total);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  const safeCount = Math.max(1, Math.min(Number(count) || 1, total));

  if (total === 0) {
    return (
      <section className="rounded-3xl border border-line bg-card p-6 shadow-card sm:p-10">
        <h1 className="font-display text-3xl font-semibold">No questions found</h1>
        <p className="mt-3 max-w-prose text-ink-soft">
          Add one or more <code className="rounded bg-paper px-1.5 py-0.5 text-ink">.json</code> files to{' '}
          <code className="rounded bg-paper px-1.5 py-0.5 text-ink">src/questions/</code>. Each file should hold an
          array of questions.
        </p>
        {problems.length > 0 && <Problems problems={problems} />}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-card p-6 shadow-card sm:p-10">
        <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
          {total} {total === 1 ? 'question' : 'questions'}, in a new order every time
        </h1>
        <p className="mt-3 max-w-prose text-ink-soft">
          Check each answer as you go and read the explanation before moving on.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Chip dot="bg-brand">{byType.mcq} single answer</Chip>
          <Chip dot="bg-amber">{byType.multiple} multiple answers</Chip>
          <Chip dot="bg-right">{byType.numerical} numerical</Chip>
        </div>

        <div className="mt-8 grid gap-5 border-t border-line pt-8 sm:grid-cols-2">
          <div>
            <label htmlFor="count" className="mb-2 block text-sm font-medium">
              Number of questions
            </label>
            <div className="flex items-center gap-2">
              <input
                id="count"
                type="number"
                min={1}
                max={total}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                onBlur={() => setCount(safeCount)}
                className="w-24 rounded-xl border-2 border-line bg-white px-3 py-2 text-lg outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={() => setCount(total)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-brand hover:bg-brand-tint focus-visible:outline-2 focus-visible:outline-brand"
              >
                Use all {total}
              </button>
            </div>
          </div>

          <div>
            <span id="shuffle-label" className="mb-2 block text-sm font-medium">
              Shuffle answer options
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={shuffleOptions}
              aria-labelledby="shuffle-label"
              onClick={() => setShuffleOptions((v) => !v)}
              className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <span
                className={`relative h-7 w-12 rounded-full transition-colors ${shuffleOptions ? 'bg-brand' : 'bg-line'}`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    shuffleOptions ? 'left-6' : 'left-1'
                  }`}
                />
              </span>
              <span className="text-sm text-ink-soft">{shuffleOptions ? 'On' : 'Off'}</span>
            </button>
            <p className="mt-2 text-xs text-ink-soft">Turn off if you use options like "All of the above".</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onStart({ count: safeCount, shuffleOptions })}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-lg font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ShuffleIcon className="h-5 w-5" />
          Start quiz
          <ArrowIcon className="h-5 w-5" />
        </button>
      </section>

      {problems.length > 0 && <Problems problems={problems} />}

      <details className="rounded-2xl border border-line bg-card px-5 py-4 text-sm">
        <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-brand">
          Add your own questions
        </summary>
        <p className="mt-3 text-ink-soft">
          Paste your questions into any <code className="rounded bg-paper px-1.5 py-0.5 text-ink">.json</code> file in{' '}
          <code className="rounded bg-paper px-1.5 py-0.5 text-ink">src/questions/</code>. Every file in that folder
          is loaded and combined. For <strong>mcq</strong> and <strong>multiple</strong>, <code>ans</code> can be a
          0-based index or the option text.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-brand-tint">
          {EXAMPLE}
        </pre>
      </details>
    </div>
  );
}

function Problems({ problems }) {
  return (
    <div role="alert" className="mt-6 rounded-2xl bg-amber-tint p-4 text-sm text-amber-ink">
      <p className="font-semibold">
        {problems.length} {problems.length === 1 ? 'question was' : 'questions were'} skipped
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {problems.map((p, i) => (
          <li key={i}>
            <span className="font-medium">{p.file}</span>: {p.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
