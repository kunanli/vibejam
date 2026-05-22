// 全域 run 狀態
export const HAND_SIZE = 7;

export const state = {
  phase: 'title', // title | battle | reward | gameover
  floor: 1,
  player: { hp: 100, maxHp: 100 },
  combo: 0, // 連擊數（剛好命中累積，差太多歸零）
  deck: [], // 持有的被動 Joker 卡
  enemy: null, // { name, art, img, hp, maxHp, threat, threatRate, attack }
  target: 0, // 本手的目標數
  hand: [], // 數字手牌 [{ id, value }]
  selected: new Set(), // 已選取的手牌 id
  nextCardId: 1,
  lastDamage: 0,
};

export function resetRun() {
  state.phase = 'title';
  state.floor = 1;
  state.player = { hp: 100, maxHp: 100 };
  state.combo = 0;
  state.deck = [];
  state.enemy = null;
  state.target = 0;
  state.hand = [];
  state.selected = new Set();
  state.nextCardId = 1;
  state.lastDamage = 0;
}
