import { useEffect, useRef, useState } from 'react';
import { checkAnswer, describeCorrect } from '../utils/questions';
import { ArrowIcon, CheckIcon, CrossIcon } from './Icons';

const TYPE_META = {
  mcq: { label: 'Single answer', hint: 'Choose one option', dot: 'bg-brand' },
  multiple: { label: 'Multiple answers', hint: 'Select every option that applies', dot: 'bg-amber' },
  numerical: { label: 'Numerical', hint: 'Type your answer as a number', dot: 'bg-right' },
};

const OPTION_STYLES = {
  idle: 'border-line bg-white hover:border-brand/50 hover:bg-brand-tint/40',
  selected: 'border-brand bg-brand-tint',
  right: 'border-right bg-right-tint',
  missed: 'border-dashed border-right bg-white',
  wrong: 'border-wrong bg-wrong-tint',
  dim: 'border-line bg-white opacity-60',
};

export default function QuestionCard({ question, onSubmit, onNext, isLast }) {
  const { type, options } = question;
  const meta = TYPE_META[type];
  const isNumerical = type === 'numerical';
  const isMulti = type === 'multiple';

  const [selected, setSelected] = useState([]);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef(null);

  const canSubmit = isNumerical ? text.trim() !== '' : selected.length > 0;

  useEffect(() => {
    if (isNumerical) inputRef.current?.focus();
  }, [isNumerical]);

  const toggle = (i) => {
    if (submitted) return;
    setSelected((s) => (isMulti ? (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]) : [i]));
  };

  const submit = () => {
    if (!canSubmit || submitted) return;
    const response = isNumerical ? text.trim() : selected;
    const ok = checkAnswer(question, response);
    setIsCorrect(ok);
    setSubmitted(true);
    onSubmit(response, ok);
  };

  // Keyboard: Enter checks / continues, 1-9 picks an option.
  const handlersRef = useRef({});
  handlersRef.current = { submit, onNext, toggle, submitted };
  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const h = handlersRef.current;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (h.submitted) h.onNext();
        else h.submit();
      } else if (!isNumerical && /^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (i < options.length) h.toggle(i);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isNumerical, options.length]);

  const optionState = (i) => {
    if (!submitted) return selected.includes(i) ? 'selected' : 'idle';
    const picked = selected.includes(i);
    const correct = options[i].correct;
    if (correct && picked) return 'right';
    if (correct) return 'missed';
    if (picked) return 'wrong';
    return 'dim';
  };

  const marker = (state, i) => {
    const shape = isMulti ? 'rounded-md' : 'rounded-full';
    const base = `mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 text-xs font-semibold ${shape}`;
    if (state === 'right') return <span className={`${base} border-right bg-right text-white`}><CheckIcon className="h-3.5 w-3.5" /></span>;
    if (state === 'missed') return <span className={`${base} border-right text-right`}><CheckIcon className="h-3.5 w-3.5" /></span>;
    if (state === 'wrong') return <span className={`${base} border-wrong bg-wrong text-white`}><CrossIcon className="h-3.5 w-3.5" /></span>;
    if (state === 'selected') return <span className={`${base} border-brand bg-brand text-white`}><CheckIcon className="h-3.5 w-3.5" /></span>;
    return <span className={`${base} border-line text-ink-soft`}>{i + 1}</span>;
  };

  const tag = (state) => {
    if (state === 'right') return 'Correct';
    if (state === 'missed') return 'Correct answer';
    if (state === 'wrong') return 'Your pick';
    return null;
  };

  return (
    <section className="rounded-3xl border border-line bg-card p-5 shadow-card sm:p-8">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1 text-sm font-medium">
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
        <span className="text-sm text-ink-soft">{meta.hint}</span>
      </div>

      <h2 className="whitespace-pre-wrap font-display text-xl font-semibold leading-snug sm:text-2xl">
        {question.ques}
      </h2>

      {isNumerical ? (
        <div className="mt-6">
          <label htmlFor="numeric-answer" className="mb-2 block text-sm font-medium text-ink-soft">
            Your answer
          </label>
          <input
            id="numeric-answer"
            ref={inputRef}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={text}
            readOnly={submitted}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste a number"
            className={`w-full rounded-xl border-2 bg-white px-4 py-3 font-display text-xl outline-none transition-colors placeholder:font-sans placeholder:text-base placeholder:text-ink-soft/60 focus:border-brand ${
              submitted ? (isCorrect ? 'border-right bg-right-tint' : 'border-wrong bg-wrong-tint') : 'border-line'
            }`}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3" role={isMulti ? 'group' : 'radiogroup'} aria-label="Answer options">
          {options.map((opt, i) => {
            const state = optionState(i);
            const label = tag(state);
            return (
              <button
                key={i}
                type="button"
                role={isMulti ? 'checkbox' : 'radio'}
                aria-checked={selected.includes(i)}
                aria-disabled={submitted}
                onClick={() => toggle(i)}
                className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${OPTION_STYLES[state]} ${
                  submitted ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                {marker(state, i)}
                <span className="flex-1 whitespace-pre-wrap pt-0.5 leading-snug">{opt.text}</span>
                {label && (
                  <span
                    className={`mt-1 shrink-0 text-xs font-semibold ${
                      state === 'wrong' ? 'text-wrong-ink' : 'text-right-ink'
                    }`}
                  >
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {submitted && (
        <div
          role="status"
          className={`mt-6 rounded-2xl p-4 sm:p-5 ${isCorrect ? 'bg-right-tint text-right-ink' : 'bg-wrong-tint text-wrong-ink'}`}
        >
          <p className="flex items-center gap-2 font-display text-lg font-semibold">
            {isCorrect ? <CheckIcon className="h-5 w-5" /> : <CrossIcon className="h-5 w-5" />}
            {isCorrect ? 'Correct' : 'Not quite'}
          </p>
          {!isCorrect && (
            <p className="mt-1 text-sm">
              {isNumerical
                ? <>The answer is <strong>{describeCorrect(question)}</strong>.</>
                : isMulti
                  ? 'Multiple answer questions need every correct option and no extras.'
                  : 'The correct option is highlighted above.'}
            </p>
          )}
          {question.explanation && (
            <p className="mt-3 border-t border-current/15 pt-3 text-sm leading-relaxed text-ink">
              {question.explanation}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="hidden text-sm text-ink-soft sm:block">
          {submitted ? 'Press Enter to continue' : 'Press Enter to check'}
        </span>
        {submitted ? (
          <button
            type="button"
            onClick={onNext}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {isLast ? 'See results' : 'Next question'}
            <ArrowIcon />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="ml-auto rounded-xl bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
          >
            Check answer
          </button>
        )}
      </div>
    </section>
  );
}
