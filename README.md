# 8-Mark Coach — Pearson Edexcel IAL Psychology

A web app that gives students examiner-style feedback on their **8-mark extended open-response answers** for **Pearson Edexcel International A Level Psychology** (WPS01–WPS04). Students upload a Word or PDF file (or paste their answer) and get:

- **An estimated level and mark** using Pearson's own 8-mark level descriptors (AO1 4 / AO3 4, or AO1 4 / AO2 4 for "Discuss … make reference to the context" questions), with the AO1 vs AO3 balance shown.
- **Structure feedback**: what each paragraph earns (AO1, AO3, AO2, conclusion), plus a stronger paragraph-by-paragraph plan for that question.
- **AO1 and AO3 advice**: what knowledge is missing, how to build chains of reasoning, and how to use competing arguments.
- **A fact check** of names, dates, procedures and findings, marked correct / incorrect / unclear.
- **Practical tips**, one of the student's own paragraphs rewritten with a full chain of reasoning, and a redraft checklist.
- **An instant structure check** in the browser before marking: length, paragraphs, balance, reasoning links, named research and conclusion.

## Pearson only

The coach is limited to the Pearson Edexcel IAL specification:

- The knowledge base (`lib/knowledge.js`) holds the IAL specification content for Topics A–I, the Pearson 8-mark level descriptors, the Pearson command-word definitions and examiner-report advice.
- `lib/past-questions.json` holds **48 real Pearson IAL 8-mark questions** (WPS01 2023–2025, WPS02 2021–2024, WPS03 2021–2024) with their mark-scheme indicative content, used to calibrate marking.
- Answers that name another board (AQA, OCR, Cambridge/CAIE 9990, WJEC/Eduqas, IB) are rejected before marking, and the model is told to refuse anything off the Pearson specification.
- No AQA or Cambridge materials were used.

The textbook PDFs are **not** copied into the app (copyright and size). The model checks facts against the specification, the mark schemes and well-known Pearson Student Book content, and tells students to check their textbook when unsure.

## Run it locally

Needs Node.js 20 or later and an Anthropic API key.

```bash
cd Pearson-Psy-App
npm install
ANTHROPIC_API_KEY=sk-ant-... npm start
```

Then open <http://localhost:3000>.

To try the interface without an API key, run in demo mode. It returns example feedback for the built-in sample answer:

```bash
DEMO_MODE=1 npm start
```

## Deploy for students

The API key stays on the server; students never see it.

**Vercel**: import the GitHub repository, and add `ANTHROPIC_API_KEY` as an environment variable. `vercel.json` gives the feedback function up to 300 seconds; marking usually takes 30–90 seconds.

**Render, Railway or a school server**: run `npm install` then `npm start`, with `ANTHROPIC_API_KEY` set. The server uses `PORT` if provided.

### Settings

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | none | Required for live feedback |
| `CLAUDE_MODEL` | `claude-opus-5-5` | Model used for marking |
| `CLAUDE_EFFORT` | `medium` | `low` is faster and cheaper; `high` is more thorough |
| `DEMO_MODE` | off | `1` returns sample feedback without calling the API |
| `PORT` | `3000` | Local server port |

### Cost

Each answer costs roughly US$0.08–0.12 with the default settings. The large system prompt (specification, level descriptors and past questions) is cached, so repeat requests within a few minutes are cheaper.

## Project layout

```
Pearson-Psy-App/
├── server.js              Local server (no framework)
├── api/                   Vercel functions (feedback, catalogue)
├── lib/
│   ├── knowledge.js       Specification, level descriptors, command words, examiner advice
│   ├── past-questions.json  48 Pearson IAL 8-mark questions with indicative content
│   ├── feedback.js        Prompt, JSON schema and Claude API call
│   ├── handler.js         Shared request handling
│   └── sample-feedback.json Demo-mode feedback
├── public/
│   ├── index.html, styles.css, app.js   Student interface
│   ├── checks.js          Instant structure checks (also used by tests)
│   └── sample-answer.txt  Sample answer for the demo
└── test/                  node:test unit tests (npm test)
```

## Updating the content

- **New past papers**: add entries to `lib/past-questions.json` in the same shape (`id`, `unit`, `session`, `q`, `question`, `ao_split`, `indicative`).
- **Specification changes**: edit the `UNITS` list in `lib/knowledge.js`.

## Limitations

- Marks are estimates. Pearson marks 8-markers holistically by best fit, and teacher judgement takes priority.
- Scanned PDFs or photos of handwriting have no text layer and cannot be read; students should type or paste their answer.
- Old `.doc` files must be saved as `.docx` first.
