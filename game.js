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
  noticeResult: document.querySelector("#noticeResult"),
  startButton: document.querySelector("#startButton"),
  pauseButton: document.querySelector("#pauseButton"),
  restartButton: document.querySelector("#restartButton"),
  sessionMode: document.querySelector("#sessionModeValue"),
  resetMode: document.querySelector("#resetModeValue"),
  resetDialog: document.querySelector("#resetDialog"),
  openResetButton: document.querySelector("#openResetButton"),
  closeResetButton: document.querySelector("#closeResetButton"),
  bonusDialog: document.querySelector("#bonusDialog"),
  openBonusButton: document.querySelector("#openBonusButton"),
  closeBonusButton: document.querySelector("#closeBonusButton"),
  bonusMax: document.querySelector("#bonusMaxValue"),
  bonusFormula: document.querySelector("#bonusFormulaValue"),
  rankBonusTable: document.querySelector("#rankBonusTable"),
  perfectBonusTable: document.querySelector("#perfectBonusTable"),
  comboBonusTable: document.querySelector("#comboBonusTable"),
  penaltyBonusTable: document.querySelector("#penaltyBonusTable"),
  disciplineBonusTable: document.querySelector("#disciplineBonusTable"),
  difficultyPanel: document.querySelector("#difficultyPanel"),
  runModeOptions: Array.from(document.querySelectorAll(".mode-option")),
  difficultyButton: document.querySelector("#difficultyButton"),
  difficultyCurrentValue: document.querySelector("#difficultyCurrentValue"),
  difficultyRankValue: document.querySelector("#difficultyRankValue"),
  difficultyMenu: document.querySelector("#difficultyMenu"),
  difficultyChoices: Array.from(document.querySelectorAll(".difficulty-choice")),
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
    { min: 100, points: 3600, label: "100% Perfect" },
    { min: 97, points: 3200, label: "97%+ Perfect" },
    { min: 94, points: 2800, label: "94%+ Perfect" },
    { min: 90, points: 2400, label: "90%+ Perfect" },
    { min: 85, points: 1900, label: "85%+ Perfect" },
    { min: 80, points: 1500, label: "80%+ Perfect" },
    { min: 70, points: 1000, label: "70%+ Perfect" },
    { min: 60, points: 600, label: "60%+ Perfect" },
    { min: 0, points: 250, label: "<60% Perfect" },
  ],
  comboTiers: [
    { min: 95, points: 2600, label: "95%+ Max Combo" },
    { min: 85, points: 2200, label: "85%+ Max Combo" },
    { min: 75, points: 1800, label: "75%+ Max Combo" },
    { min: 60, points: 1300, label: "60%+ Max Combo" },
    { min: 45, points: 900, label: "45%+ Max Combo" },
    { min: 30, points: 550, label: "30%+ Max Combo" },
    { min: 0, points: 250, label: "<30% Max Combo" },
  ],
  penaltyTiers: [
    { max: 2, points: 1500, label: "0-2x streak penalti" },
    { max: 3, points: 1200, label: "3x streak penalti" },
    { max: 4, points: 900, label: "4x streak penalti" },
    { max: 5, points: 650, label: "5x streak penalti" },
    { max: 6, points: 400, label: "6x streak penalti" },
    { max: 7, points: 200, label: "7x streak penalti" },
    { max: Number.POSITIVE_INFINITY, points: 0, label: "8x+ streak penalti" },
  ],
  noMissPoints: 1300,
  ranks: [
    { rank: "S+", min: 9400 },
    { rank: "S", min: 8800 },
    { rank: "A+", min: 8000 },
    { rank: "A", min: 6900 },
    { rank: "B+", min: 5700 },
    { rank: "B", min: 4500 },
    { rank: "C", min: 3000 },
    { rank: "D", min: 0 },
  ],
};

const modeDefinitions = {
  easy: {
    id: "easy",
    label: "easy",
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
    label: "normal",
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
    label: "hard",
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
    label: "extreme",
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
  activeLevel: null,
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
  currentPenaltyStreak: 0,
  maxPenaltyStreak: 0,
  finishResult: null,
  best: 0,
  highLevel: 0,
  highFinishPoints: 0,
  highPerfectPercent: 0,
  highPerfectHits: 0,
  lastTime: 0,
  viewSize: 720,
  dpr: 1,
  flash: null,
  shake: 0,
  transitionTimer: 0,
  currentSegmentIndex: -1,
  currentSegment: null,
  timeDisplayCache: "",
};

let audioContext = null;
let canvasResizeFrame = 0;

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
    const highFinishKey = storageKey(definition, "highFinish");
    const highPerfectKey = storageKey(definition, "highPerfect");
    const highPerfectHitsKey = storageKey(definition, "highPerfectHits");
    if (localStorage.getItem(signatureKey) !== definition.signature) {
      localStorage.setItem(signatureKey, definition.signature);
      localStorage.removeItem(bestKey);
      localStorage.removeItem(highLevelKey);
      localStorage.removeItem(highFinishKey);
      localStorage.removeItem(highPerfectKey);
      localStorage.removeItem(highPerfectHitsKey);
      return { best: 0, highLevel: 0, highFinishPoints: 0, highPerfectPercent: 0, highPerfectHits: 0 };
    }
    const highLevelCap = definition.levels?.length ?? Number.POSITIVE_INFINITY;
    return {
      best: Number(localStorage.getItem(bestKey) || 0),
      highLevel: Math.min(highLevelCap, Number(localStorage.getItem(highLevelKey) || 0)),
      highFinishPoints: Number(localStorage.getItem(highFinishKey) || 0),
      highPerfectPercent: Math.min(100, Number(localStorage.getItem(highPerfectKey) || 0)),
      highPerfectHits: Number(localStorage.getItem(highPerfectHitsKey) || 0),
    };
  } catch {
    return { best: 0, highLevel: 0, highFinishPoints: 0, highPerfectPercent: 0, highPerfectHits: 0 };
  }
}

function saveRecordValuesForMode(definition, records) {
  try {
    localStorage.setItem(storageKey(definition, "signature"), definition.signature);
    localStorage.setItem(storageKey(definition, "best"), String(records.best));
    localStorage.setItem(storageKey(definition, "highLevel"), String(records.highLevel));
    localStorage.setItem(storageKey(definition, "highFinish"), String(records.highFinishPoints || 0));
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
    highFinishPoints: state.highFinishPoints,
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

function resolveLevel(index = state.levelIndex) {
  if (isEndlessRun()) {
    return createEndlessLevel(index);
  }

  const levels = currentRunDefinition().levels;
  return levels[index] || levels[levels.length - 1];
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
  return state.activeLevel || resolveLevel();
}

function clearedSegments() {
  return state.currentHits;
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

function rankForFinishPoints(points) {
  return findScoringTier(standardFinishScoring.ranks, points).rank;
}

function formatSelectedDifficultyRank() {
  if (!isStandardRun()) {
    return "Rank hanya Standard";
  }

  if (state.highFinishPoints <= 0) {
    return "Rank -";
  }

  return `Rank ${rankForFinishPoints(state.highFinishPoints)} / ${formatScore(state.highFinishPoints)}`;
}

function findPenaltyTier(value) {
  return standardFinishScoring.penaltyTiers.find((tier) => value <= tier.max)
    || standardFinishScoring.penaltyTiers[standardFinishScoring.penaltyTiers.length - 1];
}

function maxFinishBonusPoints() {
  return standardFinishScoring.basePoints
    + standardFinishScoring.perfectTiers[0].points
    + standardFinishScoring.comboTiers[0].points
    + standardFinishScoring.noMissPoints
    + standardFinishScoring.penaltyTiers[0].points;
}

function formatMinTarget(value, suffix = "") {
  return value === 0 ? "Semua run" : `${value}${suffix}+`;
}

function formatPenaltyTarget(tier) {
  if (!Number.isFinite(tier.max)) {
    return "8x+ streak penalti";
  }

  return tier.max === 2 ? "Maks 0-2x streak penalti" : `Maks ${tier.max}x streak penalti`;
}

function calculateStandardFinishResult() {
  const totalSegments = totalRingsForRun();
  const perfectPercent = currentPerfectPercent();
  const comboPercent = totalSegments === 0 ? 0 : Math.round((state.maxCombo / totalSegments) * 100);
  const perfectTier = findScoringTier(standardFinishScoring.perfectTiers, perfectPercent);
  const comboTier = findScoringTier(standardFinishScoring.comboTiers, comboPercent);
  const penaltyTier = findPenaltyTier(state.maxPenaltyStreak);
  const noMiss = state.misses === 0;
  const points = standardFinishScoring.basePoints
    + perfectTier.points
    + comboTier.points
    + (noMiss ? standardFinishScoring.noMissPoints : 0)
    + penaltyTier.points;
  const rankTier = findScoringTier(standardFinishScoring.ranks, points);

  return {
    rank: rankTier.rank,
    points,
    perfectPercent,
    maxCombo: state.maxCombo,
    comboPercent,
    noMiss,
    maxPenaltyStreak: state.maxPenaltyStreak,
    perfectTier,
    comboTier,
    penaltyTier,
  };
}

function formatFinishDetail(result) {
  const cleanText = result.noMiss ? "Tanpa miss" : `${state.misses} miss`;
  const penaltyText = `Penalti ${result.maxPenaltyStreak}x (+${formatScore(result.penaltyTier.points)})`;
  return `Bonus +${formatScore(result.points)} - Kombo ${result.comboPercent}% - ${cleanText} - ${penaltyText}`;
}

function formatFailDetail() {
  const levelText = isEndlessRun() ? `Level ${state.levelIndex + 1}` : `${state.completedLevels}/${currentRunDefinition().levels.length} level`;
  return `Skor ${formatScore(state.score)} - Progres ${levelText} - Perfect ${currentPerfectPercent()}% - ${state.misses} miss - Penalti max ${state.maxPenaltyStreak}x`;
}

function renderBonusRows(container, rows) {
  container.innerHTML = "";
  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = "bonus-row";

    const label = document.createElement("span");
    label.textContent = row.label;

    const value = document.createElement("strong");
    value.textContent = row.value;

    item.append(label, value);
    container.appendChild(item);
  });
}

function renderBonusTransparency() {
  ui.bonusMax.textContent = `Max ${formatScore(maxFinishBonusPoints())}`;
  ui.bonusFormula.textContent = `Base ${formatScore(standardFinishScoring.basePoints)} + % Sempurna + Max Kombo + Tanpa Miss + Minimisasi Penalti`;

  renderBonusRows(
    ui.rankBonusTable,
    standardFinishScoring.ranks.map((tier) => ({
      label: `Rank ${tier.rank}`,
      value: `${formatScore(tier.min)}+ poin selesai`,
    }))
  );
  renderBonusRows(
    ui.perfectBonusTable,
    standardFinishScoring.perfectTiers.map((tier) => ({
      label: formatMinTarget(tier.min, "%"),
      value: `+${formatScore(tier.points)}`,
    }))
  );
  renderBonusRows(
    ui.comboBonusTable,
    standardFinishScoring.comboTiers.map((tier) => ({
      label: `${formatMinTarget(tier.min, "%")} dari total segmen`,
      value: `+${formatScore(tier.points)}`,
    }))
  );
  renderBonusRows(
    ui.penaltyBonusTable,
    standardFinishScoring.penaltyTiers.map((tier) => ({
      label: formatPenaltyTarget(tier),
      value: `+${formatScore(tier.points)}`,
    }))
  );
  renderBonusRows(ui.disciplineBonusTable, [
    { label: "Base selesai Standard", value: `+${formatScore(standardFinishScoring.basePoints)}` },
    { label: "Tidak pernah miss", value: `+${formatScore(standardFinishScoring.noMissPoints)}` },
    { label: "Jika ada miss", value: "+0" },
  ]);
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

function queueCanvasResize() {
  if (canvasResizeFrame) {
    return;
  }

  canvasResizeFrame = window.requestAnimationFrame(() => {
    canvasResizeFrame = 0;
    syncCanvasSize();
  });
}

function renderNoticeResult(result) {
  ui.noticeResult.innerHTML = "";
  ui.notice.classList.toggle("has-result", Boolean(result));

  if (!result) {
    ui.noticeResult.hidden = true;
    return;
  }

  const medal = document.createElement("strong");
  medal.className = "rank-medal";
  medal.textContent = result.rank;
  medal.setAttribute("aria-label", `Rank ${result.rank}`);

  const breakdown = document.createElement("div");
  breakdown.className = "rank-breakdown";
  [
    ["Skor Akhir", formatScore(state.score)],
    ["Bonus", `+${formatScore(result.points)}`],
    ["Perfect", `${result.perfectPercent}%`],
    ["Kombo", `${result.comboPercent}%`],
    ["Penalti", `${result.maxPenaltyStreak}x / +${formatScore(result.penaltyTier.points)}`],
    ["Disiplin", result.noMiss ? "Tanpa Miss" : `${state.misses} Miss`],
  ].forEach(([label, value]) => {
    const item = document.createElement("span");
    const strong = document.createElement("strong");
    item.textContent = label;
    strong.textContent = value;
    item.appendChild(strong);
    breakdown.appendChild(item);
  });

  ui.noticeResult.append(medal, breakdown);
  ui.noticeResult.hidden = false;
}

function showNotice(kicker, title, actionText, detail = "", tone = "", result = null) {
  ui.noticeKicker.textContent = kicker;
  ui.noticeTitle.textContent = title;
  ui.noticeDetail.textContent = detail;
  ui.noticeDetail.hidden = detail.length === 0;
  renderNoticeResult(result);
  ui.notice.classList.remove("is-success", "is-fail", "is-paused");
  if (tone) {
    ui.notice.classList.add(`is-${tone}`);
  }
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
  state.activeLevel = resolveLevel(index);
  state.segments = generateSegments(state.activeLevel);
  state.currentHits = 0;
  state.angle = normalizeAngle(degreesToRadians(11 + index * 13));
  state.flash = null;
  state.shake = 0;
  state.currentSegmentIndex = -1;
  state.currentSegment = null;
  state.timeDisplayCache = "";
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
  state.currentPenaltyStreak = 0;
  state.maxPenaltyStreak = 0;
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
    finishResult ? `Tuntas - Rank ${finishResult.rank}` : "Tuntas",
    "Main Lagi",
    finishResult ? formatFinishDetail(finishResult) : "",
    "success",
    finishResult
  );
  playTone("complete");
}

function gameOver() {
  state.mode = "game-over";
  state.combo = 0;
  state.shake = 0;
  updateRecords();
  updateUI();
  showNotice(`Level ${state.levelIndex + 1}`, "Gagal", "Ulang", formatFailDetail(), "fail");
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

    if (isStandardRun() && state.finishResult && state.finishResult.points > state.highFinishPoints) {
      state.highFinishPoints = state.finishResult.points;
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
  let low = 0;
  let high = state.segments.length - 1;

  while (low <= high) {
    const middle = (low + high) >> 1;
    const segment = state.segments[middle];

    if (normalized < segment.start) {
      high = middle - 1;
    } else if (normalized >= segment.end) {
      low = middle + 1;
    } else {
      return segment;
    }
  }

  return state.segments[0];
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

function feedbackKind(feedback) {
  if (feedback === feedbackTiers.perfect) {
    return "perfect";
  }

  if (feedback === feedbackTiers.good) {
    return "good";
  }

  return "safe";
}

function increasePenaltyStreak() {
  state.currentPenaltyStreak += 1;
  state.maxPenaltyStreak = Math.max(state.maxPenaltyStreak, state.currentPenaltyStreak);
}

function updatePenaltyStreakForFeedback(feedback) {
  if (feedback === feedbackTiers.hit) {
    increasePenaltyStreak();
    return;
  }

  state.currentPenaltyStreak = 0;
}

function flashDuration(kind) {
  return {
    perfect: 0.74,
    good: 0.58,
    safe: 0.5,
    miss: 0.54,
  }[kind] || 0.5;
}

function createFlashParticles(kind, segment, count) {
  const centerAngle = segment ? segment.start + segment.span / 2 : state.angle;
  const span = segment?.span ?? TAU;
  const spread = kind === "perfect" ? span * 2.25 : kind === "miss" ? span * 1.35 : span * 1.6;
  const seedBase = state.attempts * 131 + state.levelIndex * 37 + (segment?.index ?? 0) * 19;

  return Array.from({ length: count }, (_, index) => {
    const seed = seedBase + index * 17;
    const arcOffset = (seededUnit(seed) - 0.5) * spread;
    const drift = (seededUnit(seed + 5) - 0.5) * 0.28;
    return {
      angle: normalizeAngle(centerAngle + arcOffset),
      drift,
      distance: 0.3 + seededUnit(seed + 9) * 0.58,
      size: 0.55 + seededUnit(seed + 13) * 0.95,
      delay: seededUnit(seed + 21) * 0.12,
    };
  });
}

function createHitFlash(feedback, segment, points, timeReward) {
  const kind = feedbackKind(feedback);
  const duration = flashDuration(kind);
  const particleCount = kind === "perfect" ? 22 : kind === "good" ? 13 : 8;
  const penaltyText = kind === "safe" ? `Streak penalti ${state.currentPenaltyStreak}x` : "";

  return {
    kind,
    life: duration,
    maxLife: duration,
    label: feedback.label,
    scoreLabel: `+${formatScore(points)} poin`,
    detailLabel: penaltyText || (isTimeAttackRun()
      ? `+${timeReward}s waktu`
      : state.combo > 0
        ? `${state.combo} kombo`
        : "Aman"),
    color: feedback.color,
    segmentIndex: segment.index,
    particles: createFlashParticles(kind, segment, particleCount),
  };
}

function createMissFlash() {
  const duration = flashDuration("miss");
  return {
    kind: "miss",
    life: duration,
    maxLife: duration,
    label: "Miss",
    scoreLabel: isTimeAttackRun() ? "-10s waktu" : "0 poin",
    detailLabel: `Streak penalti ${state.currentPenaltyStreak}x`,
    color: "#ff5b57",
    segmentIndex: state.currentSegmentIndex,
    particles: createFlashParticles("miss", state.currentSegment, 7),
  };
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
    state.currentHits = Math.min(state.segments.length, state.currentHits + 1);
    state.hits += 1;
    if (feedback === feedbackTiers.perfect) {
      state.perfectHits += 1;
    }
    state.combo = feedback === feedbackTiers.hit ? 0 : state.combo + 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    updatePenaltyStreakForFeedback(feedback);
    adjustTime(timeReward);
    const hitPoints = feedback.score + sizeBonus + state.combo * 13 + state.levelIndex * 9;
    addScore(hitPoints);
    state.flash = createHitFlash(feedback, segment, hitPoints, timeReward);

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
    increasePenaltyStreak();
    state.flash = createMissFlash();
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
    showNotice(`Level ${state.levelIndex + 1}`, "Jeda", "Lanjut", "", "paused");
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
  state.currentPenaltyStreak = 0;
  state.maxPenaltyStreak = 0;
  state.finishResult = null;
  const records = loadRecordsForMode(currentRunDefinition());
  state.best = records.best;
  state.highLevel = records.highLevel;
  state.highFinishPoints = records.highFinishPoints;
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
  closeDifficultyMenu();
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

  if (scope === "high-score" || scope === "mode") {
    nextRecords.highFinishPoints = 0;
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
      highFinishPoints: 0,
      highPerfectPercent: 0,
      highPerfectHits: 0,
    });
  });
  saveRecordValuesForMode(endlessDefinition, {
    best: 0,
    highLevel: 0,
    highFinishPoints: 0,
    highPerfectPercent: 0,
    highPerfectHits: 0,
  });
  saveRecordValuesForMode(timeAttackDefinition, {
    best: 0,
    highLevel: 0,
    highFinishPoints: 0,
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

function openBonusWindow() {
  if (!isStandardRun()) {
    return;
  }

  renderBonusTransparency();
  if (typeof ui.bonusDialog.showModal === "function") {
    ui.bonusDialog.showModal();
    return;
  }

  ui.bonusDialog.setAttribute("open", "");
}

function closeBonusWindow() {
  if (typeof ui.bonusDialog.close === "function") {
    ui.bonusDialog.close();
    return;
  }

  ui.bonusDialog.removeAttribute("open");
}

function closeDifficultyMenu() {
  ui.difficultyMenu.hidden = true;
  ui.difficultyButton.setAttribute("aria-expanded", "false");
}

function openDifficultyMenu() {
  if (!isStandardRun()) {
    return;
  }

  ui.difficultyMenu.hidden = false;
  ui.difficultyButton.setAttribute("aria-expanded", "true");
}

function toggleDifficultyMenu() {
  if (ui.difficultyMenu.hidden) {
    openDifficultyMenu();
    return;
  }

  closeDifficultyMenu();
}

function selectDifficulty(difficulty) {
  closeDifficultyMenu();
  setDifficulty(difficulty);
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
  state.currentSegment = segment || null;
  if (nextIndex !== state.currentSegmentIndex) {
    state.currentSegmentIndex = nextIndex;
    updateSegmentStrip();
  }
}

function renderLives() {
  if (isTimeAttackRun()) {
    const timeText = formatDuration(state.timeRemaining);
    const isLow = state.timeRemaining <= 10;
    const cacheKey = `${timeText}:${isLow}`;
    ui.lifeLabel.textContent = "Waktu";
    if (state.timeDisplayCache === cacheKey) {
      return;
    }
    state.timeDisplayCache = cacheKey;
    ui.life.className = "time-status";
    ui.life.textContent = timeText;
    ui.life.setAttribute("aria-label", `${timeText} tersisa`);
    ui.life.classList.toggle("is-low", isLow);
    return;
  }

  state.timeDisplayCache = "";
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

  ui.title.setAttribute("aria-label", "Ring Pulse");
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
  ui.difficultyPanel.hidden = false;
  ui.difficultyPanel.classList.toggle("is-locked", endless || timed);
  ui.difficultyPanel.setAttribute("aria-disabled", String(endless || timed));
  ui.difficultyPanel.title = endless || timed ? "Kesulitan hanya aktif untuk mode Standard" : "";
  ui.difficultyButton.disabled = endless || timed;
  ui.difficultyCurrentValue.textContent = state.difficulty;
  ui.difficultyRankValue.textContent = formatSelectedDifficultyRank();
  if (endless || timed) {
    closeDifficultyMenu();
  }
  ui.openBonusButton.disabled = !isStandardRun();
  ui.openBonusButton.title = isStandardRun() ? "" : "Bonus selesai hanya berlaku untuk mode Standard";
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

  ui.difficultyChoices.forEach((button) => {
    const isSelected = button.dataset.difficulty === state.difficulty;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
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
  const size = state.viewSize;
  const center = size / 2;
  const radius = size * 0.365;
  const outerRadius = radius * 1.17;
  const flashRatio = state.flash ? 1 - state.flash.life / state.flash.maxLife : 0;
  const shakeOffset = state.shake > 0 ? Math.sin(timestamp * 0.09) * state.shake * size * 0.012 : 0;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(shakeOffset, 0);

  drawBackdrop(center, outerRadius, timestamp);
  drawHitRing(center, radius);
  drawTickMarks(center, radius);
  drawNeedle(center, radius);
  drawHub(center, radius, flashRatio);
  drawCenterLabel(center, radius);
  drawFlash(center, radius, flashRatio);

  ctx.restore();
}

function drawBackdrop(center, outerRadius, timestamp = 0) {
  const size = state.viewSize;
  const pulse = state.mode === "playing" ? 0.16 + Math.sin(timestamp * 0.004) * 0.03 : 0.08;
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
  const current = state.currentSegment || findSegmentAtAngle(state.angle);
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
  const current = state.currentSegment || findSegmentAtAngle(state.angle);
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

function drawRoundedRect(x, y, width, height, radius) {
  const right = x + width;
  const bottom = y + height;
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(right - r, y);
  ctx.quadraticCurveTo(right, y, right, y + r);
  ctx.lineTo(right, bottom - r);
  ctx.quadraticCurveTo(right, bottom, right - r, bottom);
  ctx.lineTo(x + r, bottom);
  ctx.quadraticCurveTo(x, bottom, x, bottom - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawTextPlate(text, centerX, centerY, font, color, alpha, minHeight) {
  ctx.font = font;
  const paddingX = Math.max(12, state.viewSize * 0.016);
  const height = Math.max(minHeight, state.viewSize * 0.034);
  const width = ctx.measureText(text).width + paddingX * 2;

  ctx.fillStyle = `rgba(7, 10, 15, ${alpha * 0.58})`;
  drawRoundedRect(centerX - width / 2, centerY - height / 2, width, height, height / 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.fillText(text, centerX, centerY + Math.max(0.5, state.viewSize * 0.001));
}

function drawFlash(center, radius, flashRatio) {
  if (!state.flash) {
    return;
  }

  const configs = {
    safe: {
      rgb: "40, 224, 166",
      accent: "#28e0a6",
      scale: 0.88,
      lift: 0.33,
      ringAlpha: 0.38,
    },
    good: {
      rgb: "75, 141, 255",
      accent: "#4b8dff",
      scale: 1,
      lift: 0.37,
      ringAlpha: 0.44,
    },
    perfect: {
      rgb: "255, 207, 75",
      accent: "#ffcf4b",
      scale: 1.18,
      lift: 0.43,
      ringAlpha: 0.58,
    },
    miss: {
      rgb: "255, 91, 87",
      accent: "#ff5b57",
      scale: 0.94,
      lift: 0.35,
      ringAlpha: 0.42,
    },
  };
  const config = configs[state.flash.kind] || configs.safe;
  const alpha = Math.max(0, 1 - flashRatio);
  const eased = 1 - (1 - flashRatio) ** 2;

  ctx.save();

  const aura = ctx.createRadialGradient(center, center, radius * 0.16, center, center, radius * (0.72 + eased * 0.2));
  aura.addColorStop(0, `rgba(${config.rgb}, ${alpha * (state.flash.kind === "perfect" ? 0.22 : 0.13)})`);
  aura.addColorStop(0.62, `rgba(${config.rgb}, ${alpha * 0.05})`);
  aura.addColorStop(1, `rgba(${config.rgb}, 0)`);
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(center, center, radius * (0.78 + eased * 0.25), 0, TAU);
  ctx.fill();

  if (state.flash.kind === "perfect") {
    ctx.lineCap = "round";
    for (let index = 0; index < 18; index += 1) {
      const angle = (index / 18) * TAU + eased * 0.18;
      const inner = radius * (0.36 + eased * 0.08);
      const outer = radius * (0.62 + eased * 0.3);
      ctx.strokeStyle = `rgba(${config.rgb}, ${alpha * 0.17})`;
      ctx.lineWidth = Math.max(1.2, state.viewSize * 0.0024);
      ctx.beginPath();
      ctx.moveTo(xFromAngle(center, angle, inner), yFromAngle(center, angle, inner));
      ctx.lineTo(xFromAngle(center, angle, outer), yFromAngle(center, angle, outer));
      ctx.stroke();
    }
  }

  ctx.lineCap = "round";
  ctx.strokeStyle = `rgba(${config.rgb}, ${alpha * config.ringAlpha})`;
  ctx.shadowColor = `rgba(${config.rgb}, ${alpha * 0.5})`;
  ctx.shadowBlur = state.flash.kind === "perfect" ? 26 : 14;
  ctx.lineWidth = Math.max(3, state.viewSize * 0.006 * config.scale);
  ctx.beginPath();
  ctx.arc(center, center, radius * (0.3 + eased * 0.72), 0, TAU);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * (state.flash.kind === "perfect" ? 0.38 : 0.2)})`;
  ctx.lineWidth = Math.max(1.4, state.viewSize * 0.0024);
  ctx.beginPath();
  ctx.arc(center, center, radius * (0.22 + eased * 0.38), 0, TAU);
  ctx.stroke();

  state.flash.particles?.forEach((particle) => {
    const particleProgress = Math.max(0, Math.min(1, (flashRatio - particle.delay) / Math.max(0.01, 1 - particle.delay)));
    if (particleProgress <= 0) {
      return;
    }

    const particleAlpha = alpha * (1 - particleProgress * 0.78);
    const angle = particle.angle + particle.drift * particleProgress;
    const distance = radius * (0.34 + particle.distance * particleProgress);
    const x = xFromAngle(center, angle, distance);
    const y = yFromAngle(center, angle, distance);
    ctx.fillStyle = `rgba(${config.rgb}, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(2, state.viewSize * 0.004 * particle.size), 0, TAU);
    ctx.fill();
  });

  if (state.flash.kind === "miss") {
    ctx.strokeStyle = `rgba(${config.rgb}, ${alpha * 0.34})`;
    ctx.lineWidth = Math.max(5, state.viewSize * 0.008);
    ctx.beginPath();
    ctx.moveTo(center - radius * 0.16, center - radius * 0.16);
    ctx.lineTo(center + radius * 0.16, center + radius * 0.16);
    ctx.moveTo(center + radius * 0.16, center - radius * 0.16);
    ctx.lineTo(center - radius * 0.16, center + radius * 0.16);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = `rgba(${config.rgb}, ${alpha * 0.5})`;
  ctx.shadowBlur = state.flash.kind === "perfect" ? 18 : 10;
  ctx.fillStyle = `rgba(${config.rgb}, ${alpha})`;
  ctx.font = `950 ${Math.max(17, radius * 0.09 * config.scale)}px Inter, sans-serif`;
  ctx.fillText(state.flash.label, center, center - radius * config.lift);

  ctx.shadowBlur = 0;
  drawTextPlate(
    state.flash.scoreLabel,
    center,
    center - radius * (config.lift - 0.1),
    `900 ${Math.max(13, radius * 0.056)}px Inter, sans-serif`,
    `rgba(247, 248, 251, ${alpha * 0.96})`,
    alpha,
    Math.max(23, radius * 0.09)
  );

  if (state.flash.detailLabel) {
    drawTextPlate(
      state.flash.detailLabel,
      center,
      center - radius * (config.lift - 0.2),
      `800 ${Math.max(11, radius * 0.041)}px Inter, sans-serif`,
      `rgba(155, 167, 184, ${alpha * 0.92})`,
      alpha * 0.78,
      Math.max(19, radius * 0.072)
    );
  }

  ctx.restore();
}

function tick(timestamp) {
  const delta = state.lastTime ? Math.min((timestamp - state.lastTime) / 1000, 0.04) : 0;
  state.lastTime = timestamp;

  if (state.mode === "playing") {
    state.angle = normalizeAngle(state.angle + currentLevel().speed * delta);
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
ui.openBonusButton.addEventListener("click", openBonusWindow);
ui.closeBonusButton.addEventListener("click", closeBonusWindow);
ui.openResetButton.addEventListener("click", openResetWindow);
ui.closeResetButton.addEventListener("click", closeResetWindow);
ui.bonusDialog.addEventListener("click", (event) => {
  if (event.target === ui.bonusDialog) {
    closeBonusWindow();
  }
});
ui.resetDialog.addEventListener("click", (event) => {
  if (event.target === ui.resetDialog) {
    closeResetWindow();
  }
});
ui.difficultyButton.addEventListener("click", toggleDifficultyMenu);
ui.difficultyButton.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "Enter" || event.code === "Space") {
    event.preventDefault();
    openDifficultyMenu();
  }
});
ui.difficultyChoices.forEach((button) => {
  button.addEventListener("click", () => {
    selectDifficulty(button.dataset.difficulty);
  });
  button.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDifficultyMenu();
      ui.difficultyButton.focus();
    }
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

document.addEventListener("click", (event) => {
  if (!ui.difficultyPanel.contains(event.target)) {
    closeDifficultyMenu();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    if (event.target?.closest?.("button, [role='listbox']")) {
      return;
    }
    event.preventDefault();
    if (!event.repeat) {
      handleHit();
    }
  }

  if (event.key === "Escape") {
    closeDifficultyMenu();
  }

  if (event.key.toLowerCase() === "p" && !event.repeat) {
    togglePause();
  }

  if (event.key.toLowerCase() === "r" && !event.repeat) {
    startGame();
  }
});

window.addEventListener("resize", queueCanvasResize);

if ("ResizeObserver" in window) {
  new ResizeObserver(queueCanvasResize).observe(canvas);
}

resetCurrentRun();
syncCanvasSize();
requestAnimationFrame(tick);
