// 依樓層產生算術題

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 產生一道題：難度隨樓層提升（數字變大、加入乘法、後期多步驟）
export function makeProblem(floor) {
  const tier = Math.min(floor, 12);
  // 漸進解鎖：L1–L2 只有 ＋ −，L3 起解鎖 ×（除法不做）
  const ops = ['+', '-'];
  if (tier >= 3) { ops.push('×'); ops.push('×'); }

  const op = ops[randInt(0, ops.length - 1)];
  let a, b, answer, text;

  if (op === '×') {
    const cap = 4 + tier * 2; // 乘法因數隨樓層變大
    a = randInt(2, cap);
    b = randInt(2, cap);
    answer = a * b;
    text = `${a} × ${b} = ?`;
  } else if (op === '+') {
    const cap = 10 + tier * 12;
    a = randInt(2, cap);
    b = randInt(2, cap);
    answer = a + b;
    text = `${a} + ${b} = ?`;
  } else {
    const cap = 10 + tier * 12;
    a = randInt(cap, cap * 2);
    b = randInt(2, cap);
    answer = a - b;
    text = `${a} − ${b} = ?`;
  }

  // 後期偶爾出三項式
  if (tier >= 5 && Math.random() < 0.35) {
    const c = randInt(2, 9);
    answer = answer + c;
    text = text.replace(' = ?', ` + ${c} = ?`);
  }

  return { text, answer, bornAt: performance.now() };
}

// 速度加成（nice-to-have，MVP 不啟用，留待平衡微調期）
export function speedBonus(problem) {
  const elapsed = (performance.now() - problem.bornAt) / 1000;
  if (elapsed <= 1.5) return 15;
  if (elapsed <= 3) return 10;
  if (elapsed <= 5) return 5;
  return 0;
}
