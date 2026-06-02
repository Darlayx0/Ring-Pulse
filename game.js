const TAU = Math.PI * 2;
const STORAGE_PREFIX = "lingkaran.standard";
const SEGMENT_BALANCE = {
  version: 2,
  spread: 0.58,
  minRatio: 0.62,
  maxRatio: 1.82,
};

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  title: document.querySelector("#gameTitle"),
  level: document.querySelector("#levelValue"),
  score: document.querySelector("#scoreValue"),
  highScore: document.querySelector("#highScoreValue"),
  lifeLabel: document.querySelector("#lifeLabel"),
  life: document.querySelector("#lifeValue"),
  combo: document.querySelector("#comboValue"),
  ring: document.querySelector("#ringValue"),
  ringMetricRow: document.querySelector("#ringMetricRow"),
  accuracy: document.querySelector("#accuracyValue"),
  perfectMetricLabel: document.querySelector("#perfectMetricLabel"),
  perfectMeter: document.querySelector("#perfectMeter"),
  progress: document.querySelector("#progressValue"),
  progressRunHeader: document.querySelector("#progressRunHeader"),
  progressRunMeter: document.querySelector("#progressRunMeter"),
  progressFill: document.querySelector("#progressFill"),
  highLevel: document.querySelector("#highLevelValue"),
  highLevelMeter: document.querySelector("#highLevelMeter"),
  highLevelFill: document.querySelector("#highLevelFill"),
  highPerfect: document.querySelector("#highPerfectValue"),
  perfectFill: document.querySelector("#perfectFill"),
  highPerfectMarker: document.querySelector("#highPerfectMarker"),
  cleared: document.querySelector("#clearedValue"),
  segmentStrip: document.querySelector("#segmentStrip"),
  grid: document.querySelector("#levelGrid"),
  notice: document.querySelector("#noticePanel"),
  noticeKicker: document.querySelector("#noticeKicker"),
  noticeTitle: document.querySelector("#noticeTitle"),
  noticeDetail: document.querySelector("#noticeDetail"),
  startButton: document.querySelector("#startButton"),
  pauseButton: document.querySelector("#pauseButton"),
  restartButton: document.querySelector("#restartButton"),
  sessionMode: document.querySelector("#sessionModeValue"),
  resetMode: document.querySelector("#resetModeValue"),
  resetDialog: document.querySelector("#resetDialog"),
  openResetButton: document.querySelector("#openResetButton"),
  closeResetButton: document.querySelector("#closeResetButton"),
  difficultyPanel: document.querySelector("#difficultyPanel"),
  runModeOptions: Array.from(document.querySelectorAll(".mode-option")),
  difficultyOptions: Array.from(document.querySelectorAll(".difficulty-option")),
  resetButtons: Array.from(document.querySelectorAll(".reset-button")),
  resetHighPerfectButton: document.querySelector("#resetHighPerfectButton"),
};

const segmentPalette = [
  "#ffcf4b",
  "#4b8dff",
  "#ff5b57",
  "#9b73ff",
  "#21c7d8",
  "#28e0a6",
];

const feedbackTiers = {
  hit: {
    label: "Safe",
    score: 80,
    color: "#28e0a6",
    tone: "hit",
  },
  good: {
    label: "Good",
    score: 160,
    color: "#4b8dff",
    tone: "good",
  },
  perfect: {
    label: "Perfect",
    score: 280,
    color: "#ffcf4b",
    tone: "perfect",
  },
};

const standardFinishScoring = {
  basePoints: 1000,
  perfectTiers: [
    { min: 100, points: 3200, label: "100% Perfect" },
    { min: 95, points: 2600, label: "95%+ Perfect" },
    { min: 90, points: 2100, label: "90%+ Perfect" },
    { min: 85, points: 1700, label: "85%+ Perfect" },
    { min: 80, points: 1300, label: "80%+ Perfect" },
    { min: 70, points: 900, label: "70%+ Perfect" },
    { min: 60, points: 550, label: "60%+ Perfect" },
    { min: 0, points: 250, label: "<60% Perfect" },
  ],
  comboTiers: [
    { min: 90, points: 2200, label: "90%+ Max Combo" },
    { min: 75, points: 1700, label: "75%+ Max Combo" },
    { min: 60, points: 1250, label: "60%+ Max Combo" },
    { min: 45, points: 850, label: "45%+ Max Combo" },
    { min: 30, points: 500, label: "30%+ Max Combo" },
    { min: 0, points: 250, label: "<30% Max Combo" },
  ],
  noMissPoints: 1400,
  allRotationsHitPoints: 1000,
  ranks: [
    { rank: "S+", min: 8600 },
    { rank: "S", min: 7800 },
    { rank: "A+", min: 7000 },
    { rank: "A", min: 5900 },
    { rank: "B+", min: 4800 },
    { rank: "B", min: 3600 },
    { rank: "C", min: 2400 },
    { rank: "D", min: 0 },
  ],
};

const modeDefinitions = {
  easy: {
    id: "easy",
    label: "Mudah",
    lives: 5,
    extraLifeScoreStep: 25000,
    segmentCounts: [
      3, 4, 4, 5, 5,
      6, 6, 7, 7, 8,
      8, 9, 9, 10, 10,
      11, 12, 12, 13, 14,
    ],
    tuning: {
      speedBase: 0.62,
      speedStep: 0.038,
      speedCurve: 0.36,
      varianceBase: 0.14,
      varianceCurve: 0.72,
      minSpanStart: 18.5,
      minSpanDrop: 0.56,
      minSpanFloor: 5.8,
      longSlotsBase: 1,
      longSlotsMax: 4,
      shortSlotsBase: 1,
      shortSlotsMax: 5,
      shortSlotRatio: 0.28,
      longMultiplierBase: 1.95,
      longMultiplierCurve: 3.35,
      shortMultiplierStart: 0.38,
      shortMultiplierCurve: 0.2,
    },
  },
  normal: {
    id: "normal",
    label: "Normal",
    lives: 5,
    extraLifeScoreStep: 50000,
    segmentCounts: [
      4, 5, 6, 7, 7,
      8, 9, 10, 11, 12,
      12, 13, 14, 15, 16,
      17, 18, 18, 19, 20,
      21, 22, 23, 24, 25,
    ],
    tuning: {
      speedBase: 0.82,
      speedStep: 0.055,
      speedCurve: 0.72,
      varianceBase: 0.24,
      varianceCurve: 1.22,
      minSpanStart: 13.5,
      minSpanDrop: 0.46,
      minSpanFloor: 2.4,
      longSlotsBase: 1,
      longSlotsMax: 5,
      shortSlotsBase: 1,
      shortSlotsMax: 8,
      shortSlotRatio: 0.38,
      longMultiplierBase: 2.6,
      longMultiplierCurve: 6.2,
      shortMultiplierStart: 0.22,
      shortMultiplierCurve: 0.16,
    },
  },
  hard: {
    id: "hard",
    label: "Hard",
    lives: 5,
    extraLifeScoreStep: 100000,
    segmentCounts: [
      6, 7, 8, 9, 10,
      11, 12, 13, 14, 15,
      16, 17, 18, 19, 20,
      21, 22, 23, 24, 25,
      26, 27, 28, 29, 30,
      31, 32, 33, 34, 36,
    ],
    tuning: {
      speedBase: 1.02,
      speedStep: 0.066,
      speedCurve: 1.05,
      varianceBase: 0.46,
      varianceCurve: 1.62,
      minSpanStart: 10.2,
      minSpanDrop: 0.32,
      minSpanFloor: 1.4,
      longSlotsBase: 2,
      longSlotsMax: 7,
      shortSlotsBase: 2,
      shortSlotsMax: 12,
      shortSlotRatio: 0.46,
      longMultiplierBase: 3.3,
      longMultiplierCurve: 8.4,
      shortMultiplierStart: 0.16,
      shortMultiplierCurve: 0.125,
    },
  },
  extreme: {
    id: "extreme",
    label: "Ekstrim",
    lives: 3,
    extraLifeScoreStep: 100000,
    segmentCounts: [
      8, 9, 10, 11, 12,
      13, 14, 15, 16, 17,
      18, 19, 20, 21, 22,
      23, 24, 25, 26, 27,
      28, 30, 31, 32, 34,
      35, 37, 38, 40, 42,
    ],
    tuning: {
      speedBase: 1.18,
      speedStep: 0.078,
      speedCurve: 1.35,
      varianceBase: 0.54,
      varianceCurve: 1.75,
      minSpanStart: 8.4,
      minSpanDrop: 0.22,
      minSpanFloor: 1.1,
      longSlotsBase: 2,
      longSlotsMax: 8,
      shortSlotsBase: 3,
      shortSlotsMax: 14,
      shortSlotRatio: 0.5,
      longMultiplierBase: 3.5,
      longMultiplierCurve: 8.8,
      shortMultiplierStart: 0.14,
      shortMultiplierCurve: 0.1,
    },
  },
};

const endlessDefinition = {
  id: "endless",
  label: "Endless",
  lives: 5,
  extraLifeScoreStep: 50000,
};

const timeAttackDefinition = {
  id: "time-attack",
  label: "Time Attack",
  lives: 0,
  initialTime: 60,
  maxTime: 180,
  timeRewards: {
    perfect: 3,
    good: 2,
    hit: 1,
    miss: -10,
  },
  segmentCounts: Array.from({ length: 25 }, (_, index) => index + 4),
  tuning: {
    speedBase: 2.88,
    speedStep: 0,
    speedCurve: 0,
    varianceBase: 0.2,
    varianceCurve: 1.34,
    minSpanStart: 14,
    minSpanDrop: 0.38,
    minSpanFloor: 2.1,
    longSlotsBase: 1,
    longSlotsMax: 5,
    shortSlotsBase: 1,
    shortSlotsMax: 9,
    shortSlotRatio: 0.4,
    longMultiplierBase: 2.3,
    longMultiplierCurve: 5.7,
    shortMultiplierStart: 0.28,
    shortMultiplierCurve: 0.17,
  },
};

Object.values(modeDefinitions).forEach((mode) => {
  mode.levels = createLevels(mode);
  mode.signature = createModeSignature(mode);
});
timeAttackDefinition.levels = createLevels(timeAttackDefinition);
timeAttackDefinition.signature = createModeSignature(timeAttackDefinition);
endlessDefinition.signature = createEndlessSignature(endlessDefinition);

const state = {
  mode: "idle",
  runMode: "standard",
  difficulty: "normal",
  levelIndex: 0,
  angle: 0,
  segments: [],
  currentHits: 0,
  completedLevels: 0,
  score: 0,
  lives: 5,
  timeRemaining: 60,
  extraLifeMilestones: 0,
  combo: 0,
  maxCombo: 0,
  attempts: 0,
  misses: 0,
  hits: 0,
  perfectHits: 0,
  completedRotations: 0,
  emptyRotations: 0,
  currentRotationHit: false,
  finishResult: null,
  best: 0,
  highLevel: 0,
  highPerfectPercent: 0,
  highPerfectHits: 0,
  lastTime: 0,
  viewSize: 720,
  dpr: 1,
  flash: null,
  shake: 0,
  transitionTimer: 0,
  currentSegmentIndex: -1,
};

let audioContext = null;

function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

function normalizeAngle(value) {
  return ((value % TAU) + TAU) % TAU;
}

function angularDistance(a, b) {
  const distance = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(distance, TAU - distance);
}

function xFromAngle(center, angle, radius) {
  return center + Math.sin(angle) * radius;
}

function yFromAngle(center, angle, radius) {
  return center - Math.cos(angle) * radius;
}

function canvasAngle(angle) {
  return angle - Math.PI / 2;
}

function formatScore(value) {
  return value.toLocaleString("id-ID");
}

function formatProgressPercent(value) {
  if (value === 0) {
    return "0%";
  }

  if (value < 1) {
    return "<1%";
  }

  if (value < 10) {
    return `${value.toFixed(1)}%`;
  }

  return `${Math.round(value)}%`;
}

function formatDuration(value) {
  const totalSeconds = Math.max(0, Math.ceil(value));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  return `${seconds}s`;
}

function seededUnit(seed) {
  const value = Math.sin(seed * 91.73) * 10000;
  return value - Math.floor(value);
}

function createLevels(mode) {
  const lastIndex = mode.segmentCounts.length - 1;
  return mode.segmentCounts.map((segments, index) => {
    const number = index + 1;
    const difficulty = lastIndex === 0 ? 0 : index / lastIndex;
    const tuning = mode.tuning;

    return {
      number,
      segments,
      speed: tuning.speedBase + index * tuning.speedStep + difficulty ** 1.7 * tuning.speedCurve,
      variance: tuning.varianceBase + difficulty * tuning.varianceCurve,
      minSpan: degreesToRadians(Math.max(tuning.minSpanFloor, tuning.minSpanStart - index * tuning.minSpanDrop)),
      longSlots: Math.min(tuning.longSlotsMax, tuning.longSlotsBase + Math.floor(difficulty * tuning.longSlotsMax)),
      shortSlots: Math.min(
        Math.floor(segments * tuning.shortSlotRatio),
        tuning.shortSlotsBase + Math.floor(difficulty * tuning.shortSlotsMax)
      ),
      longMultiplier: tuning.longMultiplierBase + difficulty * tuning.longMultiplierCurve,
      shortMultiplier: Math.max(0.035, tuning.shortMultiplierStart - difficulty * tuning.shortMultiplierCurve),
    };
  });
}

function createEndlessLevel(index) {
  const progress = Math.min(1, index / 40);
  const extended = Math.min(1, index / 120);

  return {
    number: index + 1,
    segments: Math.min(36, 4 + Math.floor(index * 0.8)),
    speed: 0.72 + index * 0.035 + progress ** 1.6 * 0.9 + extended * 0.45,
    variance: 0.18 + progress * 1.35,
    minSpan: degreesToRadians(Math.max(1.8, 14 - index * 0.22)),
    longSlots: Math.min(6, 1 + Math.floor(progress * 5)),
    shortSlots: Math.min(12, 1 + Math.floor(progress * 10)),
    longMultiplier: 2.0 + progress * 5.5,
    shortMultiplier: Math.max(0.08, 0.35 - progress * 0.24),
  };
}

function stableLevelSignature(level) {
  return {
    n: level.number,
    s: level.segments,
    v: Number(level.speed.toFixed(4)),
    r: Number(level.variance.toFixed(4)),
    m: Number(level.minSpan.toFixed(4)),
    l: level.longSlots,
    h: level.shortSlots,
    lm: Number(level.longMultiplier.toFixed(4)),
    sm: Number(level.shortMultiplier.toFixed(4)),
  };
}

function hashText(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function createModeSignature(mode) {
  return hashText(JSON.stringify({
    id: mode.id,
    lives: mode.lives,
    initialTime: mode.initialTime,
    maxTime: mode.maxTime,
    extraLifeScoreStep: mode.extraLifeScoreStep,
    timeRewards: mode.timeRewards,
    segmentBalance: SEGMENT_BALANCE,
    standardFinishScoring,
    scoring: Object.fromEntries(
      Object.entries(feedbackTiers).map(([key, tier]) => [key, tier.score])
    ),
    levels: mode.levels.map(stableLevelSignature),
  }));
}

function createEndlessSignature(definition) {
  return hashText(JSON.stringify({
    id: definition.id,
    lives: definition.lives,
    extraLifeScoreStep: definition.extraLifeScoreStep,
    scoring: Object.fromEntries(
      Object.entries(feedbackTiers).map(([key, tier]) => [key, tier.score])
    ),
    progression: {
      version: 2,
      maxSegments: 36,
      primaryLevels: 40,
      extendedLevels: 120,
    },
    segmentBalance: SEGMENT_BALANCE,
  }));
}

function storageKey(definition, suffix) {
  if (definition.id === endlessDefinition.id) {
    return `${STORAGE_PREFIX}.endless.${suffix}`;
  }

  return `${STORAGE_PREFIX}.${definition.id}.${suffix}`;
}

function loadRecordsForMode(definition) {
  try {
    const signatureKey = storageKey(definition, "signature");
    const bestKey = storageKey(definition, "best");
    const highLevelKey = storageKey(definition, "highLevel");
    const highPerfectKey = storageKey(definition, "highPerfect");
    const highPerfectHitsKey = storageKey(definition, "highPerfectHits");
    if (localStorage.getItem(signatureKey) !== definition.signature) {
      localStorage.setItem(signatureKey, definition.signature);
      localStorage.removeItem(bestKey);
      localStorage.removeItem(highLevelKey);
      localStorage.removeItem(highPerfectKey);
      localStorage.removeItem(highPerfectHitsKey);
      return { best: 0, highLevel: 0, highPerfectPercent: 0, highPerfectHits: 0 };
    }
    const highLevelCap = definition.levels?.length ?? Number.POSITIVE_INFINITY;
    return {
      best: Number(localStorage.getItem(bestKey) || 0),
      highLevel: Math.min(highLevelCap, Number(localStorage.getItem(highLevelKey) || 0)),
      highPerfectPercent: Math.min(100, Number(localStorage.getItem(highPerfectKey) || 0)),
      highPerfectHits: Number(localStorage.getItem(highPerfectHitsKey) || 0),
    };
  } catch {
    return { best: 0, highLevel: 0, highPerfectPercent: 0, highPerfectHits: 0 };
  }
}

function saveRecordValuesForMode(definition, records) {
  try {
    localStorage.setItem(storageKey(definition, "signature"), definition.signature);
    localStorage.setItem(storageKey(definition, "best"), String(records.best));
    localStorage.setItem(storageKey(definition, "highLevel"), String(records.highLevel));
    localStorage.setItem(storageKey(definition, "highPerfect"), String(records.highPerfectPercent));
    localStorage.setItem(storageKey(definition, "highPerfectHits"), String(records.highPerfectHits || 0));
  } catch {
    // Records remain available for the current session even if storage is blocked.
  }
}

function saveRecordsForMode(definition) {
  saveRecordValuesForMode(definition, {
    best: state.best,
    highLevel: state.highLevel,
    highPerfectPercent: state.highPerfectPercent,
    highPerfectHits: state.highPerfectHits,
  });
}

function currentMode() {
  return modeDefinitions[state.difficulty];
}

function isTimeAttackRun() {
  return state.runMode === "time-attack";
}

function isEndlessRun() {
  return state.runMode === "endless";
}

function isStandardRun() {
  return state.runMode === "standard";
}

function currentRunDefinition() {
  if (isEndlessRun()) {
    return endlessDefinition;
  }

  if (isTimeAttackRun()) {
    return timeAttackDefinition;
  }

  return currentMode();
}

function currentRunLabel() {
  return currentRunDefinition().label;
}

function startNoticeKicker() {
  if (isEndlessRun()) {
    return endlessDefinition.label;
  }

  if (isTimeAttackRun()) {
    return `${timeAttackDefinition.label} - ${timeAttackDefinition.levels.length} Level`;
  }

  return `${currentMode().label} - ${currentMode().levels.length} Level`;
}

function awardScoreLives() {
  const step = currentRunDefinition().extraLifeScoreStep;
  if (!step) {
    return;
  }

  const earnedMilestones = Math.floor(state.score / step);
  if (earnedMilestones > state.extraLifeMilestones) {
    state.lives += earnedMilestones - state.extraLifeMilestones;
    state.extraLifeMilestones = earnedMilestones;
  }
}

function addScore(points) {
  state.score += points;
  awardScoreLives();
}

function adjustTime(seconds) {
  if (!isTimeAttackRun()) {
    return;
  }

  const maxTime = currentRunDefinition().maxTime ?? Number.POSITIVE_INFINITY;
  state.timeRemaining = Math.max(0, Math.min(maxTime, state.timeRemaining + seconds));
}

function timeRewardForFeedback(feedback) {
  if (!isTimeAttackRun()) {
    return 0;
  }

  if (feedback === feedbackTiers.perfect) {
    return timeAttackDefinition.timeRewards.perfect;
  }

  if (feedback === feedbackTiers.good) {
    return timeAttackDefinition.timeRewards.good;
  }

  return timeAttackDefinition.timeRewards.hit;
}

function currentLevel() {
  if (isEndlessRun()) {
    return createEndlessLevel(state.levelIndex);
  }

  const levels = currentRunDefinition().levels;
  return levels[state.levelIndex] || levels[levels.length - 1];
}

function clearedSegments() {
  return state.segments.filter((segment) => segment.cleared).length;
}

function remainingSegments() {
  return state.segments.length - clearedSegments();
}

function totalRingsForMode(mode = currentMode()) {
  return mode.levels.reduce((sum, level) => sum + level.segments, 0);
}

function hitRingsForMode(mode = currentMode()) {
  const completedRings = mode.levels
    .slice(0, state.completedLevels)
    .reduce((sum, level) => sum + level.segments, 0);

  if (state.completedLevels > state.levelIndex) {
    return completedRings;
  }

  return completedRings + clearedSegments();
}

function totalRingsForRun() {
  return isEndlessRun() ? currentLevel().segments : totalRingsForMode(currentRunDefinition());
}

function hitRingsForRun() {
  return isEndlessRun() ? clearedSegments() : hitRingsForMode(currentRunDefinition());
}

function currentPerfectPercent() {
  return state.hits === 0 ? 0 : Math.round((state.perfectHits / state.hits) * 100);
}

function findScoringTier(tiers, value) {
  return tiers.find((tier) => value >= tier.min) || tiers[tiers.length - 1];
}

function calculateStandardFinishResult() {
  const totalSegments = totalRingsForRun();
  const perfectPercent = currentPerfectPercent();
  const comboPercent = totalSegments === 0 ? 0 : Math.round((state.maxCombo / totalSegments) * 100);
  const perfectTier = findScoringTier(standardFinishScoring.perfectTiers, perfectPercent);
  const comboTier = findScoringTier(standardFinishScoring.comboTiers, comboPercent);
  const noMiss = state.misses === 0;
  const allRotationsHit = state.emptyRotations === 0;
  const points = standardFinishScoring.basePoints
    + perfectTier.points
    + comboTier.points
    + (noMiss ? standardFinishScoring.noMissPoints : 0)
    + (allRotationsHit ? standardFinishScoring.allRotationsHitPoints : 0);
  const rankTier = findScoringTier(standardFinishScoring.ranks, points);

  return {
    rank: rankTier.rank,
    points,
    perfectPercent,
    maxCombo: state.maxCombo,
    comboPercent,
    noMiss,
    allRotationsHit,
    completedRotations: state.completedRotations,
    emptyRotations: state.emptyRotations,
    perfectTier,
    comboTier,
  };
}

function formatFinishDetail(result) {
  const cleanText = result.noMiss ? "Tanpa miss" : `${state.misses} miss`;
  const tempoText = result.allRotationsHit ? "Tempo penuh" : `${result.emptyRotations} putaran kosong`;
  return `Rank ${result.rank} - Bonus +${formatScore(result.points)} - Perfect ${result.perfectPercent}% - Kombo ${result.comboPercent}% - ${cleanText} - ${tempoText}`;
}

function trackCompletedRotation(previousAngle, nextAngle) {
  if (nextAngle >= previousAngle) {
    return;
  }

  state.completedRotations += 1;
  if (!state.currentRotationHit) {
    state.emptyRotations += 1;
  }
  state.currentRotationHit = false;
}

function setupLevelGrid() {
  ui.grid.innerHTML = "";
  const dotCount = isEndlessRun() ? 12 : currentRunDefinition().levels.length;
  Array.from({ length: dotCount }, (_, index) => index).forEach((index) => {
    const dot = document.createElement("div");
    dot.className = "level-dot";
    dot.textContent = "";
    dot.title = `Level ${index + 1}`;
    dot.setAttribute("aria-label", `Level ${index + 1}`);
    ui.grid.appendChild(dot);
  });
}

function syncCanvasSize() {
  const rect = canvas.getBoundingClientRect();
  const size = Math.max(280, Math.round(Math.min(rect.width, rect.height || rect.width)));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  if (canvas.width !== Math.round(size * dpr) || canvas.height !== Math.round(size * dpr)) {
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
  }

  state.viewSize = size;
  state.dpr = dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function showNotice(kicker, title, actionText, detail = "") {
  ui.noticeKicker.textContent = kicker;
  ui.noticeTitle.textContent = title;
  ui.noticeDetail.textContent = detail;
  ui.noticeDetail.hidden = detail.length === 0;
  const buttonLabel = ui.startButton.querySelector("span");
  if (buttonLabel) {
    buttonLabel.textContent = actionText;
  } else {
    ui.startButton.textContent = actionText;
  }
  ui.notice.classList.remove("is-hidden");
}

function hideNotice() {
  ui.notice.classList.add("is-hidden");
}

function balanceSegmentWeights(weights) {
  const average = weights.reduce((sum, value) => sum + value, 0) / weights.length;

  return weights.map((weight) => {
    const normalized = 1 + ((weight / average) - 1) * SEGMENT_BALANCE.spread;
    const clamped = Math.max(SEGMENT_BALANCE.minRatio, Math.min(SEGMENT_BALANCE.maxRatio, normalized));
    return clamped;
  });
}

function generateSegments(level) {
  const count = level.segments;
  const rankedSegments = Array.from({ length: count }, (_, index) => ({
    index,
    score: seededUnit(level.number * 101 + index * 29),
  })).sort((a, b) => a.score - b.score);
  const longIndices = new Set(rankedSegments.slice(0, level.longSlots).map((item) => item.index));
  const shortIndices = new Set(
    rankedSegments
      .slice(level.longSlots, level.longSlots + level.shortSlots)
      .map((item) => item.index)
  );
  const rawWeights = Array.from({ length: count }, (_, index) => {
    const wave = Math.sin((index + 1) * (level.number * 0.72)) * 0.5 + 0.5;
    const jitter = seededUnit(level.number * 37 + index * 11);
    let weight = 1 + (wave - 0.5) * level.variance + (jitter - 0.5) * level.variance * 0.85;

    if (longIndices.has(index)) {
      weight *= level.longMultiplier;
    }

    if (shortIndices.has(index)) {
      weight *= level.shortMultiplier;
    }

    return Math.max(0.025, weight);
  });

  const balancedWeights = balanceSegmentWeights(rawWeights);
  const totalWeight = balancedWeights.reduce((sum, value) => sum + value, 0);
  const guaranteedSpan = Math.min(TAU * 0.5, level.minSpan * count);
  const baseSpan = guaranteedSpan / count;
  const flexibleSpan = TAU - guaranteedSpan;
  const spans = balancedWeights.map((weight) => baseSpan + (weight / totalWeight) * flexibleSpan);
  const spanTotal = spans.reduce((sum, span) => sum + span, 0);
  spans[spans.length - 1] += TAU - spanTotal;
  let cursor = 0;

  return spans.map((span, index) => {
    const segment = {
      index,
      start: cursor,
      end: index === count - 1 ? TAU : cursor + span,
      span,
      cleared: false,
      color: segmentPalette[(index + level.number) % segmentPalette.length],
    };
    cursor = segment.end;
    return segment;
  });
}

function loadLevel(index) {
  state.levelIndex = index;
  state.segments = generateSegments(currentLevel());
  state.currentHits = 0;
  state.currentRotationHit = false;
  state.angle = normalizeAngle(degreesToRadians(11 + index * 13));
  state.flash = null;
  state.shake = 0;
  state.currentSegmentIndex = -1;
  renderSegmentStrip();
  updateUI();
}

function startGame() {
  clearTimeout(state.transitionTimer);
  state.mode = "playing";
  state.levelIndex = 0;
  state.completedLevels = 0;
  state.score = 0;
  state.lives = currentRunDefinition().lives;
  state.timeRemaining = currentRunDefinition().initialTime ?? 0;
  state.extraLifeMilestones = 0;
  state.combo = 0;
  state.maxCombo = 0;
  state.attempts = 0;
  state.misses = 0;
  state.hits = 0;
  state.perfectHits = 0;
  state.completedRotations = 0;
  state.emptyRotations = 0;
  state.currentRotationHit = false;
  state.finishResult = null;
  loadLevel(0);
  hideNotice();
  playTone("start");
}

function advanceLevel() {
  clearTimeout(state.transitionTimer);
  if (state.mode !== "level-clear") {
    return;
  }

  state.mode = "playing";
  loadLevel(state.levelIndex + 1);
  hideNotice();
}

function completeLevel() {
  const level = currentLevel();
  const runDefinition = currentRunDefinition();
  const resourceBonus = isTimeAttackRun() ? Math.ceil(state.timeRemaining) : state.lives;
  state.completedLevels = Math.max(state.completedLevels, state.levelIndex + 1);
  addScore(240 + level.segments * 22 + state.levelIndex * 25 + resourceBonus * 18);

  const clearedAll = !isEndlessRun() && state.levelIndex === runDefinition.levels.length - 1;

  if (clearedAll) {
    completeGame();
    return;
  }

  state.mode = "level-clear";
  updateRecords();
  updateUI();
  showNotice(`Level ${state.levelIndex + 1}`, "Selesai", "Lanjut");
  playTone("level");

  state.transitionTimer = window.setTimeout(() => {
    advanceLevel();
  }, 900);
}

function completeGame() {
  const runDefinition = currentRunDefinition();
  const resourceBonus = isTimeAttackRun() ? Math.ceil(state.timeRemaining) : state.lives;
  const finishResult = isStandardRun() ? calculateStandardFinishResult() : null;
  state.mode = "complete";
  state.completedLevels = runDefinition.levels.length;
  addScore(resourceBonus * 280 + state.combo * 36);
  if (finishResult) {
    addScore(finishResult.points);
  }
  state.finishResult = finishResult;
  updateRecords();
  updateUI();
  showNotice(
    "Ring Pulse",
    finishResult ? `Tuntas ${finishResult.rank}` : "Tuntas",
    "Main Lagi",
    finishResult ? formatFinishDetail(finishResult) : ""
  );
  playTone("complete");
}

function gameOver() {
  state.mode = "game-over";
  state.combo = 0;
  state.shake = 0;
  updateRecords();
  updateUI();
  showNotice(`Level ${state.levelIndex + 1}`, "Gagal", "Ulang");
  playTone("fail");
}

function updateRecords() {
  let changed = false;
  const runDefinition = currentRunDefinition();
  const runLevels = runDefinition.levels ?? [];
  if (state.score > state.best) {
    state.best = state.score;
    changed = true;
  }

  const levelRecord = isEndlessRun() ? Math.max(1, state.levelIndex + 1) : state.completedLevels;
  if (levelRecord > state.highLevel) {
    state.highLevel = levelRecord;
    changed = true;
  }

  if (!isEndlessRun() && state.completedLevels >= runLevels.length) {
    const perfectPercent = currentPerfectPercent();
    if (perfectPercent > state.highPerfectPercent) {
      state.highPerfectPercent = perfectPercent;
      changed = true;
    }
  }

  if (isEndlessRun() && state.perfectHits > state.highPerfectHits) {
    state.highPerfectHits = state.perfectHits;
    changed = true;
  }

  if (changed) {
    saveRecordsForMode(runDefinition);
  }
}

function findSegmentAtAngle(angle) {
  const normalized = normalizeAngle(angle);
  return state.segments.find((segment) => normalized >= segment.start && normalized < segment.end) || state.segments[0];
}

function feedbackForSegment(segment, angle) {
  const segmentCenter = segment.start + segment.span / 2;
  const distanceRatio = angularDistance(angle, segmentCenter) / (segment.span / 2);

  if (distanceRatio <= 1 / 3) {
    return feedbackTiers.perfect;
  }

  if (distanceRatio <= 2 / 3) {
    return feedbackTiers.good;
  }

  return feedbackTiers.hit;
}

function handleHit() {
  if (state.mode !== "playing") {
    handlePrimaryAction();
    return;
  }

  const segment = findSegmentAtAngle(state.angle);
  state.attempts += 1;

  if (segment && !segment.cleared) {
    const feedback = feedbackForSegment(segment, state.angle);
    const timeReward = timeRewardForFeedback(feedback);
    const sizeBonus = Math.round(Math.min(80, 16 / Math.max(0.12, segment.span)));

    segment.cleared = true;
    state.currentHits = clearedSegments();
    state.hits += 1;
    if (feedback === feedbackTiers.perfect) {
      state.perfectHits += 1;
    }
    state.combo = feedback === feedbackTiers.hit ? 0 : state.combo + 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    state.currentRotationHit = true;
    adjustTime(timeReward);
    addScore(feedback.score + sizeBonus + state.combo * 13 + state.levelIndex * 9);
    state.flash = {
      kind: feedback === feedbackTiers.perfect ? "perfect" : feedback === feedbackTiers.good ? "good" : "hit",
      life: 0.42,
      maxLife: 0.42,
      label: isTimeAttackRun() ? `${feedback.label} +${timeReward}s` : feedback.label,
      color: feedback.color,
      segmentIndex: segment.index,
    };

    playTone(feedback.tone);
    navigator.vibrate?.(24);

    if (state.currentHits >= state.segments.length) {
      completeLevel();
    } else {
      updateRecords();
      updateUI();
    }
  } else {
    if (isTimeAttackRun()) {
      adjustTime(timeAttackDefinition.timeRewards.miss);
    } else {
      state.lives -= 1;
    }
    state.misses += 1;
    state.combo = 0;
    state.flash = {
      kind: "miss",
      life: 0.48,
      maxLife: 0.48,
      label: isTimeAttackRun() ? "Kosong -10s" : "Kosong",
    };
    state.shake = 0.28;
    playTone("miss");
    navigator.vibrate?.(70);

    if (isTimeAttackRun() ? state.timeRemaining <= 0 : state.lives <= 0) {
      gameOver();
    } else {
      updateUI();
    }
  }
}

function handlePrimaryAction() {
  if (state.mode === "idle" || state.mode === "game-over" || state.mode === "complete") {
    startGame();
    return;
  }

  if (state.mode === "paused") {
    state.mode = "playing";
    hideNotice();
    updateUI();
    return;
  }

  if (state.mode === "level-clear") {
    advanceLevel();
  }
}

function togglePause() {
  if (state.mode === "playing") {
    state.mode = "paused";
    showNotice(`Level ${state.levelIndex + 1}`, "Jeda", "Lanjut");
  } else if (state.mode === "paused") {
    state.mode = "playing";
    hideNotice();
  }
  updateUI();
}

function resetCurrentRun() {
  clearTimeout(state.transitionTimer);
  state.mode = "idle";
  state.levelIndex = 0;
  state.completedLevels = 0;
  state.score = 0;
  state.lives = currentRunDefinition().lives;
  state.timeRemaining = currentRunDefinition().initialTime ?? 0;
  state.extraLifeMilestones = 0;
  state.combo = 0;
  state.maxCombo = 0;
  state.attempts = 0;
  state.misses = 0;
  state.hits = 0;
  state.perfectHits = 0;
  state.completedRotations = 0;
  state.emptyRotations = 0;
  state.currentRotationHit = false;
  state.finishResult = null;
  const records = loadRecordsForMode(currentRunDefinition());
  state.best = records.best;
  state.highLevel = records.highLevel;
  state.highPerfectPercent = records.highPerfectPercent;
  state.highPerfectHits = records.highPerfectHits;
  setupLevelGrid();
  loadLevel(0);
  showNotice(startNoticeKicker(), "Siap?", "Mulai");
  updateUI();
}

function setDifficulty(difficulty) {
  if (!modeDefinitions[difficulty] || state.difficulty === difficulty) {
    return;
  }

  state.difficulty = difficulty;
  resetCurrentRun();
}

function setRunMode(runMode) {
  if (!["standard", "time-attack", "endless"].includes(runMode) || state.runMode === runMode) {
    return;
  }

  state.runMode = runMode;
  resetCurrentRun();
}

function resetRecordValuesForMode(mode, scope) {
  const nextRecords = loadRecordsForMode(mode);

  if (scope === "high-score" || scope === "mode") {
    nextRecords.best = 0;
  }

  if (scope === "high-level" || scope === "mode") {
    nextRecords.highLevel = 0;
  }

  if (scope === "high-perfect" || scope === "mode") {
    nextRecords.highPerfectPercent = 0;
    nextRecords.highPerfectHits = 0;
  }

  saveRecordValuesForMode(mode, nextRecords);
  return nextRecords;
}

function resetAllGameProgress() {
  Object.values(modeDefinitions).forEach((mode) => {
    saveRecordValuesForMode(mode, {
      best: 0,
      highLevel: 0,
      highPerfectPercent: 0,
      highPerfectHits: 0,
    });
  });
  saveRecordValuesForMode(endlessDefinition, {
    best: 0,
    highLevel: 0,
    highPerfectPercent: 0,
    highPerfectHits: 0,
  });
  saveRecordValuesForMode(timeAttackDefinition, {
    best: 0,
    highLevel: 0,
    highPerfectPercent: 0,
    highPerfectHits: 0,
  });
}

function openResetWindow() {
  if (typeof ui.resetDialog.showModal === "function") {
    ui.resetDialog.showModal();
    return;
  }

  ui.resetDialog.setAttribute("open", "");
}

function closeResetWindow() {
  if (typeof ui.resetDialog.close === "function") {
    ui.resetDialog.close();
    return;
  }

  ui.resetDialog.removeAttribute("open");
}

function resetProgress(scope) {
  const runDefinition = currentRunDefinition();
  const runLabel = currentRunLabel();
  const resetLabels = {
    "high-level": "High Level",
    "high-score": "High Score",
    "high-perfect": isEndlessRun() ? "High Perfect" : "High % Perfect",
    mode: `Semua rekor mode ${runLabel}`,
    game: "seluruh progress game",
  };
  const label = resetLabels[scope];

  if (!label) {
    return;
  }

  const confirmed = window.confirm(
    scope === "game"
      ? "Reset seluruh progress game untuk semua mode?"
      : scope === "mode"
        ? `Reset semua rekor untuk mode ${runLabel}?`
        : `Reset ${label} untuk mode ${runLabel}?`
  );

  if (!confirmed) {
    return;
  }

  if (scope === "game") {
    resetAllGameProgress();
    resetCurrentRun();
    closeResetWindow();
    showNotice("Semua Mode", "Progress Direset", "Mulai");
    return;
  }

  resetRecordValuesForMode(runDefinition, scope);
  resetCurrentRun();
  closeResetWindow();
  showNotice(runLabel, `${label} Direset`, "Mulai");
}

function renderSegmentStrip() {
  ui.segmentStrip.innerHTML = "";
  state.segments.forEach((segment) => {
    const chip = document.createElement("div");
    chip.className = "segment-chip";
    chip.style.flexGrow = String(Math.max(4, Math.round(segment.span * 100)));
    chip.style.setProperty("--chip-color", segment.color);
    chip.setAttribute("aria-label", `Area ${segment.index + 1}`);
    ui.segmentStrip.appendChild(chip);
  });
}

function updateSegmentStrip() {
  Array.from(ui.segmentStrip.children).forEach((chip, index) => {
    const segment = state.segments[index];
    const feedback = segment ? feedbackForSegment(segment, state.angle) : feedbackTiers.perfect;
    chip.classList.toggle("is-cleared", Boolean(segment?.cleared));
    chip.classList.toggle("is-current", index === state.currentSegmentIndex);
    chip.style.setProperty("--feedback-color", segment?.cleared ? "#ff5b57" : feedback.color);
  });
}

function syncCurrentSegmentIndicator() {
  const segment = findSegmentAtAngle(state.angle);
  const nextIndex = segment?.index ?? -1;
  if (nextIndex !== state.currentSegmentIndex) {
    state.currentSegmentIndex = nextIndex;
    updateSegmentStrip();
  }
}

function renderLives() {
  if (isTimeAttackRun()) {
    const timeText = formatDuration(state.timeRemaining);
    ui.lifeLabel.textContent = "Waktu";
    ui.life.className = "time-status";
    ui.life.textContent = timeText;
    ui.life.setAttribute("aria-label", `${timeText} tersisa`);
    ui.life.classList.toggle("is-low", state.timeRemaining <= 10);
    return;
  }

  const startingLives = currentRunDefinition().lives;
  ui.lifeLabel.textContent = "Nyawa";
  ui.life.innerHTML = "";
  ui.life.className = "life-status";
  ui.life.setAttribute("aria-label", `${state.lives} nyawa`);
  ui.life.classList.toggle("is-low", state.lives <= Math.max(1, Math.ceil(startingLives * 0.3)));

  const heart = document.createElement("span");
  heart.className = "life-heart";
  heart.textContent = "\u2665";
  heart.setAttribute("aria-hidden", "true");

  const count = document.createElement("span");
  count.className = "life-count";
  count.textContent = `${Math.max(0, state.lives)}x`;

  ui.life.append(heart, count);
}

function setMeterValue(fillElement, value) {
  const clamped = Math.max(0, Math.min(100, value));
  fillElement.style.width = `${clamped}%`;
  fillElement.parentElement?.classList.toggle("is-empty", clamped <= 0);
}

function updateUI() {
  const level = currentLevel();
  const runDefinition = currentRunDefinition();
  const endless = isEndlessRun();
  const timed = isTimeAttackRun();
  const runLevels = runDefinition.levels ?? [];
  const levelNumber = endless ? state.levelIndex + 1 : Math.min(state.levelIndex + 1, runLevels.length);
  const cleared = clearedSegments();
  const totalModeRings = totalRingsForRun();
  const hitModeRings = hitRingsForRun();
  const perfectPercent = currentPerfectPercent();
  const progress = totalModeRings === 0 ? 0 : (hitModeRings / totalModeRings) * 100;
  const highLevelProgress = endless ? (state.highLevel > 0 ? 100 : 0) : Math.round((state.highLevel / runLevels.length) * 100);
  const hasCompletedMode = !endless && state.highLevel >= runLevels.length;

  ui.title.textContent = "Ring Pulse";
  ui.level.textContent = endless ? `Level ${levelNumber}` : `${levelNumber}/${runLevels.length}`;
  ui.score.textContent = formatScore(state.score);
  ui.highScore.textContent = formatScore(state.best);
  renderLives();
  ui.combo.textContent = state.combo;
  ui.ring.textContent = `${hitModeRings}/${totalModeRings}`;
  ui.perfectMetricLabel.textContent = endless ? "Perfect" : "% Perfect";
  ui.accuracy.textContent = endless ? formatScore(state.perfectHits) : `${perfectPercent}%`;
  setMeterValue(ui.perfectFill, perfectPercent);
  ui.perfectMeter.hidden = endless;
  ui.highPerfect.hidden = endless ? false : !hasCompletedMode;
  ui.highPerfectMarker.hidden = endless || !hasCompletedMode;
  if (endless) {
    ui.highPerfect.textContent = `High ${formatScore(state.highPerfectHits)}`;
  } else if (hasCompletedMode) {
    ui.highPerfect.textContent = `High ${state.highPerfectPercent}%`;
    ui.highPerfectMarker.style.left = `${state.highPerfectPercent}%`;
  }
  ui.progress.textContent = formatProgressPercent(progress);
  setMeterValue(ui.progressFill, progress);
  ui.highLevel.textContent = endless ? String(state.highLevel) : `${state.highLevel}/${runLevels.length}`;
  setMeterValue(ui.highLevelFill, highLevelProgress);
  ui.cleared.textContent = `${cleared}/${level.segments}`;
  ui.sessionMode.textContent = currentRunLabel();
  ui.resetMode.textContent = currentRunLabel();
  ui.difficultyPanel.hidden = endless || timed;
  ui.progressRunHeader.hidden = endless;
  ui.progressRunMeter.hidden = endless;
  ui.highLevelMeter.hidden = endless;
  ui.grid.hidden = endless;
  ui.ringMetricRow.hidden = endless;
  ui.resetHighPerfectButton.hidden = false;
  ui.resetHighPerfectButton.textContent = endless ? "High Perfect" : "High % Perfect";

  Array.from(ui.grid.children).forEach((dot, index) => {
    const dotLevelIndex = endless ? Math.max(0, state.levelIndex - 5) + index : index;
    dot.title = `Level ${dotLevelIndex + 1}`;
    dot.setAttribute("aria-label", `Level ${dotLevelIndex + 1}`);
    dot.classList.toggle("is-done", dotLevelIndex < state.completedLevels);
    dot.classList.toggle("is-record", dotLevelIndex < state.highLevel);
    dot.classList.toggle("is-current", dotLevelIndex === state.levelIndex && state.mode !== "complete");
  });

  ui.runModeOptions.forEach((button) => {
    const isActive = button.dataset.runMode === state.runMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  ui.difficultyOptions.forEach((button) => {
    const isActive = button.dataset.difficulty === state.difficulty;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.disabled = endless || timed;
  });

  ui.pauseButton.disabled = !(state.mode === "playing" || state.mode === "paused");
  updateSegmentStrip();
}

function playTone(kind) {
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const tones = {
      start: [360, 0.1, "triangle", 0.04],
      hit: [560, 0.09, "sine", 0.05],
      good: [650, 0.1, "triangle", 0.052],
      perfect: [760, 0.12, "triangle", 0.055],
      level: [440, 0.16, "triangle", 0.055],
      complete: [640, 0.24, "triangle", 0.055],
      miss: [140, 0.12, "sawtooth", 0.035],
      fail: [92, 0.34, "sawtooth", 0.04],
    };
    const [frequency, duration, type, volume] = tones[kind] || tones.hit;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(50, frequency * 0.72), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  } catch {
    audioContext = null;
  }
}

function draw(timestamp = 0) {
  syncCanvasSize();
  const size = state.viewSize;
  const center = size / 2;
  const radius = size * 0.365;
  const outerRadius = radius * 1.17;
  const flashRatio = state.flash ? 1 - state.flash.life / state.flash.maxLife : 0;
  const shakeOffset = state.shake > 0 ? Math.sin(timestamp * 0.09) * state.shake * size * 0.012 : 0;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(shakeOffset, 0);

  drawBackdrop(center, outerRadius);
  drawHitRing(center, radius);
  drawTickMarks(center, radius);
  drawNeedle(center, radius);
  drawHub(center, radius, flashRatio);
  drawCenterLabel(center, radius);
  drawFlash(center, radius, flashRatio);

  ctx.restore();
}

function drawBackdrop(center, outerRadius) {
  const size = state.viewSize;
  const pulse = state.mode === "playing" ? 0.16 + Math.sin(performance.now() * 0.004) * 0.03 : 0.08;
  const surfaceGradient = ctx.createRadialGradient(center, center, outerRadius * 0.14, center, center, outerRadius);
  surfaceGradient.addColorStop(0, "#151b25");
  surfaceGradient.addColorStop(0.58, "#0d131b");
  surfaceGradient.addColorStop(1, "#070a0f");

  ctx.save();
  ctx.fillStyle = surfaceGradient;
  ctx.beginPath();
  ctx.arc(center, center, outerRadius, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = `rgba(255, 207, 75, ${pulse})`;
  ctx.lineWidth = Math.max(2, size * 0.004);
  ctx.beginPath();
  ctx.arc(center, center, outerRadius * 0.99, 0, TAU);
  ctx.stroke();

  ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
  ctx.lineWidth = 1;
  for (let ring = 0.34; ring <= 0.82; ring += 0.12) {
    ctx.beginPath();
    ctx.arc(center, center, outerRadius * ring, 0, TAU);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = Math.max(1, size * 0.002);
  ctx.beginPath();
  ctx.arc(center, center, outerRadius * 0.66, 0, TAU);
  ctx.stroke();

  ctx.fillStyle = "rgba(75, 141, 255, 0.035)";
  ctx.beginPath();
  ctx.arc(center, center, outerRadius * 0.72, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawSegmentWedge(center, innerRadius, outerRadius, start, end) {
  ctx.beginPath();
  ctx.arc(center, center, outerRadius, canvasAngle(start), canvasAngle(end), false);
  ctx.arc(center, center, innerRadius, canvasAngle(end), canvasAngle(start), true);
  ctx.closePath();
}

function drawFeedbackBorders(center, radius, segment, isCurrent) {
  if (segment.cleared) {
    return;
  }

  const span = segment.span;
  const centerAngle = segment.start + span / 2;
  const zones = [
    { start: segment.start, end: segment.start + span / 6, color: feedbackTiers.hit.color },
    { start: segment.start + span / 6, end: segment.start + span / 3, color: feedbackTiers.good.color },
    { start: centerAngle - span / 6, end: centerAngle + span / 6, color: feedbackTiers.perfect.color },
    { start: segment.end - span / 3, end: segment.end - span / 6, color: feedbackTiers.good.color },
    { start: segment.end - span / 6, end: segment.end, color: feedbackTiers.hit.color },
  ];

  ctx.save();
  ctx.lineCap = "butt";
  ctx.lineWidth = Math.max(isCurrent ? 3 : 1.5, state.viewSize * (isCurrent ? 0.005 : 0.0026));
  ctx.globalAlpha = isCurrent ? 0.92 : 0.36;
  zones.forEach((zone) => {
    ctx.strokeStyle = zone.color;
    ctx.beginPath();
    ctx.arc(center, center, radius, canvasAngle(zone.start), canvasAngle(zone.end), false);
    ctx.stroke();
  });
  ctx.restore();
}

function drawHitRing(center, radius) {
  const current = findSegmentAtAngle(state.angle);
  const innerRadius = radius * 0.78;
  const outerRadius = radius * 1.08;

  ctx.save();
  state.segments.forEach((segment) => {
    const isCurrent = current?.index === segment.index && state.mode === "playing";
    const isFlashing = state.flash?.segmentIndex === segment.index && state.flash.kind !== "miss";
    const grow = isCurrent && !segment.cleared ? radius * 0.018 : 0;

    ctx.save();
    drawSegmentWedge(center, innerRadius - grow * 0.2, outerRadius + grow, segment.start, segment.end);
    ctx.globalAlpha = segment.cleared ? 0.24 : 0.95;
    ctx.fillStyle = segment.cleared ? "rgba(255, 255, 255, 0.16)" : segment.color;
    ctx.shadowColor = segment.cleared ? "transparent" : segment.color;
    ctx.shadowBlur = isCurrent || isFlashing ? 20 : 0;
    ctx.fill();
    ctx.restore();

    drawFeedbackBorders(center, outerRadius + radius * 0.015, segment, isCurrent);

    if (isCurrent) {
      const feedback = segment.cleared ? null : feedbackForSegment(segment, state.angle);
      ctx.save();
      drawSegmentWedge(center, innerRadius - radius * 0.006, outerRadius + radius * 0.024, segment.start, segment.end);
      ctx.strokeStyle = segment.cleared ? "rgba(255, 91, 87, 0.86)" : feedback.color;
      ctx.lineWidth = Math.max(2, state.viewSize * 0.004);
      ctx.stroke();
      ctx.restore();
    }
  });

  ctx.lineWidth = Math.max(1, state.viewSize * 0.002);
  ctx.strokeStyle = "rgba(7, 10, 15, 0.58)";
  state.segments.forEach((segment) => {
    ctx.beginPath();
    ctx.moveTo(xFromAngle(center, segment.start, innerRadius * 0.98), yFromAngle(center, segment.start, innerRadius * 0.98));
    ctx.lineTo(xFromAngle(center, segment.start, outerRadius * 1.02), yFromAngle(center, segment.start, outerRadius * 1.02));
    ctx.stroke();
  });

  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = Math.max(2, state.viewSize * 0.003);
  ctx.beginPath();
  ctx.arc(center, center, outerRadius, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(center, center, innerRadius, 0, TAU);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 207, 75, 0.24)";
  ctx.lineWidth = Math.max(2, state.viewSize * 0.004);
  ctx.beginPath();
  ctx.arc(center, center, outerRadius + radius * 0.045, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawTickMarks(center, radius) {
  ctx.save();
  ctx.lineCap = "round";
  for (let index = 0; index < 72; index += 1) {
    const angle = (index / 72) * TAU;
    const major = index % 6 === 0;
    const inner = radius * (major ? 0.58 : 0.64);
    const outer = radius * 0.72;

    ctx.strokeStyle = major ? "rgba(247, 248, 251, 0.42)" : "rgba(247, 248, 251, 0.13)";
    ctx.lineWidth = major ? 2.3 : 1;
    ctx.beginPath();
    ctx.moveTo(xFromAngle(center, angle, inner), yFromAngle(center, angle, inner));
    ctx.lineTo(xFromAngle(center, angle, outer), yFromAngle(center, angle, outer));
    ctx.stroke();
  }
  ctx.restore();
}

function drawNeedle(center, radius) {
  const endX = xFromAngle(center, state.angle, radius * 1.12);
  const endY = yFromAngle(center, state.angle, radius * 1.12);
  const tailX = xFromAngle(center, state.angle + Math.PI, radius * 0.12);
  const tailY = yFromAngle(center, state.angle + Math.PI, radius * 0.12);
  const current = findSegmentAtAngle(state.angle);
  const emptyZone = current?.cleared;
  const needleColor = emptyZone ? "#ff5b57" : "#ffcf4b";

  ctx.save();
  ctx.lineCap = "round";
  ctx.shadowColor = emptyZone ? "rgba(255, 91, 87, 0.42)" : "rgba(255, 207, 75, 0.44)";
  ctx.shadowBlur = 16;
  ctx.strokeStyle = needleColor;
  ctx.lineWidth = Math.max(6, state.viewSize * 0.011);
  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
  ctx.lineWidth = Math.max(1.5, state.viewSize * 0.003);
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.fillStyle = "#071018";
  ctx.beginPath();
  ctx.arc(endX, endY, Math.max(9, state.viewSize * 0.016), 0, TAU);
  ctx.fill();
  ctx.lineWidth = Math.max(3, state.viewSize * 0.004);
  ctx.strokeStyle = emptyZone ? "#ff5b57" : "#28e0a6";
  ctx.stroke();
  ctx.restore();
}

function drawHub(center, radius, flashRatio) {
  const flashScale = state.flash && state.flash.kind !== "miss" ? 1 + flashRatio * 0.12 : 1;
  const hubGradient = ctx.createRadialGradient(center, center - radius * 0.08, radius * 0.08, center, center, radius * 0.28);
  hubGradient.addColorStop(0, "#1d2531");
  hubGradient.addColorStop(1, "#0a0f16");

  ctx.save();
  ctx.fillStyle = hubGradient;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.lineWidth = Math.max(2, state.viewSize * 0.003);
  ctx.beginPath();
  ctx.arc(center, center, radius * 0.26 * flashScale, 0, TAU);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(center, center, radius * 0.42, 0, TAU);
  ctx.stroke();

  ctx.fillStyle = "#ffcf4b";
  ctx.beginPath();
  ctx.arc(center, center, radius * 0.035, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawCenterLabel(center, radius) {
  const level = currentLevel();
  const labelColor = state.mode === "paused" ? "#ffcf4b" : "#f7f8fb";

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(247, 248, 251, 0.56)";
  ctx.font = `800 ${Math.max(12, radius * 0.06)}px Inter, sans-serif`;
  ctx.fillText(`LEVEL ${level.number}`, center, center - radius * 0.06);

  ctx.fillStyle = labelColor;
  ctx.font = `900 ${Math.max(28, radius * 0.17)}px Inter, sans-serif`;
  ctx.fillText(`${clearedSegments()}/${level.segments}`, center, center + radius * 0.1);
  ctx.restore();
}

function drawFlash(center, radius, flashRatio) {
  if (!state.flash) {
    return;
  }

  const colors = {
    hit: "40, 224, 166",
    good: "75, 141, 255",
    perfect: "255, 207, 75",
    miss: "255, 91, 87",
  };
  const color = colors[state.flash.kind] || colors.hit;
  const alpha = Math.max(0, 1 - flashRatio);

  ctx.save();
  ctx.strokeStyle = `rgba(${color}, ${alpha * 0.48})`;
  ctx.lineWidth = Math.max(3, state.viewSize * 0.006);
  ctx.beginPath();
  ctx.arc(center, center, radius * (0.32 + flashRatio * 0.72), 0, TAU);
  ctx.stroke();

  ctx.fillStyle = `rgba(${color}, ${alpha})`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${Math.max(15, radius * 0.075)}px Inter, sans-serif`;
  ctx.fillText(state.flash.label, center, center - radius * 0.34);
  ctx.restore();
}

function tick(timestamp) {
  const delta = state.lastTime ? Math.min((timestamp - state.lastTime) / 1000, 0.04) : 0;
  state.lastTime = timestamp;

  if (state.mode === "playing") {
    const previousAngle = state.angle;
    state.angle = normalizeAngle(state.angle + currentLevel().speed * delta);
    trackCompletedRotation(previousAngle, state.angle);
    if (isTimeAttackRun()) {
      state.timeRemaining = Math.max(0, state.timeRemaining - delta);
      renderLives();
      if (state.timeRemaining <= 0) {
        gameOver();
      }
    }
  } else if (state.mode === "idle") {
    state.angle = normalizeAngle(state.angle + 0.34 * delta);
  }

  if (state.flash) {
    state.flash.life -= delta;
    if (state.flash.life <= 0) {
      state.flash = null;
    }
  }

  if (state.shake > 0) {
    state.shake = Math.max(0, state.shake - delta);
  }

  syncCurrentSegmentIndicator();
  draw(timestamp);
  requestAnimationFrame(tick);
}

ui.startButton.addEventListener("click", handlePrimaryAction);
canvas.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }
  event.preventDefault();
  handleHit();
});
ui.pauseButton.addEventListener("click", togglePause);
ui.restartButton.addEventListener("click", startGame);
ui.openResetButton.addEventListener("click", openResetWindow);
ui.closeResetButton.addEventListener("click", closeResetWindow);
ui.resetDialog.addEventListener("click", (event) => {
  if (event.target === ui.resetDialog) {
    closeResetWindow();
  }
});
ui.difficultyOptions.forEach((button) => {
  button.addEventListener("click", () => {
    setDifficulty(button.dataset.difficulty);
  });
});
ui.runModeOptions.forEach((button) => {
  button.addEventListener("click", () => {
    setRunMode(button.dataset.runMode);
  });
});
ui.resetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    resetProgress(button.dataset.resetScope);
  });
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    if (!event.repeat) {
      handleHit();
    }
  }

  if (event.key.toLowerCase() === "p" && !event.repeat) {
    togglePause();
  }

  if (event.key.toLowerCase() === "r" && !event.repeat) {
    startGame();
  }
});

window.addEventListener("resize", syncCanvasSize);

if ("ResizeObserver" in window) {
  new ResizeObserver(syncCanvasSize).observe(canvas);
}

resetCurrentRun();
requestAnimationFrame(tick);
