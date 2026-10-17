// One segment per question. Segments turn green or red as questions are answered.
export default function ProgressBar({ total, results, current }) {
  return (
    <div
      className="flex gap-1"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={results.length}
      aria-label="Quiz progress"
    >
      {Array.from({ length: total }, (_, i) => {
        const done = results[i];
        const color = done
          ? done.correct
            ? 'bg-right'
            : 'bg-wrong'
          : i === current
            ? 'bg-brand'
            : 'bg-line';
        return <span key={i} className={`h-2 flex-1 rounded-full transition-colors duration-300 ${color}`} />;
      })}
    </div>
  );
}
