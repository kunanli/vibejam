// 純 DOM 更新與特效
import { state } from './state.js';

const $ = (id) => document.getElementById(id);

// 塔背景：圖層疊在漸層之上，圖檔 404 時自動只剩漸層（優雅退回）
export function initBackground() {
  const url = `${import.meta.env.BASE_URL}assets/bg/tower.png`;
  const grad = 'linear-gradient(180deg, #2a2150, #15112b)';
  const img = new Image();
  img.onload = () => {
    $('battle').querySelector('.stage').style.backgroundImage = `url("${url}"), ${grad}`;
  };
  img.src = url; // 失敗則不套用，維持原本漸層
}

export function showScreen(name) {
  $('battle').classList.toggle('hidden', name !== 'battle');
  $('reward').classList.toggle('hidden', name !== 'reward');
  $('overlay').classList.toggle('hidden', name !== 'overlay');
}

export function renderBattle() {
  const { player, enemy, floor } = state;
  $('floor-num').textContent = floor;

  const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
  $('player-hp-fill').style.width = hpPct + '%';
  $('player-hp-text').textContent = `${Math.max(0, Math.round(player.hp))}/${player.maxHp}`;

  if (enemy) {
    const slot = $('monster-art');
    if (enemy.img) {
      // 嘗試載入 Recraft 圖；載入失敗（檔案還沒放）自動退回 emoji
      slot.innerHTML = `<img class="monster-img" src="${enemy.img}" alt="${enemy.name}" onerror="this.parentNode.textContent='${enemy.art}'">`;
    } else {
      slot.textContent = enemy.art;
    }
    $('monster-name').textContent = enemy.name;
    const ehp = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
    $('enemy-hp-fill').style.width = ehp + '%';
    $('enemy-hp-text').textContent = `${Math.max(0, Math.round(enemy.hp))}/${enemy.maxHp}`;
  }
}

export function renderThreat() {
  const t = state.enemy ? Math.min(1, state.enemy.threat) : 0;
  const fill = $('threat-fill');
  fill.style.width = t * 100 + '%';
  fill.classList.toggle('danger', t > 0.7);
}

export function renderProblem() {
  $('problem').textContent = state.problem ? state.problem.text : '';
  const input = $('answer-input');
  input.value = '';
  input.focus();
}

export function renderCombo() {
  const banner = $('combo-banner');
  if (state.combo >= 2) {
    banner.textContent = `連擊 ×${state.combo}！`;
    banner.classList.add('show');
  } else {
    banner.classList.remove('show');
  }
}

export function renderHand() {
  const hand = $('hand');
  hand.innerHTML = '';
  for (const card of state.deck) {
    const el = document.createElement('div');
    el.className = `card rarity-${card.rarity}`;
    el.innerHTML = `<div class="card-art">${card.art}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>`;
    hand.appendChild(el);
  }
}

// 飄字傷害；數字越大越誇張
export function floatDamage(amount, crit) {
  const layer = $('float-layer');
  const el = document.createElement('div');
  el.className = 'float-dmg';
  if (amount >= 1000) el.classList.add('huge');
  else if (amount >= 200) el.classList.add('big');
  if (crit) el.classList.add('crit');
  el.textContent = (crit ? '暴擊 ' : '') + amount;
  el.style.left = 45 + Math.random() * 10 + '%';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

export function floatHeal(amount) {
  const layer = $('float-layer');
  const el = document.createElement('div');
  el.className = 'float-dmg heal';
  el.textContent = '+' + amount;
  el.style.left = 30 + Math.random() * 10 + '%';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

export function shake(intensity = 'normal') {
  const battle = $('battle');
  battle.classList.remove('shake', 'shake-big');
  void battle.offsetWidth; // reflow 重啟動畫
  battle.classList.add(intensity === 'big' ? 'shake-big' : 'shake');
}

// 玩家受擊：紅色全屏閃 + 不碰輸入框 focus / 內容
export function playerHit() {
  const battle = $('battle');
  battle.classList.remove('hurt');
  void battle.offsetWidth;
  battle.classList.add('hurt');
}

export function flashWrong() {
  const input = $('answer-input');
  input.classList.remove('wrong');
  void input.offsetWidth;
  input.classList.add('wrong');
}

export function showOverlay(title, sub, btnText) {
  $('overlay-title').textContent = title;
  $('overlay-sub').textContent = sub;
  $('overlay-btn').textContent = btnText;
  showScreen('overlay');
}

export function renderRewards(cards, onPick) {
  const wrap = $('reward-cards');
  wrap.innerHTML = '';
  cards.forEach((card) => {
    const el = document.createElement('div');
    el.className = `card reward-card rarity-${card.rarity}`;
    el.innerHTML = `<div class="card-art">${card.art}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>
      <div class="card-rarity">${card.rarity}</div>`;
    el.addEventListener('click', () => onPick(card));
    wrap.appendChild(el);
  });
}
