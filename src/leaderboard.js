// 排行榜：填入 Supabase 即為全球榜；未填則自動退回本機(localStorage)。
// 設定步驟見 LEADERBOARD.md。
const CONFIG = {
  url: '',   // 例：'https://xxxxxxxx.supabase.co'（留空＝用本機榜）
  key: '',   // Supabase anon public key
  table: 'scores',
};

export const isOnline = () => !!(CONFIG.url && CONFIG.key);

const LS_SCORES = 'shuta_scores';
const LS_NAME = 'shuta_name';

export function getName() {
  try { return localStorage.getItem(LS_NAME) || ''; } catch (e) { return ''; }
}
export function setName(n) {
  try { localStorage.setItem(LS_NAME, n); } catch (e) {}
}

function localList() {
  try { return JSON.parse(localStorage.getItem(LS_SCORES) || '[]'); } catch (e) { return []; }
}
function saveLocal(name, score) {
  const list = localList();
  list.push({ name, score });
  list.sort((a, b) => b.score - a.score);
  try { localStorage.setItem(LS_SCORES, JSON.stringify(list.slice(0, 50))); } catch (e) {}
}

export async function submitScore(name, score) {
  const nm = (name || '???').slice(0, 12);
  if (isOnline()) {
    try {
      await fetch(`${CONFIG.url}/rest/v1/${CONFIG.table}`, {
        method: 'POST',
        headers: {
          apikey: CONFIG.key,
          Authorization: `Bearer ${CONFIG.key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ name: nm, score }),
      });
      saveLocal(nm, score); // 本機也留一份備援
      return;
    } catch (e) { /* 線上失敗 → 退回本機 */ }
  }
  saveLocal(nm, score);
}

export async function topScores(n = 10) {
  if (isOnline()) {
    try {
      const r = await fetch(
        `${CONFIG.url}/rest/v1/${CONFIG.table}?select=name,score&order=score.desc&limit=${n}`,
        { headers: { apikey: CONFIG.key, Authorization: `Bearer ${CONFIG.key}` } }
      );
      if (r.ok) return await r.json();
    } catch (e) { /* 退回本機 */ }
  }
  return localList().slice(0, n);
}
