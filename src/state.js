// 全域 run 狀態（Balatro 關卡制：限出牌/棄牌次數，無玩家血量）
export const HAND_SIZE = 5;  // 初始手牌（變少 → 較難湊到目標）
export const PLAYS = 4;      // 每隻怪可出牌次數（變少 → 較難）
export const DISCARDS = 3;   // 每隻怪可棄牌次數
export const MAX_FLOOR = 3; // 一座塔 3 層，打完破關

export const state = {
  phase: 'title', // title | battle | reward | gameover
  floor: 1,
  combo: 0,
  deck: [], // 持有的被動 Joker 卡
  enemy: null, // { name, art, img, hp, maxHp, isBoss }
  target: 0, // 本手目標數
  hand: [], // 數字手牌 [{ id, value }]
  selected: new Set(), // 已選取的手牌 id
  nextCardId: 1,
  playsLeft: PLAYS,
  discardsLeft: DISCARDS,
  justDrawn: new Set(), // 本次新抽到的手牌 id（給發牌動畫）
};

export function resetRun() {
  state.phase = 'title';
  state.floor = 1;
  state.combo = 0;
  state.deck = [];
  state.enemy = null;
  state.target = 0;
  state.hand = [];
  state.selected = new Set();
  state.nextCardId = 1;
  state.playsLeft = PLAYS;
  state.discardsLeft = DISCARDS;
  state.justDrawn = new Set();
}
