// v2 玩法核心：發數字牌、湊目標數、牌型判定

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 牌值上限隨樓層提升
function cardMax(floor) {
  return Math.min(20, 9 + Math.floor((floor - 1) / 2));
}

// 抽一張數字牌（無限牌池）
export function drawCard(floor) {
  return randInt(1, cardMax(floor));
}

// 本手目標數：隨樓層變大，落在「數張手牌可湊到」的範圍
export function makeTarget(floor) {
  const base = 12 + floor * 4;
  return randInt(base, base + 10 + floor * 2);
}

// 牌型偵測：取最佳單一牌型（values 為選中的牌值陣列）
export function detectPattern(values) {
  const n = values.length;
  if (n === 0) return { name: '—', mult: 1 };

  const counts = {};
  for (const v of values) counts[v] = (counts[v] || 0) + 1;
  const maxSame = Math.max(...Object.values(counts));

  // 順子：相異值排序後連續
  const uniq = [...new Set(values)].sort((a, b) => a - b);
  let runLen = 1, bestRun = 1;
  for (let i = 1; i < uniq.length; i++) {
    if (uniq[i] === uniq[i - 1] + 1) { runLen++; bestRun = Math.max(bestRun, runLen); }
    else runLen = 1;
  }

  const allEven = n >= 3 && values.every((v) => v % 2 === 0);
  const allOdd = n >= 3 && values.every((v) => v % 2 === 1);

  if (maxSame >= 3) return { name: '三條', mult: 4 };
  if (bestRun >= 3) return { name: '順子', mult: 3 };
  if (allEven) return { name: '全偶', mult: 2.5 };
  if (allOdd) return { name: '全奇', mult: 2.5 };
  if (maxSame >= 2) return { name: '對子', mult: 2 };
  return { name: '單張', mult: 1 };
}

// 結算一手：接近度→baseChips，牌型→mult
export function evaluatePlay(values, target) {
  const sum = values.reduce((s, v) => s + v, 0);
  const diff = Math.abs(sum - target);
  const exact = diff === 0;
  const baseChips = exact ? 60 : Math.max(5, 40 - diff * 8);
  const pattern = detectPattern(values);
  return { sum, diff, exact, baseChips, pattern };
}
