// 純 DOM 更新與特效
import { state } from './state.js';

const $ = (id) => document.getElementById(id);

// 塔背景：圖層疊在漸層之上，圖檔 404 時自動只剩漸層（優雅退回）
export function initBackground() {
  const url = './assets/bg/tower.png';
  const grad = 'radial-gradient(circle at 70% 25%, #2f2660, #15112b)';
  const img = new Image();
  img.onload = () => {
    document.querySelector('.arena').style.backgroundImage = `url("${url}"), ${grad}`;
  };
  img.src = url; // 失敗則維持漸層
}

export function showScreen(name) {
  $('battle').classList.toggle('hidden', name !== 'battle');
  $('reward').classList.toggle('hidden', name !== 'reward');
  $('overlay').classList.toggle('hidden', name !== 'overlay');
}

function spriteHTML(slot, img, art, cls) {
  if (img) {
    slot.innerHTML = `<img class="${cls}" src="${img}" alt="" onerror="this.parentNode.textContent='${art}'">`;
  } else {
    slot.textContent = art;
  }
}

export function renderBattle() {
  const { player, enemy, floor } = state;
  $('floor-num').textContent = floor;

  const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
  $('player-hp-fill').style.width = hpPct + '%';
  $('player-hp-text').textContent = `${Math.max(0, Math.round(player.hp))}/${player.maxHp}`;
  spriteHTML($('player-art'), './assets/player/hero-back.png', '🧙', 'sprite-img');

  if (enemy) {
    spriteHTML($('monster-art'), enemy.img, enemy.art, 'sprite-img');
    $('monster-name').textContent = enemy.name;
    const ehp = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
    $('enemy-hp-fill').style.width = ehp + '%';
    $('enemy-hp-text').textContent = `${Math.max(0, Math.round(enemy.hp))}/${enemy.maxHp}`;
  }
}

export function renderTarget() {
  $('target-num').textContent = state.target;
}

// 怪物登場動畫
export function monsterEnter() {
  const m = $('monster-art');
  m.classList.remove('enter');
  void m.offsetWidth;
  m.classList.add('enter');
}

export function renderThreat() {
  const t = state.enemy ? Math.min(1, state.enemy.threat) : 0;
  const fill = $('threat-fill');
  fill.style.width = t * 100 + '%';
  fill.classList.toggle('danger', t > 0.7);
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

// 上方常駐 Joker 列（被動卡）
function jokerArtHTML(card) {
  const url = `./assets/cards/${card.id}.png`;
  return `<span class="joker-art"><img class="joker-img" src="${url}" alt="${card.name}"
    onerror="this.parentNode.textContent='${card.art}'"></span>`;
}

export function renderJokers() {
  const wrap = $('jokers');
  wrap.innerHTML = '';
  for (const card of state.deck) {
    const el = document.createElement('div');
    el.className = `joker rarity-${card.rarity}`;
    el.title = `${card.name}：${card.desc}`;
    el.innerHTML = jokerArtHTML(card);
    wrap.appendChild(el);
  }
}

// 數字手牌（可選取）；onToggle(id) 由 main 提供
export function renderHand(onToggle) {
  const hand = $('hand');
  hand.innerHTML = '';
  state.hand.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'numcard' + (state.selected.has(card.id) ? ' selected' : '');
    el.innerHTML = `<span class="numcard-key">${i + 1}</span><span class="numcard-val">${card.value}</span>`;
    el.addEventListener('click', () => onToggle(card.id));
    hand.appendChild(el);
  });
}

// 選牌即時資訊：總和 / 牌型 / 預估傷害（由 main 算好傳入）
export function renderSelection({ sum, patternName, dmg }) {
  $('sel-sum').textContent = sum;
  $('sel-pattern').textContent = patternName;
  $('sel-dmg').textContent = dmg;
}

// 飄字傷害（浮在敵人上方）
export function floatDamage(amount, crit) {
  const layer = $('float-layer');
  const el = document.createElement('div');
  el.className = 'float-dmg';
  if (amount >= 1000) el.classList.add('huge');
  else if (amount >= 200) el.classList.add('big');
  if (crit) el.classList.add('crit');
  el.textContent = (crit ? '暴擊 ' : '') + amount;
  el.style.left = 58 + Math.random() * 14 + '%';
  el.style.top = 28 + Math.random() * 10 + '%';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

export function floatHeal(amount) {
  const layer = $('float-layer');
  const el = document.createElement('div');
  el.className = 'float-dmg heal';
  el.textContent = '+' + amount;
  el.style.left = 18 + Math.random() * 10 + '%';
  el.style.top = 60 + Math.random() * 8 + '%';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

export function shake(intensity = 'normal') {
  const battle = $('battle');
  battle.classList.remove('shake', 'shake-big');
  void battle.offsetWidth;
  battle.classList.add(intensity === 'big' ? 'shake-big' : 'shake');
}

// 玩家受擊：全屏紅閃
export function playerHit() {
  const battle = $('battle');
  battle.classList.remove('hurt');
  void battle.offsetWidth;
  battle.classList.add('hurt');
}

// 出牌飛向敵人：選中的數字牌從手牌位置飛到怪物 sprite 中心，結束呼叫 onArrive
export function flyCardsToEnemy(cardEls, onArrive) {
  const DUR = 340;
  const target = $('monster-art').getBoundingClientRect();
  const tx = target.left + target.width / 2;
  const ty = target.top + target.height / 2;

  let layer = $('fly-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'fly-layer';
    document.body.appendChild(layer);
  }

  if (!cardEls.length) { setTimeout(onArrive, 0); return; }

  cardEls.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const fly = document.createElement('div');
    fly.className = 'fly-card';
    fly.textContent = el.querySelector('.numcard-val')?.textContent ?? '';
    fly.style.left = r.left + 'px';
    fly.style.top = r.top + 'px';
    fly.style.width = r.width + 'px';
    fly.style.height = r.height + 'px';
    layer.appendChild(fly);
    const dx = tx - (r.left + r.width / 2);
    const dy = ty - (r.top + r.height / 2);
    const rot = (i - cardEls.length / 2) * 14;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fly.style.transform = `translate(${dx}px, ${dy}px) scale(.35) rotate(${rot}deg)`;
      fly.style.opacity = '0.15';
    }));
    setTimeout(() => fly.remove(), DUR + 80);
  });
  setTimeout(onArrive, DUR);
}

// 差太遠：出牌列閃一下提示
export function flashMiss() {
  const bar = $('play-bar');
  bar.classList.remove('miss');
  void bar.offsetWidth;
  bar.classList.add('miss');
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
    const url = `./assets/cards/${card.id}.png`;
    const el = document.createElement('div');
    el.className = `card reward-card rarity-${card.rarity}`;
    el.innerHTML = `<div class="card-art"><img class="card-img" src="${url}" alt="${card.name}"
        onerror="this.parentNode.textContent='${card.art}'"></div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>
      <div class="card-rarity">${card.rarity}</div>`;
    el.addEventListener('click', () => onPick(card));
    wrap.appendChild(el);
  });
}
