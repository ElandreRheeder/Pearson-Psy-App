// Pearson Edexcel International A Level (IAL) Psychology knowledge base.
// Sources: Pearson IAL Psychology specification (Issue 6, Nov 2024, for teaching from Jan 2026),
// Pearson IAL mark schemes and examiner reports (WPS01–WPS03, 2021–2025),
// and the Pearson IAL Psychology Student Books 1 and 2 that the course follows.
// Nothing here comes from AQA, OCR or Cambridge (CAIE 9990) materials.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
export const PAST_QUESTIONS = JSON.parse(readFileSync(join(here, "past-questions.json"), "utf8"));

export const QUALIFICATION = "Pearson Edexcel International Advanced Level (IAL) Psychology (YPS01 / XPS01)";

// Where 8-mark questions appear on each paper (spec, Assessment information).
export const UNITS = [
  {
    code: "WPS01",
    name: "Unit 1: Social and cognitive psychology",
    eightMarkers: "Section A (social) and Section B (cognitive) each end with one 8-mark extended open-response question.",
    topics: [
      {
        id: "A",
        name: "Topic A: Social psychology",
        content: [
          "Theories of obedience: agency theory (Milgram), social power theory (French and Raven, 1959)",
          "Milgram (1963) and variations: rundown office block (Exp 10), telephonic instructions (Exp 7), ordinary man gives orders (Exp 13)",
          "Factors affecting obedience and dissent: personality, gender, situation, culture",
          "Types and explanations of conformity; Asch (1951) and variations (1952, 1956)",
          "Minority influence (Moscovici, 1976); factors affecting conformity and minority influence (personality, situation, culture)",
          "Research methods: questionnaires, interviews, sampling, thematic analysis, BPS Code of Ethics and Conduct (2009)",
          "Classic study: Moscovici et al. (1969). Contemporary: Burger (2009); plus Yi Huang et al. (2014) OR Haun et al. (2014)",
        ],
      },
      {
        id: "B",
        name: "Topic B: Cognitive psychology",
        content: [
          "Multi-store model (Atkinson and Shiffrin, 1968): encoding, storage, retrieval, capacity, duration",
          "Working memory model (Baddeley and Hitch, 1974): central executive, phonological loop, visuo-spatial sketchpad, episodic buffer",
          "Reconstructive memory (Bartlett, 1932) and schema theory",
          "Research methods: experiments, designs, variables, hypotheses, reliability and validity, Wilcoxon test",
          "Case studies of brain-damaged patients, including Henry Molaison (HM)",
          "Classic study: Bartlett (1932) War of the Ghosts. Contemporary: Schmolck et al. (2002); plus Darling et al. (2007) OR Sacchi et al. (2007)",
        ],
      },
    ],
  },
  {
    code: "WPS02",
    name: "Unit 2: Biological psychology, learning theories and development",
    eightMarkers: "Section A (biological) and Section B (learning theories) each contain one 8-mark extended open-response question.",
    topics: [
      {
        id: "C",
        name: "Topic C: Biological psychology",
        content: [
          "CNS, neurons, neurotransmitters and synaptic transmission",
          "Brain structure (prefrontal cortex, limbic system incl. amygdala) and brain functioning as an explanation of aggression",
          "Hormones (e.g. testosterone, cortisol) and genes (e.g. MAOA) in aggression",
          "Circadian sleep-wake cycle: internal pacemakers (SCN) and external zeitgebers",
          "Infradian rhythms: menstrual cycle, seasonal affective disorder and light therapy",
          "Research methods: correlations and Spearman's rank, brain scanning (CAT, PET, fMRI), twin studies",
          "Classic study: Raine et al. (1997). Contemporary: Brendgen et al. (2005); plus McDermott (2008) OR Hoefelmann et al. (2006)",
        ],
      },
      {
        id: "D",
        name: "Topic D: Learning theories and development",
        content: [
          "Classical conditioning (UCS, UCR, NS, CS, CR, extinction, spontaneous recovery, stimulus generalisation)",
          "Operant conditioning: positive/negative reinforcement and punishment, primary/secondary reinforcers, schedules; Skinner (1948)",
          "Social learning theory: observation, imitation, modelling, vicarious reinforcement, attention, retention, motivation, reproduction",
          "Psychodynamic approach: Freud's psychosexual stages OR object relations school",
          "Therapies: systematic desensitisation; psychoanalysis (free association, dream analysis, transference)",
          "Research methods: observations, content analysis, Freud's case studies, chi-squared, animal research and the Scientific Procedures Act (1986)",
          "Classic study: Watson and Rayner (1920). Contemporary: Capafóns et al. (1998); plus Prot (2014) OR Bastian et al. (2011)",
        ],
      },
    ],
  },
  {
    code: "WPS03",
    name: "Unit 3: Applications of psychology",
    eightMarkers:
      "Section A has two 8-mark questions: one on developmental psychology and one synoptic issues-and-debates question. Section B (criminological OR health) has two 8-mark questions.",
    topics: [
      {
        id: "E",
        name: "Topic E: Developmental psychology",
        content: [
          "Learning theory of attachment incl. O'Connor et al. (2013); Bowlby's theory, maternal deprivation hypothesis, 44 Juvenile Thieves (1944)",
          "Ainsworth: Strange Situation, attachment types, caregiver sensitivity; cross-cultural research",
          "Piaget's stages; Vygotsky's ZPD; stages of language development; Skinner, Chomsky (LAD), interactionist (Vygotsky)",
          "Erikson's psychosocial stages; Vygotsky's social development; mindfulness",
          "Research methods: clinical interviewing, ethnography (Punch, 2002), longitudinal/cross-sectional, cross-cultural, meta-analysis, UNCRC (1989)",
          "Classic study: van IJzendoorn and Kroonenberg (1988). Contemporary: Cassibba et al. (2013); plus Ashdown and Bernard (2012) OR Ding et al. (2014)",
          "Issues and debates (synoptic 8-marker): ethics, practical issues, reductionism vs holism, comparing explanations, psychology as a science, culture and gender, nature-nurture, development over time, social control, use of psychology in society, socially sensitive research",
        ],
      },
      {
        id: "F",
        name: "Topic F: Criminological psychology (option)",
        content: [
          "Self-fulfilling prophecy; social learning from the media; antisocial personality disorder (ASPD)",
          "Cognitive interview; psychological (case) formulation",
          "Eye-witness reliability: post-event information, weapons focus, 'other race' effect, stress and trauma",
          "Jury decision-making: defendant characteristics (attractiveness, race), pre-trial publicity, expert testimony (Penrod and Cutler, 1989)",
          "CBT for offenders and its effectiveness",
          "Classic study: Loftus and Palmer (1974). Contemporary: Bradbury and Williams (2013); plus Ruva et al. (2007) OR Valentine and Mesout (2009)",
        ],
      },
      {
        id: "G",
        name: "Topic G: Health psychology (option)",
        content: [
          "HPA axis, cortisol, brain regions (hippocampus, amygdala, prefrontal cortex), Selye's GAS",
          "Life events and daily hassles (Holmes and Rahe), Type A personality, social support",
          "Coping: appraisal-, problem- and emotion-focusing; positive and negative techniques",
          "Treatments for anxiety: SSRIs, SNRIs, CBT",
          "Classic study: Brady (1958). Contemporary: Nakonz and Shik (2009); plus Avdagic et al. (2014) OR Russell et al. (2015)",
        ],
      },
    ],
  },
  {
    code: "WPS04",
    name: "Unit 4: Clinical psychology and psychological skills",
    eightMarkers:
      "Section D is one 8-mark extended open-response question analysing a key question for society from any topic (except F and G).",
    topics: [
      {
        id: "H",
        name: "Topic H: Clinical psychology",
        content: [
          "Definitions of abnormality; DSM and ICD; reliability, validity and cultural issues in diagnosis",
          "Schizophrenia: symptoms, neurotransmitter explanation, one other biological explanation; drug and family therapy",
          "Unipolar depression OR anorexia nervosa: symptoms, one biological and one non-biological explanation; drug therapy and CBT",
          "Classic study: Rosenhan (1973). Contemporary: Suzuki et al. (2014); plus a study matching the chosen disorder",
        ],
      },
      {
        id: "I",
        name: "Topic I: Psychological skills (key questions)",
        content: [
          "Key questions for society using concepts, theories or research from Topics A–E and H",
          "Research methods, methodological issues and issues and debates from across the course",
        ],
      },
    ],
  },
];

// The generic level descriptors Pearson prints in IAL mark schemes for 8-mark questions.
export const LEVELS = {
  "AO1/AO3": {
    note: "AO1 (4 marks), AO3 (4 marks). Candidates must demonstrate an equal emphasis between knowledge and understanding vs evaluation/conclusion in their answer.",
    levels: [
      { level: 0, marks: "0", text: "No rewardable material." },
      { level: 1, marks: "1–2", text: "Demonstrates isolated elements of knowledge and understanding (AO1). A conclusion may be presented, but will be generic and the supporting evidence will be limited. Limited attempt to address the question (AO3)." },
      { level: 2, marks: "3–4", text: "Demonstrates mostly accurate knowledge and understanding (AO1). Candidates will produce statements with some development in the form of mostly accurate and relevant factual material, leading to a superficial conclusion being made (AO3)." },
      { level: 3, marks: "5–6", text: "Demonstrates accurate knowledge and understanding (AO1). Arguments developed using mostly coherent chains of reasoning leading to a conclusion being presented. Candidates will demonstrate a grasp of competing arguments but evaluation may be imbalanced (AO3)." },
      { level: 4, marks: "7–8", text: "Demonstrates accurate and thorough knowledge and understanding (AO1). Displays a well-developed and logical evaluation, containing logical chains of reasoning throughout. Demonstrates an awareness of competing arguments, presenting a balanced conclusion (AO3)." },
    ],
  },
  "AO1/AO2": {
    note: "AO1 (4 marks), AO2 (4 marks). Candidates must demonstrate an equal emphasis between knowledge and understanding vs application in their answer. These are 'Discuss ... You must make reference to the context in your answer' questions.",
    levels: [
      { level: 0, marks: "0", text: "No rewardable material." },
      { level: 1, marks: "1–2", text: "Demonstrates isolated elements of knowledge and understanding (AO1). Provides little or no reference to relevant evidence from the context (AO2)." },
      { level: 2, marks: "3–4", text: "Demonstrates mostly accurate knowledge and understanding (AO1). Discussion is partially developed, but is imbalanced or superficial, occasionally supported through the application of relevant evidence from the context (AO2)." },
      { level: 3, marks: "5–6", text: "Demonstrates accurate knowledge and understanding (AO1). Arguments developed using mostly coherent chains of reasoning. Candidates demonstrate a grasp of competing arguments but discussion may be imbalanced or contain superficial material, supported by applying relevant evidence from the context (AO2)." },
      { level: 4, marks: "7–8", text: "Demonstrates accurate and thorough knowledge and understanding (AO1). Displays a well-developed and logical discussion, containing logical chains of reasoning throughout, supported by sustained application of relevant evidence from the context (AO2)." },
    ],
  },
};

// Pearson's command word taxonomy (spec Appendix 8) for the words used in 8-mark questions.
export const COMMAND_WORDS = {
  evaluate: "Review information, then bring it together to form a conclusion – drawing on evidence including strengths, weaknesses, alternative actions, relevant data or information. Come to a supported judgement of a subject's qualities and relation to its context.",
  assess: "Give careful consideration to all the factors or events that apply and identify which are the most important or relevant. Make a judgement on the importance of something, and come to a conclusion where needed.",
  discuss: "Explore the issue/situation/problem/argument that is being presented within the question, articulating different or contrasting viewpoints.",
  "to what extent": "Review information, then bring it together to form a judgement conclusion, following the provision of a balanced and reasoned argument.",
};

// Points Pearson examiner reports repeat about IAL 8-markers.
export const EXAMINER_ADVICE = [
  "In evaluate essays there is equal emphasis on AO1 and AO3, so make sure both are equal and both are developed (WPS01 June 2024 examiner report).",
  "To reach the higher levels, develop chains of reasoning in the evaluation; awareness of competing arguments helps you present a balanced conclusion.",
  "Description is often written more confidently than evaluation; evaluation that is 'mostly superficial' without logical chains of reasoning stays in the lower levels.",
  "Confusing similar theories (e.g. social impact theory vs social power theory) costs AO1 accuracy.",
  "Using an alternative theory as a competing explanation, research evidence (named, dated studies) and real-life application are all creditable AO3.",
  "Look carefully at the mark allocation to judge the depth needed: an 8-mark answer is about 10 minutes of writing.",
  "In 'Discuss ... make reference to the context' questions, every AO1 point should be applied to the named person/situation in the stem (AO2); generic answers stay in Level 1–2.",
  "Only one command word is used per question; Pearson does not use dual injunctions like 'describe and evaluate'.",
];

// Markers that suggest the question or answer comes from a different exam board.
export const OTHER_BOARD_PATTERNS = [
  { re: /\bAQA\b/i, board: "AQA" },
  { re: /\b7181\b|\b7182\b/, board: "AQA" },
  // Not a bare "Cambridge": Bartlett's (1932) participants were Cambridge students.
  { re: /\bCambridge (International|A[ -]?Level|AS[ -]?Level|Psychology)\b|\bCAIE\b/i, board: "Cambridge (CAIE)" },
  { re: /\b9990\b/, board: "Cambridge (CAIE 9990)" },
  { re: /\bOCR\b|\bH567\b/i, board: "OCR" },
  { re: /\bWJEC\b|\bEduqas\b/i, board: "WJEC/Eduqas" },
  { re: /\bIB Psychology\b|\bPaper 1 ERQ\b/i, board: "IB" },
];

export function unitByCode(code) {
  return UNITS.find((u) => u.code === code);
}

// Compact text version of the spec content for the model's system prompt.
export function specSummaryText() {
  return UNITS.map(
    (u) =>
      `${u.code} — ${u.name}\n8-mark questions: ${u.eightMarkers}\n` +
      u.topics.map((t) => `  ${t.name}\n` + t.content.map((c) => `    - ${c}`).join("\n")).join("\n")
  ).join("\n\n");
}

export function levelsText() {
  return Object.entries(LEVELS)
    .map(([k, v]) => `${k} 8-mark levels\n${v.note}\n` + v.levels.map((l) => `  Level ${l.level} (${l.marks}): ${l.text}`).join("\n"))
    .join("\n\n");
}

export function pastQuestionsText() {
  return PAST_QUESTIONS.map((q) => {
    const ind = Object.entries(q.indicative)
      .map(([ao, pts]) => `  ${ao}:\n` + pts.map((p) => `    - ${p}`).join("\n"))
      .join("\n");
    return `[${q.id}] (${q.ao_split}) ${q.question}\n${ind}`;
  }).join("\n\n");
}
