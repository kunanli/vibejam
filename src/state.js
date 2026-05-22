// 全域 run 狀態（Balatro 關卡制：限出牌/棄牌次數，無玩家血量）
export const HAND_SIZE = 7;
export const PLAYS = 5;     // 每隻怪可出牌次數
export const DISCARDS = 3;  // 每隻怪可棄牌次數

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
}
