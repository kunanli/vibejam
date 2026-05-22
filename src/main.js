import { state, resetRun } from './state.js';
import { makeProblem } from './math.js';
import { spawnEnemy, BASE_CHIPS } from './combat.js';
import { computeDamage, rollRewards, CARD_POOL } from './cards.js';
import * as R from './render.js';
import * as A from './audio.js';

let rafId = null;
let lastTick = 0;

// ---- 流程 ----
function startRun() {
  resetRun();
  // 起手送 1 張基本卡
  state.deck = [CARD_POOL.find((c) => c.id === 'sharp')];
  state.floor = 1;
  enterFloor();
}

function enterFloor() {
  state.phase = 'battle';
  state.combo = 0;
  state.enemy = spawnEnemy(state.floor);
  state.problem = makeProblem(state.floor);
  R.showScreen('battle');
  R.renderBattle();
  R.renderThreat();
  R.renderProblem();
  R.renderHand();
  R.renderCombo();
  R.monsterEnter();
  lastTick = performance.now();
  loop(lastTick);
}

function loop(now) {
  if (state.phase !== 'battle') return;
  const dt = (now - lastTick) / 1000;
  lastTick = now;

  const e = state.enemy;
  e.threat += e.threatRate * dt;
  if (e.threat >= 1) {
    enemyAttack();
  }
  R.renderThreat();
  rafId = requestAnimationFrame(loop);
}

function enemyAttack() {
  const e = state.enemy;
  e.threat = 0;
  state.combo = 0;
  state.player.hp -= e.attack;
  A.playHurt();
  R.shake('big');
  R.playerHit();
  // 重要：只更新 HP / 威脅 / 連擊，不重繪題目、不碰輸入框 focus 與半打的答案
  R.renderBattle();
  R.renderCombo();
  if (state.player.hp <= 0) {
    gameOver();
  }
}

function submitAnswer() {
  if (state.phase !== 'battle') return;
  const input = document.getElementById('answer-input');
  const raw = input.value.trim();
  if (raw === '') return;
  const val = Number(raw);

  if (Number.isNaN(val) || val !== state.problem.answer) {
    // 答錯：連擊歸零、無傷害、輕微威脅跳升
    state.combo = 0;
    state.enemy.threat = Math.min(1, state.enemy.threat + 0.12);
    A.playWrong();
    R.flashWrong();
    R.renderCombo();
    R.renderThreat();
    nextProblem();
    return;
  }

  // 答對（MVP 不含速度加成，只靠卡牌加值 × 連擊倍率滾雪球）
  state.combo += 1;
  const base = BASE_CHIPS;
  const { damage, heal, threatRelief, crit } = computeDamage(
    state.deck,
    state.problem.answer,
    state.combo,
    base
  );

  state.enemy.hp -= damage;
  state.enemy.threat = Math.max(0, state.enemy.threat - threatRelief);
  A.playHit(state.combo);
  if (crit) A.playCrit();
  R.floatDamage(damage, crit);
  R.shake(damage >= 200 ? 'big' : 'normal');

  if (heal > 0) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
    R.floatHeal(heal);
  }

  R.renderBattle();
  R.renderCombo();
  R.renderThreat();

  if (state.enemy.hp <= 0) {
    winFloor();
    return;
  }
  nextProblem();
}

function nextProblem() {
  state.problem = makeProblem(state.floor);
  R.renderProblem();
}

function winFloor() {
  state.phase = 'reward';
  cancelAnimationFrame(rafId);
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
  cancelAnimationFrame(rafId);
  R.showOverlay('你倒下了', `抵達第 ${state.floor} 層 · 持有 ${state.deck.length} 張卡牌`, '再爬一次');
}

// ---- 輸入 ----
function bindInput() {
  document.getElementById('answer-input').addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') submitAnswer();
  });
  document.getElementById('overlay-btn').addEventListener('click', () => {
    A.playClick();
    startRun();
  });
}

// ---- 啟動 ----
function boot() {
  bindInput();
  R.initBackground();
  R.showOverlay(
    '數塔 · Number Tower',
    '解數學就是攻擊，連對暴傷，集卡滾雪球。當心怪物的威脅條！',
    '進入塔'
  );
}

boot();
