// Every .json file inside src/questions/ is picked up automatically.
// Each file must contain an array of question objects (see README.md).
const files = import.meta.glob('../questions/*.json', { eager: true, import: 'default' });

const pick = (obj, keys) => {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
};

export function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,\s]/g, '');
    if (cleaned === '') return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeType(rawType, raw) {
  if (typeof rawType === 'string') {
    const t = rawType.trim().toLowerCase();
    if (t.includes('multi') || t === 'msq') return 'multiple';
    if (t.includes('num') || t === 'integer' || t === 'decimal') return 'numerical';
    if (t === 'mcq' || t === 'single' || t.includes('mcq')) return 'mcq';
    throw new Error(`unknown type "${rawType}" (use mcq, numerical or multiple)`);
  }
  // No type given: infer it.
  if (!Array.isArray(raw.options)) return 'numerical';
  return Array.isArray(pick(raw, ['ans', 'answer'])) ? 'multiple' : 'mcq';
}

// An answer can be a 0-based index, the option text, or a letter (A, B, C...).
function resolveIndex(a, texts) {
  if (typeof a === 'number') {
    return Number.isInteger(a) && a >= 0 && a < texts.length ? a : -1;
  }
  const s = String(a).trim();
  const exact = texts.findIndex((t) => t.trim().toLowerCase() === s.toLowerCase());
  if (exact !== -1) return exact;
  if (/^[A-Za-z]$/.test(s)) {
    const i = s.toUpperCase().charCodeAt(0) - 65;
    return i < texts.length ? i : -1;
  }
  if (/^\d+$/.test(s)) {
    const i = Number(s);
    return i < texts.length ? i : -1;
  }
  return -1;
}

function normalizeQuestion(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('not an object');

  const ques = pick(raw, ['ques', 'question', 'q']);
  if (typeof ques !== 'string' || !ques.trim()) throw new Error('missing "ques"');

  const type = normalizeType(pick(raw, ['type', 'questType', 'quest_type', 'questionType']), raw);
  const ans = pick(raw, ['ans', 'answer']);
  if (ans === undefined) throw new Error('missing "ans"');
  const explanation = String(pick(raw, ['explanation', 'explain', 'expl']) ?? '');

  if (type === 'numerical') {
    const answer = toNumber(ans);
    if (answer === null) throw new Error('"ans" must be a number for numerical questions');
    const tolerance = Math.abs(Number(pick(raw, ['tolerance', 'tol']) ?? 0)) || 0;
    return { ques, type, answer, tolerance, explanation, options: [] };
  }

  const opts = raw.options;
  if (!Array.isArray(opts) || opts.length < 2) throw new Error('"options" needs at least 2 items');
  const texts = opts.map(String);
  const correctIdx = (Array.isArray(ans) ? ans : [ans]).map((a) => resolveIndex(a, texts));
  if (correctIdx.some((i) => i === -1)) throw new Error('"ans" does not match any option');
  const unique = [...new Set(correctIdx)];
  if (type === 'mcq' && unique.length !== 1) throw new Error('mcq needs exactly one correct answer');
  if (type === 'multiple' && unique.length < 1) throw new Error('multiple needs at least one correct answer');

  return {
    ques,
    type,
    explanation,
    options: texts.map((text, i) => ({ text, correct: unique.includes(i) })),
  };
}

export function loadQuestions() {
  const questions = [];
  const problems = [];

  Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([path, data]) => {
      const file = path.split('/').pop();
      const list = Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : null;
      if (!list) {
        problems.push({ file, message: 'The file must contain an array of questions.' });
        return;
      }
      list.forEach((raw, i) => {
        try {
          questions.push({ id: `${file}#${i + 1}`, source: file, ...normalizeQuestion(raw) });
        } catch (err) {
          problems.push({ file, message: `Question ${i + 1}: ${err.message}` });
        }
      });
    });

  return { questions, problems };
}

// Fisher-Yates shuffle, returns a new array.
export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQuiz(pool, { count, shuffleOptions }) {
  const picked = shuffle(pool).slice(0, Math.max(1, Math.min(count || pool.length, pool.length)));
  return picked.map((q) =>
    shuffleOptions && q.options.length ? { ...q, options: shuffle(q.options) } : { ...q, options: [...q.options] }
  );
}

export function checkAnswer(q, response) {
  if (q.type === 'numerical') {
    const n = toNumber(response);
    if (n === null) return false;
    const eps = 1e-9 * Math.max(1, Math.abs(q.answer));
    return Math.abs(n - q.answer) <= q.tolerance + eps;
  }
  const picked = new Set(response);
  return q.options.every((o, i) => o.correct === picked.has(i));
}

export function formatNumber(n) {
  return Number.isInteger(n) ? String(n) : String(Number(n.toPrecision(12)));
}

export function describeCorrect(q) {
  if (q.type === 'numerical') {
    return q.tolerance > 0
      ? `${formatNumber(q.answer)} (accepts ± ${formatNumber(q.tolerance)})`
      : formatNumber(q.answer);
  }
  return q.options.filter((o) => o.correct).map((o) => o.text).join(', ');
}

export function describeResponse(q, response) {
  if (q.type === 'numerical') return String(response);
  return response.map((i) => q.options[i].text).join(', ');
}
