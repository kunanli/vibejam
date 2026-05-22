// 純 DOM 更新與特效
import { state, MAX_LAYER } from './state.js';
import { BATTLES_PER_LAYER, MOBS_PER_LAYER } from './combat.js';

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
  for (let L = 1; L <= MAX_LAYER; L++) {
    const cls = L < state.layer ? 'done' : L === state.layer ? 'cur' : 'next';
    html += `<span class="tp-pip ${cls}">${L}</span>`;
  }
  // 本層戰鬥進度：雜魚 ● / Boss 👑
  html += '<span class="tp-dots">';
  for (let i = 1; i <= BATTLES_PER_LAYER; i++) {
    const st = i < state.battleInLayer ? 'd' : i === state.battleInLayer ? 'c' : 'n';
    html += `<span class="tp-dot ${st}">${i > MOBS_PER_LAYER ? '👑' : '●'}</span>`;
  }
  html += '</span>';
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

// 對外朗讀（給獎勵等畫面用）
export function speak(text) { readAloud(text); }

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
    const slot = $('monster-art');
    if (enemy.img) {
      const onerr = enemy.fallback
        ? `if(this.dataset.f){this.parentNode.textContent='${enemy.art}'}else{this.dataset.f=1;this.src='${enemy.fallback}'}`
        : `this.parentNode.textContent='${enemy.art}'`;
      slot.innerHTML = `<img class="sprite-img" src="${enemy.img}" alt="" onerror="${onerr}">`;
    } else {
      slot.textContent = enemy.art;
    }
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
  let dealIndex = 0;
  state.hand.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'numcard' + (state.selected.has(card.id) ? ' selected' : '');
    if (state.justDrawn.has(card.id)) {
      el.classList.add('deal');
      el.style.animationDelay = (dealIndex++ * 70) + 'ms';
    }
    el.innerHTML = `<span class="numcard-key">${i + 1}</span><span class="numcard-val">${card.value}</span>`;
    el.addEventListener('click', () => onToggle(card.id));
    hand.appendChild(el);
  });
  state.justDrawn.clear(); // 只播一次
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

// 怪物中心在 arena 內的百分比座標
function monsterCenterPct() {
  const aRect = document.querySelector('.arena').getBoundingClientRect();
  const mRect = $('monster-art').getBoundingClientRect();
  return {
    cx: ((mRect.left + mRect.width / 2) - aRect.left) / aRect.width * 100,
    cy: ((mRect.top + mRect.height / 2) - aRect.top) / aRect.height * 100,
  };
}

// 通用火花噴發
export function burst(cx, cy, count = 10, emojis = ['✨', '⭐']) {
  const layer = $('float-layer');
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.left = cx + '%';
    s.style.top = cy + '%';
    const ang = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 100;
    s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
    s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
    layer.appendChild(s);
    setTimeout(() => s.remove(), 720);
  }
}

// 怪物被打：白閃 + 後仰
export function monsterHit() {
  const m = $('monster-art');
  m.classList.remove('hit');
  void m.offsetWidth;
  m.classList.add('hit');
}

// 撞擊光環（怪物中心擴張）
export function impactRing(big) {
  const { cx, cy } = monsterCenterPct();
  const ring = document.createElement('div');
  ring.className = 'impact-ring' + (big ? ' big' : '');
  ring.style.left = cx + '%';
  ring.style.top = cy + '%';
  $('float-layer').appendChild(ring);
  setTimeout(() => ring.remove(), 500);
}

// 金光閃（命中目標用）
export function goldFlash() {
  const arena = document.querySelector('.arena');
  arena.classList.remove('flash');
  void arena.offsetWidth;
  arena.classList.add('flash');
}

// 攻擊命中組合：白閃後仰 + 光環 + 火花
export function hitEffect(exact, big) {
  monsterHit();
  impactRing(big || exact);
  const { cx, cy } = monsterCenterPct();
  burst(cx, cy, exact ? 16 : 7, exact ? ['✨', '⭐', '🌟'] : ['💥', '✨']);
}

// 短暫頓挫（大擊用）
export function hitstop() {
  const g = document.getElementById('game');
  g.classList.remove('hitstop');
  void g.offsetWidth;
  g.classList.add('hitstop');
  setTimeout(() => g.classList.remove('hitstop'), 120);
}

// canvas-confetti 包裝；未載入就靜默（火花仍在）
export function confettiBurst(kind) {
  const C = window.confetti;
  if (!C) return;
  if (kind === 'big') {
    C({ particleCount: 90, spread: 70, origin: { x: 0.15, y: 0.6 } });
    C({ particleCount: 90, spread: 70, origin: { x: 0.85, y: 0.6 } });
  } else if (kind === 'mid') {
    C({ particleCount: 70, spread: 80, origin: { y: 0.55 } });
  } else {
    C({ particleCount: 32, spread: 55, startVelocity: 32, origin: { y: 0.4 } });
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
      fly.style.transform = `translate(${dx}px, ${dy}px) scale(.35) rotate(${rot + 220}deg)`;
      fly.style.opacity = '0.12';
    }));
    // 拖曳殘影
    [90, 170, 250].forEach((t) => setTimeout(() => {
      const cur = fly.getBoundingClientRect();
      const gh = document.createElement('div');
      gh.className = 'fly-ghost';
      gh.textContent = fly.textContent;
      gh.style.left = cur.left + 'px';
      gh.style.top = cur.top + 'px';
      gh.style.width = r.width + 'px';
      gh.style.height = r.height + 'px';
      layer.appendChild(gh);
      setTimeout(() => gh.remove(), 240);
    }, t));
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

export function showOverlay(title, sub, btnText, cover) {
  const c = $('cover');
  const h1 = $('overlay-title');
  if (cover) {
    c.style.display = '';
    c.innerHTML = `<img class="cover-img" src="${cover}" alt="" onerror="this.parentNode.classList.add('noimg')">`
      + `<div class="cover-title">${title}</div>`;
    h1.style.display = 'none';
  } else {
    c.style.display = 'none';
    c.innerHTML = '';
    h1.style.display = '';
    h1.textContent = title;
  }
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
