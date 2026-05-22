// 怪物生成 + 戰鬥數值

// 4 格循環，對應 Recraft 美術；emoji 為圖未載入時的備援
// 用 BASE_URL 組路徑，GitHub Pages 子路徑與 itch 根目錄皆正確
const B = import.meta.env.BASE_URL;
const MONSTERS = [
  { name: '史萊姆', art: '🟢', img: `${B}assets/monsters/slime.png` },
  { name: '哥布林', art: '👺', img: `${B}assets/monsters/goblin.png` },
  { name: '骷髏兵', art: '💀', img: `${B}assets/monsters/skeleton.png` },
  { name: '塔之守衛', art: '🛡️', img: `${B}assets/monsters/boss-guardian.png` },
];

// 依樓層生成怪物：每 4 層為 Boss（守衛），HP / 威脅速率 / 攻擊隨層膨脹
export function spawnEnemy(floor) {
  const idx = (floor - 1) % MONSTERS.length;
  const isBoss = idx === MONSTERS.length - 1; // 第 4 格＝Boss
  const cycle = Math.floor((floor - 1) / MONSTERS.length); // 第幾輪（0 起算）
  const m = MONSTERS[idx];
  const hp = Math.round((40 + floor * 35 + floor * floor * 6) * (isBoss ? 1.8 : 1));
  return {
    name: cycle > 0 && isBoss ? `${m.name} +${cycle}` : m.name,
    art: m.art,
    img: m.img,
    hp,
    maxHp: hp,
    threat: 0, // 0..1
    threatRate: (0.10 + floor * 0.012) * (isBoss ? 1.25 : 1), // 每秒累積
    attack: Math.round((6 + floor * 3) * (isBoss ? 1.5 : 1)),
    isBoss,
  };
}

// 基礎 chips（含速度加成由外部加）
export const BASE_CHIPS = 10;
