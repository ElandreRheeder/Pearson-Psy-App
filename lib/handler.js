// Shared request handling for the local server and the Vercel function.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getFeedback, InputError, ScopeError } from "./feedback.js";
import { UNITS, PAST_QUESTIONS, LEVELS } from "./knowledge.js";

const here = dirname(fileURLToPath(import.meta.url));
const DEMO = process.env.DEMO_MODE === "1";

export function catalogue() {
  return {
    units: UNITS.map((u) => ({ code: u.code, name: u.name, topics: u.topics.map((t) => t.name) })),
    pastQuestions: PAST_QUESTIONS.map((q) => ({
      id: q.id,
      unit: q.unit,
      session: q.session,
      q: q.q,
      ao_split: q.ao_split,
      question: q.question,
    })),
    levels: LEVELS,
    demo: DEMO,
  };
}

export async function feedbackResponse(body) {
  if (!body || typeof body !== "object") return [400, { error: "Send JSON with an answer." }];
  try {
    if (DEMO) {
      const sample = JSON.parse(readFileSync(join(here, "sample-feedback.json"), "utf8"));
      return [200, { feedback: sample, demo: true }];
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return [503, { error: "The feedback service is not set up yet: ANTHROPIC_API_KEY is missing on the server." }];
    }
    const result = await getFeedback(body);
    return [200, { feedback: result.feedback }];
  } catch (err) {
    if (err instanceof ScopeError) return [200, { feedback: outOfScope(err.message) }];
    if (err instanceof InputError) return [400, { error: err.message }];
    console.error(err);
    const status = err?.status === 429 ? 429 : 502;
    return [status, { error: status === 429 ? "Lots of students are using the coach right now. Wait a minute and try again." : "Something went wrong while marking. Please try again." }];
  }
}

function outOfScope(message) {
  return { in_scope: false, scope_message: message };
}
