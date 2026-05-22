// 怪物生成 + 戰鬥數值

// 4 格循環，對應 Recraft 美術；emoji 為圖未載入時的備援
// 相對路徑：dev、GitHub Pages 子路徑、itch 根目錄皆可正確解析
const MONSTERS = [
  { name: '史萊姆', art: '🟢', img: './assets/monsters/slime.webp' },
  { name: '哥布林', art: '👺', img: './assets/monsters/goblin.webp' },
  { name: '骷髏兵', art: '💀', img: './assets/monsters/skeleton.webp' },
  { name: '塔之守衛', art: '🛡️', img: './assets/monsters/boss.webp' },
];

// 每層：雜魚(每層不同) → Boss(守衛)。共 MAX_LAYER*(MOBS_PER_LAYER+1) 場
const MOB_BY_LAYER = [MONSTERS[0], MONSTERS[1], MONSTERS[2]]; // L1史萊姆 L2哥布林 L3骷髏
const BOSS = MONSTERS[3];
export const MOBS_PER_LAYER = 1;                 // 每層雜魚數
export const BATTLES_PER_LAYER = MOBS_PER_LAYER + 1; // 雜魚 + Boss = 2（3 層共 6 隻）

// 全域戰鬥序（1..），決定難度
export function globalDiff(layer, idx) {
  return (layer - 1) * BATTLES_PER_LAYER + idx;
}

// layer:1起；idx:1起（idx>雜魚數即 Boss）
export function spawnEnemy(layer, idx) {
  const isBoss = idx > MOBS_PER_LAYER;
  const m = isBoss ? BOSS : MOB_BY_LAYER[(layer - 1) % MOB_BY_LAYER.length];
  const g = globalDiff(layer, idx);
  const hp = Math.round((30 + g * 30 + g * g * 7) * (isBoss ? 1.7 : 1));
  return { name: m.name, art: m.art, img: m.img, hp, maxHp: hp, isBoss };
}

export const BASE_CHIPS = 10;
