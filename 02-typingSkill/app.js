// Run after DOM is parsed (since we used defer), elements are available
// ---- Clock ----
setInterval(() => {
  const el = document.getElementById("clock");
  if (el) el.textContent = new Date().toLocaleTimeString();
}, 1000);

// ---- Elements ----
const box = document.getElementById("typingBox");
const timerEl = document.getElementById("timer");
const wps = document.getElementById("wps");
const cps = document.getElementById("cps");
const spm = document.getElementById("spm");

let start = null;
let timerLoop = null;

// ---- Helper: time formatting HH:MM:SS ----
function format(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// ---- Helper: reset timer only ----
function resetTimer() {
  start = null;
  clearInterval(timerLoop);
  timerLoop = null;
  timerEl.textContent = "00:00:00";
}

// ---- Counters (no regex) ----
function countWords(text) {
  let inside = false, words = 0;
  for (let c of text) {
    const sp = c === " " || c === "\n" || c === "\t";
    if (sp) inside = false;
    else if (!inside) { inside = true; words++; }
  }
  return words;
}

function countSentences(text) {
  let n = 0;
  for (let c of text) {
    if (c === "." || c === "!" || c === "?") n++;
  }
  return n;
}

// ---- Timer update ----
function updateTimer() {
  if (!start) return;
  const sec = Math.floor((new Date() - start) / 1000);
  timerEl.textContent = format(sec);
}

// ---- Stats update ----
function updateStats() {
  if (!start) return;

  const now = new Date();
  let sec = (now - start) / 1000;
  if (sec < 1) sec = 1; // stabilize very early readings

  const t = box.value;
  const words = countWords(t);
  const chars = t.length;
  const sens = countSentences(t);

  wps.textContent = (words / sec).toFixed(2);
  cps.textContent = (chars / sec).toFixed(2);
  spm.textContent = ((sens / sec) * 60).toFixed(2); // sentences per minute
}

// ---- Events ----
box.addEventListener("focus", () => {
  resetTimer();               // ensure a clean slate
  start = new Date();
  timerLoop = setInterval(() => {
    updateTimer();
    updateStats();
  }, 200);
});

box.addEventListener("blur", () => {
  clearInterval(timerLoop);
  timerLoop = null;
  // Optional: also freeze start so stray inputs don't compute
  // start = null;
  updateTimer();
  updateStats();
});

box.addEventListener("input", updateStats);

document.getElementById("resetBtn").addEventListener("click", () => {
  box.value = "";
  resetTimer();
  wps.textContent = "0";
  cps.textContent = "0";
  spm.textContent = "0";
  box.focus(); // will trigger focus handler and start a new session
});
