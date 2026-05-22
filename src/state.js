// 全域 run 狀態
export const state = {
  phase: 'title', // title | battle | reward | gameover
  floor: 1,
  player: { hp: 100, maxHp: 100 },
  combo: 0, // 連擊數（答錯歸零）
  deck: [], // 持有的卡牌（被動修正器）
  enemy: null, // { name, art, hp, maxHp, threat, threatRate, attack }
  problem: null, // { text, answer, bornAt }
  lastDamage: 0,
};

export function resetRun() {
  state.phase = 'title';
  state.floor = 1;
  state.player = { hp: 100, maxHp: 100 };
  state.combo = 0;
  state.deck = [];
  state.enemy = null;
  state.problem = null;
  state.lastDamage = 0;
}
