// Instant structure checks that run in the browser before the examiner feedback.
// These are quick heuristics, not marks. Shared with the Node tests.

const EVAL_WORDS = /\b(strength|weakness|limitation|however|on the other hand|in contrast|criticis|support(s|ed|ing)? (for|the)|evidence|contradict|refute|challenge|valid|reliab|generalis|credib|ethic|reductionis|holis|application|useful|alternative)\w*/gi;
const REASONING = /\b(this means|which means|this suggests|which suggests|therefore|thus|as a result|because|so this|this shows|which shows|consequently|this implies|meaning that)\b/gi;
const CONCLUSION = /^(in conclusion|to conclude|overall|in summary|to sum up|on balance|taking everything into account|ultimately)\b/i;
const STUDY_CITATION = /\b[A-Z][A-Za-z'’\-]+(?:\s(?:and|&)\s[A-Z][A-Za-z'’\-]+|\set al\.?)?\s?\(\d{4}\)|\([A-Z][A-Za-z'’\-]+(?:\s(?:and|&)\s[A-Z][A-Za-z'’\-]+|\set al\.?)?,?\s\d{4}\)/g;
const QUESTION_LINE = /^(.*\b(evaluate|assess|discuss|to what extent)\b.*?)(\(\s*8\s*(marks?)?\s*\)|\[\s*8\s*(marks?)?\s*\])?\s*$/i;

export function splitParagraphs(text) {
  return text
    .replace(/\r/g, "")
    .split(/\n\s*\n|\n(?=\s{2,}|\t)/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0);
}

// If an uploaded file starts with the exam question, separate it from the answer.
export function separateQuestion(text) {
  const lines = text.replace(/\r/g, "").split("\n");
  const first = lines.findIndex((l) => l.trim());
  if (first === -1) return { question: "", answer: "" };
  const head = [];
  for (let i = first; i < Math.min(lines.length, first + 12); i++) {
    if (!lines[i].trim()) break;
    head.push(lines[i].trim());
  }
  const headText = head.join(" ");
  const m = headText.match(QUESTION_LINE);
  if (m && headText.length < 900 && (m[3] || /\?$|\.$/.test(headText)) && /\b(evaluate|assess|discuss|to what extent)\b/i.test(headText)) {
    const rest = lines.slice(first + head.length).join("\n").trim();
    if (rest.length > 80) return { question: headText, answer: rest };
  }
  return { question: "", answer: text.trim() };
}

export function questionType(question) {
  const q = question.toLowerCase();
  if (/must make reference to the context|reference to the context/.test(q)) return "AO1/AO2";
  if (/\b(evaluate|assess|to what extent)\b/.test(q)) return "AO1/AO3";
  if (/\bdiscuss\b/.test(q)) return "AO1/AO2";
  return "unknown";
}

function count(re, text) {
  return (text.match(re) || []).length;
}

function classify(p) {
  const evalHits = count(EVAL_WORDS, p);
  const reasonHits = count(REASONING, p);
  if (CONCLUSION.test(p)) return "Conclusion";
  if (evalHits >= 2 || (evalHits >= 1 && reasonHits >= 1)) return "AO3";
  if (evalHits === 1) return "AO1+AO3";
  return "AO1";
}

// Proper names from the scenario (e.g. "Kristoff", "Earl") so AO2 answers can be checked for context.
function scenarioNames(question) {
  const words = question.match(/\b[A-Z][a-z]{2,}\b/g) || [];
  const skip = new Set(["Discuss", "Evaluate", "Assess", "You", "The", "His", "Her", "She", "When", "After", "Both", "They", "Using", "Bowlby", "Atkinson", "Shiffrin", "Erikson", "Cognitive", "Behavioural", "Therapy", "In", "If", "He", "This", "Freud", "Milgram", "Psychology"]);
  return [...new Set(words.filter((w) => !skip.has(w)))];
}

export function runChecks(answer, question = "") {
  const paragraphs = splitParagraphs(answer);
  const words = answer.split(/\s+/).filter(Boolean).length;
  const roles = paragraphs.map(classify);
  const citations = [...new Set((answer.match(STUDY_CITATION) || []).map((c) => c.replace(/\s+/g, " ").trim()))];
  const reasoning = count(REASONING, answer);
  const evalCount = count(EVAL_WORDS, answer);
  const hasConclusion = roles.includes("Conclusion") || /\b(in conclusion|to conclude|overall,)/i.test(paragraphs.at(-1) || "");
  const type = questionType(question);
  const ao1Paras = roles.filter((r) => r === "AO1").length;
  const ao3Paras = roles.filter((r) => r === "AO3" || r === "AO1+AO3").length;

  const checks = [];
  checks.push({
    id: "length",
    label: "Length",
    status: words < 200 ? "warn" : words > 600 ? "warn" : "pass",
    detail:
      words < 200
        ? `${words} words. Most Level 3–4 answers written in about 10 minutes are 300–450 words. Develop your points further.`
        : words > 600
          ? `${words} words. That is long for 8 marks (about 10 minutes). Make sure every sentence earns marks.`
          : `${words} words. A good length for about 10 minutes of writing.`,
  });
  checks.push({
    id: "paragraphs",
    label: "Paragraphs",
    status: paragraphs.length >= 4 ? "pass" : "warn",
    detail:
      paragraphs.length >= 4
        ? `${paragraphs.length} paragraphs. Clear paragraphs help the examiner see your AO1, evaluation and conclusion.`
        : `${paragraphs.length} paragraph${paragraphs.length === 1 ? "" : "s"}. Aim for about 4–5: knowledge, 2–3 developed points, conclusion.`,
  });
  if (type !== "AO1/AO2") {
    checks.push({
      id: "balance",
      label: "AO1 / AO3 balance",
      status: ao3Paras === 0 ? "fail" : ao1Paras > ao3Paras + 1 ? "warn" : "pass",
      detail:
        ao3Paras === 0
          ? "No evaluation paragraphs found. Half the marks (AO3) come from evaluation."
          : ao1Paras > ao3Paras + 1
            ? "More description than evaluation. The marks are AO1 4 / AO3 4, so give them equal space."
            : "Description and evaluation look roughly balanced.",
    });
  } else {
    const names = scenarioNames(question);
    const used = names.filter((n) => new RegExp(`\\b${n}\\b`).test(answer));
    checks.push({
      id: "context",
      label: "Use of the context (AO2)",
      status: names.length === 0 ? "warn" : used.length === 0 ? "fail" : "pass",
      detail:
        names.length === 0
          ? "Paste the full question with its scenario so the context can be checked."
          : used.length === 0
            ? `You never mention ${names.slice(0, 3).join(", ")}. Every AO1 point should be applied to the scenario.`
            : `You refer to ${used.join(", ")} from the scenario. Apply the context in every paragraph.`,
    });
  }
  checks.push({
    id: "reasoning",
    label: "Chains of reasoning",
    status: reasoning >= 4 ? "pass" : reasoning >= 2 ? "warn" : "fail",
    detail:
      reasoning >= 4
        ? `${reasoning} reasoning links (e.g. "this means", "therefore"). Good for Level 3–4 chains of reasoning.`
        : `${reasoning} reasoning link${reasoning === 1 ? "" : "s"}. Extend each point with "this means that...", "therefore..." to build a chain.`,
  });
  checks.push({
    id: "evidence",
    label: "Named research",
    status: citations.length >= 2 ? "pass" : citations.length === 1 ? "warn" : "fail",
    detail:
      citations.length
        ? `Found ${citations.slice(0, 5).join("; ")}. ${citations.length >= 2 ? "" : "Use at least two named, dated studies."}`.trim()
        : "No named, dated studies, e.g. Milgram (1963). Evidence makes AO1 accurate and AO3 convincing.",
  });
  checks.push({
    id: "evaluation",
    label: "Evaluation language",
    status: type === "AO1/AO2" ? (evalCount ? "pass" : "warn") : evalCount >= 4 ? "pass" : evalCount >= 2 ? "warn" : "fail",
    detail: `${evalCount} evaluation term${evalCount === 1 ? "" : "s"} (strength, weakness, however, validity...). ${evalCount >= 4 ? "Good range." : "Use clear evaluation signposts."}`,
  });
  checks.push({
    id: "conclusion",
    label: "Conclusion",
    status: hasConclusion ? "pass" : "fail",
    detail: hasConclusion
      ? "You finish with a conclusion. Make sure it is a balanced judgement, not a summary."
      : 'No conclusion found. Finish with "Overall, ..." and a judgement that answers the question.',
  });

  return { words, paragraphs, roles, citations, type, checks };
}
