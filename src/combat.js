// 怪物生成 + 戰鬥數值

// 4 格循環，對應 Recraft 美術；emoji 為圖未載入時的備援
// 相對路徑：dev、GitHub Pages 子路徑、itch 根目錄皆可正確解析
// 雜魚池（8 種，每場隨機抽，變化多）
const MOB_POOL = [
  { name: '史萊姆', art: '🟢', img: './assets/monsters/slime.webp' },
  { name: '哥布林', art: '👺', img: './assets/monsters/goblin.webp' },
  { name: '骷髏兵', art: '💀', img: './assets/monsters/skeleton.webp' },
  { name: '蝙蝠', art: '🦇', img: './assets/monsters/bat.webp' },
  { name: '蜘蛛', art: '🕷️', img: './assets/monsters/spider.webp' },
  { name: '幽靈', art: '👻', img: './assets/monsters/ghost.webp' },
  { name: '蘑菇怪', art: '🍄', img: './assets/monsters/mushroom.webp' },
  { name: '小惡魔', art: '👿', img: './assets/monsters/imp.webp' },
];
const BOSS = { name: '塔之守衛', art: '🛡️', img: './assets/monsters/boss.webp' };

// 每層：雜魚(從池隨機抽) → Boss(守衛)。共 MAX_LAYER*(MOBS_PER_LAYER+1) 場
export const MOBS_PER_LAYER = 1;                 // 每層雜魚數
export const BATTLES_PER_LAYER = MOBS_PER_LAYER + 1; // 雜魚 + Boss = 2（3 層共 6 隻）

// 全域戰鬥序（1..），決定難度
export function globalDiff(layer, idx) {
  return (layer - 1) * BATTLES_PER_LAYER + idx;
}

// layer:1起；idx:1起（idx>雜魚數即 Boss）
export function spawnEnemy(layer, idx) {
  const isBoss = idx > MOBS_PER_LAYER;
  const m = isBoss ? BOSS : MOB_POOL[Math.floor(Math.random() * MOB_POOL.length)];
  const g = globalDiff(layer, idx);
  const hp = Math.round((30 + g * 30 + g * g * 7) * (isBoss ? 1.7 : 1));
  // Boss 支援每層不同圖 boss{layer}.webp，缺圖回退到通用 boss.webp，再回退 emoji
  const img = isBoss ? `./assets/monsters/boss${layer}.webp` : m.img;
  const fallback = isBoss ? './assets/monsters/boss.webp' : null;
  return { name: m.name, art: m.art, img, fallback, hp, maxHp: hp, isBoss };
}

export const BASE_CHIPS = 10;
