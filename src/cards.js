// Balatro 風被動修正器卡牌
// apply(ctx) 在每次答對結算時呼叫，可改 ctx.chips / ctx.mult / ctx.heal / ctx.threatRelief

export const CARD_POOL = [
  {
    id: 'sharp',
    name: '利刃',
    art: '🗡️',
    symbol: '+12',
    rarity: 'common',
    desc: '基礎傷害 +12',
    apply: (ctx) => { ctx.chips += 12; },
  },
  {
    id: 'twin',
    name: '雙倍咒',
    art: '✨',
    symbol: '×2',
    rarity: 'common',
    desc: '倍率 ×2',
    apply: (ctx) => { ctx.mult *= 2; },
  },
  {
    id: 'even',
    name: '偶數圖騰',
    art: '🔵',
    symbol: '🔵×3',
    rarity: 'common',
    desc: '答案為偶數時 ×3',
    apply: (ctx) => { if (ctx.answer % 2 === 0) ctx.mult *= 3; },
  },
  {
    id: 'odd',
    name: '奇數圖騰',
    art: '🔺',
    symbol: '🔺×3',
    rarity: 'common',
    desc: '答案為奇數時 ×3',
    apply: (ctx) => { if (ctx.answer % 2 === 1) ctx.mult *= 3; },
  },
  {
    id: 'streak',
    name: '連擊核心',
    art: '🔥',
    symbol: '🔥▲',
    rarity: 'rare',
    desc: '連擊倍率再翻倍',
    apply: (ctx) => { ctx.mult *= Math.max(1, 1 + ctx.combo * 0.2); },
  },
  {
    id: 'bigchip',
    name: '巨型晶片',
    art: '💎',
    symbol: '+40',
    rarity: 'rare',
    desc: '基礎傷害 +40',
    apply: (ctx) => { ctx.chips += 40; },
  },
  {
    id: 'echo',
    name: '答案回響',
    art: '🌀',
    symbol: '+#',
    rarity: 'rare',
    desc: '基礎傷害 +（答案值）',
    apply: (ctx) => { ctx.chips += Math.abs(ctx.answer); },
  },
  {
    id: 'vamp',
    name: '尖牙',
    art: '🦷',
    symbol: '+25',
    rarity: 'common',
    desc: '基礎傷害 +25',
    apply: (ctx) => { ctx.chips += 25; },
  },
  {
    id: 'calm',
    name: '幸運草',
    art: '🍀',
    symbol: '×1.5',
    rarity: 'common',
    desc: '倍率 ×1.5',
    apply: (ctx) => { ctx.mult *= 1.5; },
  },
  {
    id: 'crit',
    name: '暴擊寶珠',
    art: '⚡',
    symbol: '⚡×5',
    rarity: 'rare',
    desc: '25% 機率倍率 ×5',
    apply: (ctx) => { if (Math.random() < 0.25) { ctx.mult *= 5; ctx.crit = true; } },
  },
];

// 連擊倍率：連對越多越高
export function comboMult(combo) {
  return 1 + combo * 0.25;
}

// 結算傷害：套用所有持有 Joker；startMult 來自牌型倍率
export function computeDamage(deck, { answer, combo, baseChips, startMult = 1 }) {
  const ctx = {
    chips: baseChips,
    mult: comboMult(combo) * startMult,
    answer,
    combo,
    heal: 0,
    crit: false,
  };
  for (const card of deck) card.apply(ctx);
  const damage = Math.max(1, Math.round(ctx.chips * ctx.mult));
  return { damage, heal: ctx.heal, crit: ctx.crit };
}

// 隨機抽 n 張不重複（可重複持有，純隨機）卡牌作為獎勵
export function rollRewards(n) {
  const pool = [...CARD_POOL];
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}
