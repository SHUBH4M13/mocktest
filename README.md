# Quizbank

A quiz app built with React, Vite and Tailwind CSS v4. Questions are shuffled on every attempt.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). Build for production with `npm run build`.

## Adding questions

Put one or more `.json` files in `src/questions/`. Every file in that folder is loaded and combined automatically, so you can split questions by topic (`dsa.json`, `spring.json`, ...). Each file holds an array:

```json
[
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
]
```

| Field | Meaning |
| --- | --- |
| `ques` | The question text. `\n` creates a line break. |
| `type` | `mcq` (one correct option), `multiple` (one or more correct options) or `numerical` (typed number). |
| `options` | List of option strings. Not needed for `numerical`. |
| `ans` | `mcq`: a 0-based index, the option text, or a letter (`"A"`, `"B"`...). `multiple`: an array of those. `numerical`: a number. |
| `explanation` | Short explanation shown after the answer is checked. Optional. |
| `tolerance` | Numerical only, optional. Answers within this distance of `ans` count as correct. |

Notes:

- `multiple` questions are all-or-nothing: the selection must match the correct set exactly.
- A question with a problem (missing field, answer not in options...) is skipped, and the start screen lists what was wrong.
- If a file has invalid JSON syntax (a missing comma, say), Vite shows the error with the file name in the terminal and the browser.
- Options can be shuffled too (a toggle on the start screen). Leave it off if you use options like "All of the above".

## Keyboard shortcuts

`1`-`9` select an option, `Enter` checks the answer and then moves to the next question.
