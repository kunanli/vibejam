// 怪物生成 + 戰鬥數值

const MONSTERS = [
  { name: '史萊姆', art: '🟢' },
  { name: '蝙蝠', art: '🦇' },
  { name: '骷髏兵', art: '💀' },
  { name: '哥布林', art: '👺' },
  { name: '石像鬼', art: '🗿' },
  { name: '幽靈', art: '👻' },
  { name: '巨蛛', art: '🕷️' },
  { name: '惡魔', art: '👹' },
  { name: '巨龍', art: '🐉' },
];

// 依樓層生成怪物：HP / 威脅累積速率 / 攻擊力 隨層數膨脹
export function spawnEnemy(floor) {
  const m = MONSTERS[Math.min(floor - 1, MONSTERS.length - 1)];
  const isBoss = floor % 5 === 0;
  const hp = Math.round((40 + floor * 35 + floor * floor * 6) * (isBoss ? 1.8 : 1));
  return {
    name: isBoss ? `${m.name}王` : m.name,
    art: m.art,
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
