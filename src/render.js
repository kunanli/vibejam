// 純 DOM 更新與特效
import { state, MAX_FLOOR } from './state.js';

const $ = (id) => document.getElementById(id);

// 每層背景：載入 assets/bg/floorN.webp（疊一層暗罩保可讀性），缺圖維持 CSS 漸層
export function setArenaBg(floor) {
  const arena = document.querySelector('.arena');
  arena.style.backgroundImage = ''; // 先回到 CSS 預設漸層
  const url = `./assets/bg/floor${floor}.webp`;
  const img = new Image();
  img.onload = () => {
    arena.style.backgroundImage =
      `linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.6)), url("${url}")`;
    arena.style.backgroundSize = 'cover';
    arena.style.backgroundPosition = 'center';
  };
  img.src = url;
}

// 塔層進度（左上）：🗼 + 三格，已過綠、當前金色脈動、未到灰
export function renderProgress() {
  const wrap = $('tower-progress');
  let html = '<span class="tp-ico">🗼</span>';
  for (let i = 1; i <= MAX_FLOOR; i++) {
    const cls = i < state.floor ? 'done' : i === state.floor ? 'cur' : 'next';
    html += `<span class="tp-pip ${cls}">${i}</span>`;
  }
  wrap.innerHTML = html;
}

// 場景點綴（草等小素材）：沿地面散佈，缺圖自動移除
export function renderDecor() {
  const d = $('decor');
  d.innerHTML = '';
  const url = './assets/props/grass.webp';
  const spots = [5, 20, 38, 60, 78, 93];
  spots.forEach((x, i) => {
    const g = document.createElement('img');
    g.className = 'decor-grass';
    g.style.left = x + '%';
    g.style.setProperty('--s', (0.7 + (i % 3) * 0.28).toFixed(2));
    g.onerror = () => g.remove();
    g.src = url;
    d.appendChild(g);
  });
}

export function showScreen(name) {
  $('battle').classList.toggle('hidden', name !== 'battle');
  $('reward').classList.toggle('hidden', name !== 'reward');
  $('overlay').classList.toggle('hidden', name !== 'overlay');
  $('story').classList.toggle('hidden', name !== 'story');
}

// 語音朗讀（中文），失敗就靜默
function readAloud(text) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW';
    u.rate = 0.9;
    synth.speak(u);
  } catch (e) { /* 不支援就算了 */ }
}

// 繪本故事頁：插圖 + 文字 + 🔊朗讀 + ▶繼續
export function showStory(page, onNext) {
  const illus = $('story-illus');
  if (page.img) {
    illus.innerHTML = `<img class="story-img" src="${page.img}" alt="" onerror="this.parentNode.textContent='${page.art}'">`;
  } else {
    illus.textContent = page.art;
  }
  $('story-text').textContent = page.text;
  $('story-read').onclick = () => readAloud(page.text);
  $('story-next').onclick = () => { try { window.speechSynthesis.cancel(); } catch (e) {} onNext(); };
  showScreen('story');
  readAloud(page.text); // 進場自動讀一次
}

function spriteHTML(slot, img, art, cls) {
  if (img) {
    slot.innerHTML = `<img class="${cls}" src="${img}" alt="" onerror="this.parentNode.textContent='${art}'">`;
  } else {
    slot.textContent = art;
  }
}

export function renderBattle() {
  const { enemy } = state;
  renderProgress();
  if (enemy) {
    spriteHTML($('monster-art'), enemy.img, enemy.art, 'sprite-img');
    $('enemy-remain').textContent = Math.max(0, Math.round(enemy.hp)); // 還需傷害
  }
}

export function renderTarget() {
  $('target-num').textContent = state.target;
}

// 剩餘出牌 / 棄牌次數，0 時鈕變灰
export function renderCounts() {
  $('plays-left').textContent = state.playsLeft;
  $('discards-left').textContent = state.discardsLeft;
  $('play-btn').classList.toggle('disabled', state.playsLeft <= 0);
  $('discard-btn').classList.toggle('disabled', state.discardsLeft <= 0 || state.selected.size === 0);
}

// 怪物登場動畫
export function monsterEnter() {
  const m = $('monster-art');
  m.classList.remove('enter');
  void m.offsetWidth;
  m.classList.add('enter');
}

export function renderCombo() {
  const banner = $('combo-banner');
  if (state.combo >= 2) {
    banner.textContent = `🔥×${state.combo}`;
    banner.classList.add('show');
  } else {
    banner.classList.remove('show');
  }
}

// 上方常駐 Joker 列（被動卡）
function jokerArtHTML(card) {
  const url = `./assets/cards/joker-${card.id}.webp`;
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
    el.innerHTML = `${jokerArtHTML(card)}<span class="joker-sym">${card.symbol}</span>`;
    wrap.appendChild(el);
  }
}

// 數字手牌（可選取）；onToggle(id) 由 main 提供
export function renderHand(onToggle) {
  const hand = $('hand');
  hand.classList.toggle('hint', state.selected.size === 0); // 沒選牌時輕輕脈動提示點牌
  hand.innerHTML = '';
  state.hand.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'numcard' + (state.selected.has(card.id) ? ' selected' : '');
    el.innerHTML = `<span class="numcard-key">${i + 1}</span><span class="numcard-val">${card.value}</span>`;
    el.addEventListener('click', () => onToggle(card.id));
    hand.appendChild(el);
  });
}

// 選牌即時資訊：總和 / 牌型 / 預估傷害；命中目標時亮綠 + 出牌鈕脈動
export function renderSelection({ sum, patternName, dmg }) {
  $('sel-sum').textContent = sum;
  $('sel-pattern').textContent = patternName;
  $('sel-dmg').textContent = dmg;
  const hit = sum === state.target && sum > 0;
  $('sum-box').classList.toggle('hit', hit);
  $('play-btn').classList.toggle('ready', hit && state.playsLeft > 0);
}

// 命中目標慶祝：金光閃 + 怪物周圍噴星星
export function celebrate() {
  const arena = document.querySelector('.arena');
  arena.classList.remove('flash');
  void arena.offsetWidth;
  arena.classList.add('flash');

  const layer = $('float-layer');
  const aRect = arena.getBoundingClientRect();
  const mRect = $('monster-art').getBoundingClientRect();
  const cx = ((mRect.left + mRect.width / 2) - aRect.left) / aRect.width * 100;
  const cy = ((mRect.top + mRect.height / 2) - aRect.top) / aRect.height * 100;
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    s.textContent = Math.random() < 0.5 ? '✨' : '⭐';
    s.style.left = cx + '%';
    s.style.top = cy + '%';
    const ang = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 90;
    s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
    s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
    layer.appendChild(s);
    setTimeout(() => s.remove(), 720);
  }
}

// 飄字傷害（浮在敵人上方）
export function floatDamage(amount, crit) {
  const layer = $('float-layer');
  const el = document.createElement('div');
  el.className = 'float-dmg';
  if (amount >= 1000) el.classList.add('huge');
  else if (amount >= 200) el.classList.add('big');
  if (crit) el.classList.add('crit');
  el.textContent = amount;
  el.style.left = 42 + Math.random() * 16 + '%';
  el.style.top = 20 + Math.random() * 10 + '%';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

export function shake(intensity = 'normal') {
  const battle = $('battle');
  battle.classList.remove('shake', 'shake-big');
  void battle.offsetWidth;
  battle.classList.add(intensity === 'big' ? 'shake-big' : 'shake');
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
    const url = `./assets/cards/joker-${card.id}.webp`;
    const el = document.createElement('div');
    el.className = `card reward-card rarity-${card.rarity}`;
    el.title = `${card.name}：${card.desc}`;
    el.innerHTML = `<div class="card-art"><img class="card-img" src="${url}" alt="${card.name}"
        onerror="this.parentNode.textContent='${card.art}'"></div>
      <div class="card-symbol">${card.symbol}</div>`;
    el.addEventListener('click', () => onPick(card));
    wrap.appendChild(el);
  });
}
