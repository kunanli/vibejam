// 怪物生成 + 戰鬥數值

// 4 格循環，對應 Recraft 美術；emoji 為圖未載入時的備援
// 相對路徑：dev、GitHub Pages 子路徑、itch 根目錄皆可正確解析
const MONSTERS = [
  { name: '史萊姆', art: '🟢', img: './assets/monsters/slime.webp' },
  { name: '哥布林', art: '👺', img: './assets/monsters/goblin.webp' },
  { name: '骷髏兵', art: '💀', img: './assets/monsters/skeleton.webp' },
  { name: '塔之守衛', art: '🛡️', img: './assets/monsters/boss.webp' },
];

// 3 層塔：L1 史萊姆、L2 哥布林、L3 守衛(Boss)；HP 隨層膨脹（無攻擊，Balatro 關卡制）
const TOWER = [MONSTERS[0], MONSTERS[1], MONSTERS[3]];
export function spawnEnemy(floor) {
  const idx = Math.min(floor - 1, TOWER.length - 1);
  const isBoss = idx === TOWER.length - 1; // 第 3 層＝Boss
  const m = TOWER[idx];
  const hp = Math.round((40 + floor * 35 + floor * floor * 6) * (isBoss ? 1.8 : 1));
  return {
    name: m.name,
    art: m.art,
    img: m.img,
    hp,
    maxHp: hp,
    isBoss,
  };
}

// 基礎 chips（含速度加成由外部加）
export const BASE_CHIPS = 10;
