const DURATIONS = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
const LABELS = { work: "作業セッション", short: "小休憩中", long: "長休憩中" };
const CYCLE_LENGTH = 4;
const RING_CIRCUMFERENCE = 565.48;

const app = document.querySelector(".app");
const timeEl = document.getElementById("time");
const sessionLabelEl = document.getElementById("sessionLabel");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const skipBtn = document.getElementById("skipBtn");
const ringProgress = document.querySelector(".ring-progress");
const modeTabs = document.querySelectorAll(".mode-tab");
const completedCountEl = document.getElementById("completedCount");
const totalMinutesEl = document.getElementById("totalMinutes");
const cycleDotsEl = document.getElementById("cycleDots");

let mode = "work";
let secondsLeft = DURATIONS.work;
let ticking = false;
let intervalId = null;
let workSessionsInCycle = Number(localStorage.getItem("pomodoro.cyclePos") || 0);

const stats = {
  completed: Number(localStorage.getItem("pomodoro.completed") || 0),
  totalMinutes: Number(localStorage.getItem("pomodoro.totalMinutes") || 0),
};

function renderDots() {
  cycleDotsEl.innerHTML = "";
  for (let i = 0; i < CYCLE_LENGTH; i++) {
    const dot = document.createElement("span");
    dot.className = "dot" + (i < workSessionsInCycle ? " filled" : "");
    cycleDotsEl.appendChild(dot);
  }
}

function renderStats() {
  completedCountEl.textContent = stats.completed;
  totalMinutesEl.textContent = stats.totalMinutes;
  renderDots();
}

function saveStats() {
  localStorage.setItem("pomodoro.completed", stats.completed);
  localStorage.setItem("pomodoro.totalMinutes", stats.totalMinutes);
  localStorage.setItem("pomodoro.cyclePos", workSessionsInCycle);
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateDisplay() {
  timeEl.textContent = formatTime(secondsLeft);
  sessionLabelEl.textContent = LABELS[mode];
  const progress = 1 - secondsLeft / DURATIONS[mode];
  ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);
  document.title = `${formatTime(secondsLeft)} - ${LABELS[mode]}`;
}

function setMode(newMode, resetTime = true) {
  mode = newMode;
  app.dataset.mode = mode;
  modeTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  if (resetTime) secondsLeft = DURATIONS[mode];
  updateDisplay();
}

function stopTicking() {
  ticking = false;
  clearInterval(intervalId);
  startBtn.textContent = "開始";
}

function tick() {
  secondsLeft -= 1;
  updateDisplay();
  if (secondsLeft <= 0) {
    handleSessionComplete();
  }
}

function handleSessionComplete() {
  stopTicking();
  chime();

  if (mode === "work") {
    stats.completed += 1;
    stats.totalMinutes += Math.round(DURATIONS.work / 60);
    workSessionsInCycle += 1;
    const nextMode = workSessionsInCycle >= CYCLE_LENGTH ? "long" : "short";
    if (workSessionsInCycle >= CYCLE_LENGTH) workSessionsInCycle = 0;
    saveStats();
    renderStats();
    setMode(nextMode);
  } else {
    setMode("work");
  }
}

function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) { /* audio unavailable */ }
}

startBtn.addEventListener("click", () => {
  if (ticking) {
    stopTicking();
    return;
  }
  ticking = true;
  startBtn.textContent = "一時停止";
  intervalId = setInterval(tick, 1000);
});

resetBtn.addEventListener("click", () => {
  stopTicking();
  secondsLeft = DURATIONS[mode];
  updateDisplay();
});

skipBtn.addEventListener("click", () => {
  stopTicking();
  secondsLeft = 0;
  handleSessionComplete();
});

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    stopTicking();
    setMode(tab.dataset.mode);
  });
});

setMode("work");
renderStats();
