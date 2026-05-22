import { state, resetRun, HAND_SIZE } from './state.js';
import { makeTarget, drawCard, evaluatePlay } from './math.js';
import { spawnEnemy } from './combat.js';
import { computeDamage, rollRewards, CARD_POOL } from './cards.js';
import * as R from './render.js';
import * as A from './audio.js';

const VERSION = 'v0.7.0 · 2026-05-22';

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
  refillHand();
  newTarget();
  R.showScreen('battle');
  R.renderBattle();
  R.renderThreat();
  R.renderJokers();
  R.renderHand(toggleCard);
  R.renderCombo();
  renderSelection();
  R.monsterEnter();
  R.setNarration('');
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

// 目前選中的牌值
function selectedValues() {
  return state.hand.filter((c) => state.selected.has(c.id)).map((c) => c.value);
}

// 即時預估（總和 / 牌型 / 傷害）
function renderSelection() {
  const vals = selectedValues();
  if (vals.length === 0) {
    R.renderSelection({ sum: 0, patternName: '—', dmg: 0 });
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
  if (state.phase !== 'battle') return;
  if (state.selected.has(id)) state.selected.delete(id);
  else state.selected.add(id);
  A.playClick();
  R.renderHand(toggleCard);
  renderSelection();
}

// 偏回合：每出一手後敵人行動，蓄力滿了才攻擊
function enemyTurn() {
  const e = state.enemy;
  e.threat += e.charge;
  if (e.threat >= 1) {
    e.threat = 0;
    state.combo = 0;
    state.player.hp -= e.attack;
    A.playHurt();
    R.shake('big');
    R.playerHit();
    R.setNarration('💥');
    if (state.player.hp <= 0) { R.renderBattle(); gameOver(); return; }
  } else {
    R.setNarration('⚡');
  }
  R.renderThreat();
  R.renderBattle();
  R.renderCombo();
}

function playCards() {
  if (state.phase !== 'battle' || resolving) return;
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

  // 抓選中牌的 DOM（飛行用），趁重繪前
  const cardEls = [...document.querySelectorAll('#hand .numcard.selected')];

  resolving = true;
  // 用掉的牌離手、補牌、重繪（牌飛出時手牌即更新）
  state.hand = state.hand.filter((c) => !state.selected.has(c.id));
  state.selected = new Set();
  refillHand();
  R.renderHand(toggleCard);
  renderSelection();

  // 飛到敵人才結算傷害
  R.flyCardsToEnemy(cardEls, () => applyHit(result, exact, miss));
}

function applyHit(result, exact, miss) {
  resolving = false;
  if (state.phase !== 'battle') return; // 動畫途中已換場
  const { damage, heal, crit, threatRelief } = result;

  state.enemy.hp -= damage;
  if (threatRelief > 0) state.enemy.threat = Math.max(0, state.enemy.threat - threatRelief);
  A.playHit(state.combo);
  if (exact || crit) A.playCrit();
  if (miss) { A.playWrong(); R.flashMiss(); }
  R.floatDamage(damage, exact || crit);
  R.shake(damage >= 200 ? 'big' : 'normal');

  if (heal > 0) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
    R.floatHeal(heal);
  }

  R.renderBattle();
  R.renderCombo();

  if (state.enemy.hp <= 0) { winFloor(); return; }

  // 敵人這一手才行動
  enemyTurn();
  if (state.phase !== 'battle') return; // 玩家倒下
  newTarget();
  renderSelection();
}

function winFloor() {
  state.phase = 'reward';
  A.playWin();
  const rewards = rollRewards(3);
  R.renderRewards(rewards, (card) => {
    A.playClick();
    state.deck.push(card);
    state.floor += 1;
    enterFloor();
  });
  R.showScreen('reward');
}

function gameOver() {
  state.phase = 'gameover';
  R.showOverlay('💀', `🗼 ${state.floor}`, '🔄');
}

// ---- 輸入 ----
function bindInput() {
  document.getElementById('play-btn').addEventListener('click', playCards);
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
      renderSelection();
      return;
    }
    // 數字鍵 1–7 切換對應手牌
    const n = parseInt(ev.key, 10);
    if (n >= 1 && n <= state.hand.length) toggleCard(state.hand[n - 1].id);
  });
}

function boot() {
  bindInput();
  R.initBackground();
  document.getElementById('version').textContent = VERSION;
  R.showOverlay('數塔', '🃏 ➕ 🟰 🎯 ➡️ 💥', '▶');
}

boot();
