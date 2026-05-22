// 用 WebAudio 合成音效，無需音檔，第一個使用者手勢後自動啟用
let ctx = null;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function blip({ freq = 440, dur = 0.12, type = 'square', vol = 0.18, slideTo = null }) {
  const c = ac();
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur);
}

// 答對：音高隨連擊升高（滾雪球的聽覺回饋）
export function playHit(combo) {
  const freq = Math.min(1400, 420 + combo * 55);
  blip({ freq, slideTo: freq * 1.5, dur: 0.1, type: 'triangle', vol: 0.16 });
}

// 暴擊：再補一聲高亢和聲
export function playCrit() {
  blip({ freq: 1200, slideTo: 1800, dur: 0.18, type: 'square', vol: 0.2 });
}

// 命中目標：三連升音小慶祝
export function playExact() {
  const notes = [660, 990, 1480];
  notes.forEach((f, i) => setTimeout(() => blip({ freq: f, dur: 0.12, type: 'triangle', vol: 0.2 }), i * 70));
}

// 答錯：低沉下滑
export function playWrong() {
  blip({ freq: 240, slideTo: 110, dur: 0.22, type: 'sawtooth', vol: 0.15 });
}

// 受擊：悶響
export function playHurt() {
  blip({ freq: 140, slideTo: 70, dur: 0.3, type: 'square', vol: 0.22 });
}

// 過關小號角
export function playWin() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((f, i) => setTimeout(() => blip({ freq: f, dur: 0.16, type: 'triangle', vol: 0.18 }), i * 90));
}

// 按鈕 / 選卡
export function playClick() {
  blip({ freq: 660, dur: 0.07, type: 'square', vol: 0.14 });
}
