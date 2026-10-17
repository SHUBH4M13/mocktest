import { useEffect, useMemo, useState } from 'react';
import { buildQuiz, loadQuestions } from './utils/questions';
import StartScreen from './components/StartScreen';
import QuestionCard from './components/QuestionCard';
import ResultScreen from './components/ResultScreen';
import ProgressBar from './components/ProgressBar';
import { CheckIcon } from './components/Icons';

// Questions are read once from every JSON file in src/questions/.
const bank = loadQuestions();

export default function App() {
  const [screen, setScreen] = useState('start'); // start | quiz | result
  const [quiz, setQuiz] = useState([]);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState([]);
  const [lastSettings, setLastSettings] = useState({ count: bank.questions.length, shuffleOptions: false });

  const byType = useMemo(() => {
    const counts = { mcq: 0, multiple: 0, numerical: 0 };
    bank.questions.forEach((q) => (counts[q.type] += 1));
    return counts;
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen, current]);

  const start = (settings, pool = bank.questions) => {
    setLastSettings(settings);
    setQuiz(buildQuiz(pool, settings));
    setCurrent(0);
    setResults([]);
    setScreen('quiz');
  };

  const handleSubmit = (response, correct) => {
    setResults((r) => [...r, { question: quiz[current], response, correct }]);
  };

  const handleNext = () => {
    if (current + 1 >= quiz.length) setScreen('result');
    else setCurrent((c) => c + 1);
  };

  const quit = () => {
    if (window.confirm('Quit this quiz? Your progress will be lost.')) setScreen('start');
  };

  const correctSoFar = results.filter((r) => r.correct).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
      <header className="mb-6 flex items-center justify-between sm:mb-8">
        <button
          type="button"
          onClick={() => screen !== 'quiz' && setScreen('start')}
          className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          aria-label="Quizbank home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <CheckIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold">Quizbank</span>
        </button>

        {screen === 'quiz' && (
          <button
            type="button"
            onClick={quit}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
          >
            Quit
          </button>
        )}
      </header>

      <main>
        {screen === 'start' && (
          <StartScreen total={bank.questions.length} byType={byType} problems={bank.problems} onStart={(s) => start(s)} />
        )}

        {screen === 'quiz' && quiz[current] && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-lg font-semibold">
                Question {current + 1} <span className="text-ink-soft">of {quiz.length}</span>
              </p>
              <p className="text-sm text-ink-soft">
                <strong className="text-right-ink">{correctSoFar}</strong> correct
              </p>
            </div>
            <ProgressBar total={quiz.length} results={results} current={current} />
            <QuestionCard
              key={`${quiz[current].id}-${current}`}
              question={quiz[current]}
              onSubmit={handleSubmit}
              onNext={handleNext}
              isLast={current + 1 >= quiz.length}
            />
          </div>
        )}

        {screen === 'result' && (
          <ResultScreen
            results={results}
            onRetake={() => start(lastSettings)}
            onRetryWrong={() =>
              start(
                { ...lastSettings, count: results.filter((r) => !r.correct).length },
                results.filter((r) => !r.correct).map((r) => r.question)
              )
            }
            onHome={() => setScreen('start')}
          />
        )}
      </main>
    </div>
  );
}
