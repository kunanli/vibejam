// 怪物生成 + 戰鬥數值

// 4 格循環，對應 Recraft 美術；emoji 為圖未載入時的備援
// 相對路徑：dev、GitHub Pages 子路徑、itch 根目錄皆可正確解析
const MONSTERS = [
  { name: '史萊姆', art: '🟢', img: './assets/monsters/slime.png' },
  { name: '哥布林', art: '👺', img: './assets/monsters/goblin.png' },
  { name: '骷髏兵', art: '💀', img: './assets/monsters/skeleton.png' },
  { name: '塔之守衛', art: '🛡️', img: './assets/monsters/boss-guardian.png' },
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
    threat: 0, // 蓄力 0..1
    charge: Math.min(0.6, (0.34 + floor * 0.02) * (isBoss ? 1.25 : 1)), // 每出一手累積；滿了攻擊
    attack: Math.round((6 + floor * 3) * (isBoss ? 1.5 : 1)),
    isBoss,
  };
}

// 基礎 chips（含速度加成由外部加）
export const BASE_CHIPS = 10;
