import { state, resetRun, HAND_SIZE, PLAYS, DISCARDS, MAX_FLOOR } from './state.js';
import { makeTarget, drawCard, evaluatePlay } from './math.js';
import { spawnEnemy } from './combat.js';
import { computeDamage, rollRewards, CARD_POOL } from './cards.js';
import * as R from './render.js';
import * as A from './audio.js';

const VERSION = 'v0.12.2 · 2026-05-22';

// 每打完一層的繪本故事（家長引導讀／語音朗讀）。img 可放 assets/story/pageN.webp，缺圖用 art emoji
const STORY = {
  1: { art: '🌱', img: './assets/story/page1.webp', text: '勇者爬上了數塔的第一層，黏呼呼的史萊姆被數字打敗了！再往上爬吧。' },
  2: { art: '🗝️', img: './assets/story/page2.webp', text: '第二層的哥布林也擋不住勇者的計算，牠丟下鑰匙逃走了。塔頂的守衛正在等著。' },
  3: { art: '🏆', img: './assets/story/page3.webp', text: '勇者打倒了塔頂的守衛，站上了數塔的最高處！你是最厲害的數字勇者！' },
};

let resolving = false; // 出牌飛行動畫進行中，忽略重複出牌

// ---- 流程 ----
function startRun() {
  resetRun();
  state.deck = [CARD_POOL.find((c) => c.id === 'sharp')]; // 起手 1 張 Joker
  state.floor = 1;
  enterFloor();
}

function enterFloor() {
  state.phase = 'battle';
  resolving = false;
  state.combo = 0;
  state.enemy = spawnEnemy(state.floor);
  state.hand = [];
  state.selected = new Set();
  state.playsLeft = PLAYS;
  state.discardsLeft = DISCARDS;
  refillHand();
  newTarget();
  R.showScreen('battle');
  R.setArenaBg(state.floor);
  R.renderDecor();
  R.renderBattle();
  R.renderJokers();
  R.renderHand(toggleCard);
  R.renderCombo();
  R.renderCounts();
  renderSelection();
  R.monsterEnter();
}

function newTarget() {
  state.target = makeTarget(state.floor);
  R.renderTarget();
}

function refillHand() {
  while (state.hand.length < HAND_SIZE) {
    state.hand.push({ id: state.nextCardId++, value: drawCard(state.floor) });
  }
}

function selectedValues() {
  return state.hand.filter((c) => state.selected.has(c.id)).map((c) => c.value);
}

// 即時預估（總和 / 倍率 / 傷害）
function renderSelection() {
  const vals = selectedValues();
  if (vals.length === 0) {
    R.renderSelection({ sum: 0, patternName: '×1', dmg: 0 });
    return;
  }
  const { sum, baseChips, pattern } = evaluatePlay(vals, state.target);
  const { damage } = computeDamage(state.deck, {
    answer: sum,
    combo: state.combo,
    baseChips,
    startMult: pattern.mult,
  });
  R.renderSelection({ sum, patternName: `×${pattern.mult}`, dmg: damage });
}

function toggleCard(id) {
  if (state.phase !== 'battle' || resolving) return;
  if (state.selected.has(id)) state.selected.delete(id);
  else state.selected.add(id);
  A.playClick();
  R.renderHand(toggleCard);
  R.renderCounts();
  renderSelection();
}

function playCards() {
  if (state.phase !== 'battle' || resolving || state.playsLeft <= 0) return;
  const used = state.hand.filter((c) => state.selected.has(c.id));
  if (used.length === 0) return;
  const vals = used.map((c) => c.value);
  const { sum, diff, exact, baseChips, pattern } = evaluatePlay(vals, state.target);

  // 連擊：剛好命中 +1；差太遠歸零；接近(≤2)維持
  if (exact) state.combo += 1;
  else if (diff > 2) state.combo = 0;

  const result = computeDamage(state.deck, {
    answer: sum,
    combo: state.combo,
    baseChips,
    startMult: pattern.mult,
  });
  const miss = diff > 2;

  const cardEls = [...document.querySelectorAll('#hand .numcard.selected')];

  resolving = true;
  state.playsLeft -= 1;
  state.hand = state.hand.filter((c) => !state.selected.has(c.id));
  state.selected = new Set();
  refillHand();
  R.renderHand(toggleCard);
  R.renderCounts();
  renderSelection();

  R.flyCardsToEnemy(cardEls, () => applyHit(result, exact, miss));
}

function applyHit(result, exact, miss) {
  resolving = false;
  if (state.phase !== 'battle') return;
  const { damage, crit } = result;

  state.enemy.hp -= damage;
  A.playHit(state.combo);
  if (exact) { A.playExact(); R.celebrate(); }
  else if (crit) A.playCrit();
  if (miss) { A.playWrong(); R.flashMiss(); }
  R.floatDamage(damage, exact || crit);
  R.shake(exact || damage >= 200 ? 'big' : 'normal');

  R.renderBattle();
  R.renderCombo();

  if (state.enemy.hp <= 0) { winFloor(); return; }
  if (state.playsLeft <= 0) { gameOver(); return; } // 出牌用完仍未打倒

  newTarget();
  renderSelection();
}

function discardCards() {
  if (state.phase !== 'battle' || resolving) return;
  if (state.discardsLeft <= 0 || state.selected.size === 0) return;
  state.discardsLeft -= 1;
  state.hand = state.hand.filter((c) => !state.selected.has(c.id));
  state.selected = new Set();
  refillHand();
  A.playClick();
  R.renderHand(toggleCard);
  R.renderCounts();
  renderSelection();
}

function winFloor() {
  A.playWin();
  const cleared = state.floor;
  state.phase = 'story';
  R.showStory(STORY[cleared], () => afterStory(cleared));
}

function afterStory(cleared) {
  if (cleared >= MAX_FLOOR) { victory(); return; } // 打完第 3 層破關
  state.phase = 'reward';
  const rewards = rollRewards(3);
  R.renderRewards(rewards, (card) => {
    A.playClick();
    state.deck.push(card);
    state.floor += 1;
    enterFloor();
  });
  R.showScreen('reward');
  R.speak('選一個作為你的獎勵吧');
}

function victory() {
  state.phase = 'gameover';
  R.showOverlay('🏆', '🗼✨', '🔄');
}

function gameOver() {
  state.phase = 'gameover';
  R.showOverlay('💀', `🗼 ${state.floor}/${MAX_FLOOR}`, '🔄');
}

// ---- 輸入 ----
function bindInput() {
  document.getElementById('play-btn').addEventListener('click', playCards);
  document.getElementById('discard-btn').addEventListener('click', discardCards);
  document.getElementById('overlay-btn').addEventListener('click', () => {
    A.playClick();
    startRun();
  });
  window.addEventListener('keydown', (ev) => {
    if (state.phase !== 'battle') return;
    if (ev.key === 'Enter') { playCards(); return; }
    if (ev.key === 'Backspace') {
      ev.preventDefault();
      state.selected = new Set();
      R.renderHand(toggleCard);
      R.renderCounts();
      renderSelection();
      return;
    }
    if (ev.key === 'd' || ev.key === 'D') { discardCards(); return; }
    // 數字鍵 1–7 切換對應手牌
    const n = parseInt(ev.key, 10);
    if (n >= 1 && n <= state.hand.length) toggleCard(state.hand[n - 1].id);
  });
}

function boot() {
  bindInput();
  document.getElementById('version').textContent = VERSION;
  R.showOverlay('數塔 🗼', '🗼 ▮▮▮  ·  🃏 ➕ 🟰 🎯 ➡️ 💥', '▶');
}

boot();
