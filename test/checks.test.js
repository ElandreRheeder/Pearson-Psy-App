import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runChecks, separateQuestion, questionType } from "../public/checks.js";
import { detectOtherBoard } from "../lib/feedback.js";
import { PAST_QUESTIONS, specSummaryText } from "../lib/knowledge.js";

const sample = readFileSync(new URL("../public/sample-answer.txt", import.meta.url), "utf8");

test("separates the question from the answer in an uploaded file", () => {
  const { question, answer } = separateQuestion(sample);
  assert.match(question, /^Evaluate the multi-store model/);
  assert.match(answer, /^The multi-store model of memory was made/);
});

test("leaves text without a question untouched", () => {
  const text = "The multi-store model has three stores. ".repeat(10);
  assert.deepEqual(separateQuestion(text), { question: "", answer: text.trim() });
});

test("identifies AO splits from Pearson command words", () => {
  assert.equal(questionType("Evaluate the multi-store model of memory."), "AO1/AO3");
  assert.equal(questionType("Assess the role of hormones as an explanation of aggression."), "AO1/AO3");
  assert.equal(questionType("Discuss how CBT could help Vaughan. You must make reference to the context in your answer."), "AO1/AO2");
});

test("instant checks flag the sample's missing conclusion and weak reasoning", () => {
  const { answer, question } = separateQuestion(sample);
  const r = runChecks(answer, question);
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(byId.conclusion.status, "fail");
  assert.notEqual(byId.reasoning.status, "pass");
  assert.equal(r.paragraphs.length, 4);
  assert.ok(r.citations.some((c) => c.includes("Miller")));
});

test("AO2 questions check the scenario names are used", () => {
  const q = "Earl has a phobia of needles. Discuss systematic desensitisation as a treatment for Earl's phobia. You must make reference to the context in your answer.";
  const without = runChecks("Systematic desensitisation uses a hierarchy of fear and relaxation. ".repeat(6), q);
  const withName = runChecks("Earl would build a hierarchy of fear with needles on TV at the bottom. ".repeat(6), q);
  assert.equal(without.checks.find((c) => c.id === "context").status, "fail");
  assert.equal(withName.checks.find((c) => c.id === "context").status, "pass");
});

test("rejects other exam boards but not Bartlett's Cambridge participants", () => {
  assert.equal(detectOtherBoard("AQA Psychology Paper 1 (16 marks)"), "AQA");
  assert.equal(detectOtherBoard("Cambridge International AS Level Psychology 9990"), "Cambridge (CAIE)");
  assert.equal(detectOtherBoard("Bartlett (1932) asked Cambridge University students to recall War of the Ghosts."), null);
});

test("knowledge base has every past 8-marker with a question and indicative content", () => {
  assert.ok(PAST_QUESTIONS.length >= 40);
  for (const q of PAST_QUESTIONS) {
    assert.ok(q.question.length > 20, q.id);
    assert.ok(q.indicative.AO1?.length, `${q.id} AO1`);
    assert.ok((q.indicative.AO3 || q.indicative.AO2)?.length, `${q.id} AO2/AO3`);
  }
  assert.match(specSummaryText(), /WPS04/);
});
