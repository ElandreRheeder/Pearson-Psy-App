import { runChecks, separateQuestion, questionType } from "./checks.js";

const $ = (id) => document.getElementById(id);
const els = {
  unit: $("unit"), past: $("past"), question: $("question"), answer: $("answer"), file: $("file"),
  dropzone: $("dropzone"), fileStatus: $("file-status"), wordcount: $("wordcount"), markBtn: $("mark-btn"),
  sampleBtn: $("sample-btn"), checks: $("checks"), instantEmpty: $("instant-empty"), loading: $("loading"),
  error: $("error"), report: $("report"), levelsBody: $("levels-body"), qtypeHint: $("qtype-hint"),
};

let catalogue = { units: [], pastQuestions: [], levels: {} };
const DRAFT_KEY = "eight-mark-coach-draft";

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/* ---------- Catalogue: papers, past questions, level descriptors ---------- */

async function loadCatalogue() {
  try {
    const res = await fetch("api/catalogue");
    catalogue = await res.json();
  } catch {
    return;
  }
  for (const u of catalogue.units) els.unit.add(new Option(`${u.code} — ${u.name.replace(/^Unit \d: /, "")}`, u.code));
  fillPastQuestions();
  els.levelsBody.innerHTML = Object.entries(catalogue.levels || {})
    .map(
      ([split, v]) => `<div class="level-table"><h4>${esc(split)} questions</h4><p class="hint">${esc(v.note)}</p>` +
        v.levels.filter((l) => l.level > 0).reverse().map((l) => `<div class="level-row"><b>L${l.level} ${esc(l.marks)}</b><span>${esc(l.text)}</span></div>`).join("") +
        `</div>`
    )
    .join("");
  restoreDraft();
}

function fillPastQuestions() {
  const unit = els.unit.value;
  els.past.length = 1;
  for (const q of catalogue.pastQuestions.filter((q) => !unit || q.unit === unit)) {
    const short = q.question.length > 70 ? q.question.slice(0, 68) + "…" : q.question;
    els.past.add(new Option(`${q.unit} ${q.session} Q${q.q}: ${short}`, q.id));
  }
}

els.unit.addEventListener("change", () => { fillPastQuestions(); saveDraft(); });
els.past.addEventListener("change", () => {
  const q = catalogue.pastQuestions.find((x) => x.id === els.past.value);
  if (q) {
    els.question.value = q.question;
    if (!els.unit.value) els.unit.value = q.unit;
  }
  update();
});

/* ---------- Reading uploaded files ---------- */

async function readFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt")) return file.text();
  if (name.endsWith(".docx")) {
    if (!window.mammoth) throw new Error("The Word reader did not load. Check your internet connection and refresh.");
    const { value } = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return value;
  }
  if (name.endsWith(".pdf")) {
    if (!window.pdfjsLib) throw new Error("The PDF reader did not load. Check your internet connection and refresh.");
    const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const content = await (await pdf.getPage(i)).getTextContent();
      let lastY = null, text = "";
      for (const item of content.items) {
        const y = item.transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 1) text += Math.abs(y - lastY) > 18 ? "\n\n" : "\n";
        text += item.str;
        lastY = y;
      }
      pages.push(text);
    }
    const out = pages.join("\n\n");
    if (out.replace(/\s/g, "").length < 40) throw new Error("This PDF has no readable text (it may be a scan or photo). Type or paste your answer instead.");
    return out;
  }
  if (name.endsWith(".doc")) throw new Error("Old .doc files can't be read. In Word, choose File → Save As → .docx, then upload again.");
  throw new Error("Upload a .docx, .pdf or .txt file.");
}

async function handleFile(file) {
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) return setFileStatus("That file is over 10 MB. Upload just your answer.", true);
  setFileStatus(`Reading ${file.name}…`);
  try {
    const raw = await readFile(file);
    const { question, answer } = separateQuestion(raw);
    els.answer.value = answer;
    if (question && !els.question.value.trim()) els.question.value = question;
    setFileStatus(`Loaded ${file.name}${question ? " (question found at the top)" : ""}. Check the text below before asking for feedback.`);
    update();
  } catch (err) {
    setFileStatus(err.message, true);
  }
}

function setFileStatus(msg, bad = false) {
  els.fileStatus.textContent = msg;
  els.fileStatus.classList.toggle("bad", bad);
}

els.file.addEventListener("change", () => handleFile(els.file.files[0]));
for (const ev of ["dragenter", "dragover"]) els.dropzone.addEventListener(ev, (e) => { e.preventDefault(); els.dropzone.classList.add("drag"); });
for (const ev of ["dragleave", "drop"]) els.dropzone.addEventListener(ev, (e) => { e.preventDefault(); els.dropzone.classList.remove("drag"); });
els.dropzone.addEventListener("drop", (e) => handleFile(e.dataTransfer.files[0]));

/* ---------- Instant checks ---------- */

const SYMBOL = { pass: "✓", warn: "!", fail: "✗" };

function update() {
  const answer = els.answer.value;
  const words = answer.split(/\s+/).filter(Boolean).length;
  els.wordcount.textContent = `${words} word${words === 1 ? "" : "s"}`;
  const type = questionType(els.question.value);
  els.qtypeHint.textContent =
    type === "AO1/AO3" ? "AO1 4 / AO3 4: describe accurately, then evaluate with chains of reasoning and a balanced conclusion."
    : type === "AO1/AO2" ? "AO1 4 / AO2 4: describe accurately and apply every point to the scenario in the question."
    : "Paste the full question, including any scenario. If your file starts with the question, it is filled in for you.";
  if (words < 15) {
    els.checks.innerHTML = "";
    els.instantEmpty.hidden = false;
  } else {
    const result = runChecks(answer, els.question.value);
    els.instantEmpty.hidden = true;
    els.checks.innerHTML = result.checks
      .map((c) => `<li class="check ${c.status}"><span class="mark" aria-label="${c.status}">${SYMBOL[c.status]}</span><div><b>${esc(c.label)}</b><span>${esc(c.detail)}</span></div></li>`)
      .join("");
  }
  saveDraft();
}

els.answer.addEventListener("input", update);
els.question.addEventListener("input", update);

function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ unit: els.unit.value, past: els.past.value, question: els.question.value, answer: els.answer.value }));
  } catch { /* storage unavailable */ }
}

function restoreDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (!d) return;
    els.unit.value = d.unit || "";
    fillPastQuestions();
    els.past.value = d.past || "";
    els.question.value = d.question || "";
    els.answer.value = d.answer || "";
  } catch { /* storage unavailable */ }
  update();
}

els.sampleBtn.addEventListener("click", async () => {
  const text = await (await fetch("sample-answer.txt")).text();
  const { question, answer } = separateQuestion(text);
  els.unit.value = "WPS01";
  fillPastQuestions();
  els.past.value = "WPS01-June-2024-Q9";
  els.question.value = question;
  els.answer.value = answer;
  setFileStatus("Loaded a sample answer to show how the coach works.");
  update();
});

/* ---------- Examiner feedback ---------- */

els.markBtn.addEventListener("click", async () => {
  const answer = els.answer.value.trim();
  if (answer.split(/\s+/).length < 30) return showError("Add your full answer first (at least a few sentences).");
  if (!els.unit.value) return showError("Choose which paper the question is from.");
  showError("");
  els.report.hidden = true;
  els.loading.hidden = false;
  els.markBtn.disabled = true;
  els.loading.scrollIntoView({ behavior: "smooth", block: "nearest" });
  try {
    const res = await fetch("api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: els.question.value, answer, unit: els.unit.value, pastQuestionId: els.past.value }),
    });
    const data = await res.json().catch(() => ({ error: "The server sent an unexpected reply. Try again." }));
    if (!res.ok) throw new Error(data.error || "Something went wrong. Try again.");
    renderReport(data.feedback, data.demo);
  } catch (err) {
    showError(err.message === "Failed to fetch" ? "Could not reach the feedback server. Check your connection and try again." : err.message);
  } finally {
    els.loading.hidden = true;
    els.markBtn.disabled = false;
  }
});

function showError(msg) {
  els.error.textContent = msg;
  els.error.hidden = !msg;
}

const tagClass = (role) =>
  role === "AO1" ? "AO1" : role === "AO3" || role === "AO2" ? role : role.includes("+") ? "mixed" : role === "Not creditworthy" ? "none" : role;
const bar = (n, cls) => `<div class="bar">${[1, 2, 3, 4].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</div>`;
const items = (arr, cls = "list") => (arr?.length ? `<ul class="${cls}">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "");

function renderReport(f, demo) {
  if (!f.in_scope) {
    els.report.innerHTML = `<div class="out-of-scope"><h3>Not a Pearson IAL Psychology answer</h3><p>${esc(f.scope_message)}</p><p>This coach only marks Pearson Edexcel International A Level Psychology (WPS01–WPS04) 8-mark questions.</p></div>`;
    els.report.hidden = false;
    return;
  }
  const second = f.second_ao_label || "AO3";
  const mark = f.estimated_mark ?? 0;
  els.report.innerHTML = `
    ${demo ? `<p class="demo-flag">Demo mode: this is example feedback for the sample answer, not a live marking of your text.</p>` : ""}
    <div class="scoreboard">
      <div class="score"><span class="big">${mark}</span><span class="out">/8</span><br><span class="lvl">Level ${f.estimated_level}</span></div>
      <div class="score-meta">
        <p class="qline"><b>${esc(f.question_type)}</b> · ${esc(f.unit)}</p>
        <p class="qline">${esc(f.question_detected)}</p>
        <div class="band" aria-label="${mark} out of 8">${Array.from({ length: 8 }, (_, i) => `<i class="${i < mark ? "on" : ""}"></i>`).join("")}</div>
        <div class="band-labels"><span>L1</span><span>L2</span><span>L3</span><span>L4</span></div>
        <div class="ao-split">
          <div class="ao k">Knowledge AO1 <b>${f.ao1_estimate}/4</b>${bar(f.ao1_estimate)}</div>
          <div class="ao e">${second === "AO2" ? "Application AO2" : "Evaluation AO3"} <b>${f.second_ao_estimate}/4</b>${bar(f.second_ao_estimate)}</div>
        </div>
        <p class="estimate-note">Estimated mark. Pearson marks the whole answer by best fit to a level, so treat the AO split as a guide.</p>
      </div>
    </div>

    <p class="headline">${esc(f.headline)}</p>

    ${f.what_went_well?.length ? `<section><h3>What went well</h3>${items(f.what_went_well, "list good")}</section>` : ""}

    <section>
      <h3>Structure</h3>
      <p>${esc(f.structure?.verdict)}</p>
      <ol class="para-map">${(f.structure?.paragraphs || [])
        .map((p) => `<li class="para"><span class="num">¶${p.number}</span><div><span class="tag ${tagClass(p.role)}">${esc(p.role)}</span><span class="opening">“${esc(p.opening_words)}…”</span><p>${esc(p.comment)}</p></div></li>`)
        .join("")}</ol>
      ${f.structure?.suggested_plan?.length ? `<p class="sub"><b>A stronger plan for this question</b></p><ol class="plan">${f.structure.suggested_plan.map((s) => `<li><span>${esc(s)}</span></li>`).join("")}</ol>` : ""}
    </section>

    <section class="cols">
      <div class="box k">
        <h4>AO1 Knowledge and understanding</h4>
        <p>${esc(f.ao1?.comment)}</p>
        ${f.ao1?.missing?.length ? `<p class="sub">Missing</p>${items(f.ao1.missing)}` : ""}
        ${f.ao1?.improvements?.length ? `<p class="sub">How to improve</p>${items(f.ao1.improvements)}` : ""}
      </div>
      <div class="box e">
        <h4>${second === "AO2" ? "AO2 Application to the context" : "AO3 Evaluation"}</h4>
        <p>${esc(f.second_ao?.comment)}</p>
        <p class="sub">Chains of reasoning</p><p>${esc(f.second_ao?.chains_of_reasoning)}</p>
        <p class="sub">Competing arguments</p><p>${esc(f.second_ao?.competing_arguments)}</p>
        ${f.second_ao?.missing?.length ? `<p class="sub">Missing</p>${items(f.second_ao.missing)}` : ""}
        ${f.second_ao?.improvements?.length ? `<p class="sub">How to improve</p>${items(f.second_ao.improvements)}` : ""}
      </div>
    </section>

    <section>
      <h3>Conclusion</h3>
      <div class="conclusion-box">
        <p>${esc(f.conclusion?.comment)}</p>
        ${f.conclusion?.improvement ? `<p class="example">${esc(f.conclusion.improvement)}</p>` : ""}
      </div>
    </section>

    ${f.fact_checks?.length ? `<section><h3>Fact check</h3><ul class="facts">${f.fact_checks
      .map((c) => `<li class="fact ${esc(c.verdict)}"><span class="verdict">${esc(c.verdict)}</span><div><p class="claim">“${esc(c.claim)}”</p><p class="why">${esc(c.explanation)}</p></div></li>`)
      .join("")}</ul></section>` : ""}

    ${f.top_tips?.length ? `<section><h3>Tips to gain more marks</h3><ul class="tips">${f.top_tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>` : ""}

    ${f.model_paragraph?.improved ? `<section class="rewrite"><h3>One paragraph, improved</h3><p class="before">${esc(f.model_paragraph.original_summary)}</p><p class="after">${esc(f.model_paragraph.improved)}</p></section>` : ""}

    ${f.next_steps?.length ? `<section><h3>Redraft checklist</h3><ul class="todo">${f.next_steps
      .map((s, i) => `<li><label for="todo-${i}"><input type="checkbox" id="todo-${i}"><span>${esc(s)}</span></label></li>`)
      .join("")}</ul></section>` : ""}

    <div class="report-actions">
      <button type="button" class="secondary" id="copy-btn">Copy feedback</button>
      <button type="button" class="secondary" id="redraft-btn">Redraft my answer</button>
    </div>`;
  els.report.hidden = false;
  els.report.scrollIntoView({ behavior: "smooth", block: "start" });
  $("copy-btn").addEventListener("click", () => copyFeedback(f));
  $("redraft-btn").addEventListener("click", () => { els.answer.focus(); els.answer.scrollIntoView({ behavior: "smooth", block: "center" }); });
}

function feedbackText(f) {
  const lines = [
    `8-Mark Coach feedback — ${f.question_detected}`,
    `Estimated mark: ${f.estimated_mark}/8 (Level ${f.estimated_level}); AO1 ${f.ao1_estimate}/4, ${f.second_ao_label} ${f.second_ao_estimate}/4`,
    "", f.headline, "",
    "Structure: " + (f.structure?.verdict || ""),
    ...(f.structure?.suggested_plan || []).map((s, i) => `  ${i + 1}. ${s}`),
    "", "AO1: " + (f.ao1?.comment || ""), ...(f.ao1?.improvements || []).map((s) => `  - ${s}`),
    "", `${f.second_ao_label}: ` + (f.second_ao?.comment || ""), ...(f.second_ao?.improvements || []).map((s) => `  - ${s}`),
    "", "Conclusion: " + (f.conclusion?.comment || ""), f.conclusion?.improvement ? `  e.g. ${f.conclusion.improvement}` : "",
    "", "Fact check:", ...(f.fact_checks || []).map((c) => `  [${c.verdict}] ${c.claim} — ${c.explanation}`),
    "", "Tips:", ...(f.top_tips || []).map((t) => `  - ${t}`),
    "", "Redraft checklist:", ...(f.next_steps || []).map((t) => `  [ ] ${t}`),
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}

async function copyFeedback(f) {
  const btn = $("copy-btn");
  const text = feedbackText(f);
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = "Copied";
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand && document.execCommand("copy");
    ta.remove();
    btn.textContent = ok ? "Copied" : "Copy failed: select the text manually";
  }
  setTimeout(() => (btn.textContent = "Copy feedback"), 2500);
}

loadCatalogue().then(update);
