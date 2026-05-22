# 《數塔》美術素材清單（Recraft 生圖用）

對照下表生圖，存成指定檔名丟進對應資料夾即可自動載入。
**所有檔案請存 `.webp`**；生不出 webp 就丟 png 給我，我幫你壓縮轉檔（每張卡 600KB→8KB）。
缺任何一張都不會壞 —— 會自動退回 emoji / 漸層佔位。

規格速查：
- **角色/怪物/卡面/素材**：去背（透明背景）、正方約 512×512（卡面 256 即可）。
- **背景**：16:9 橫向，約 1280×720，不用去背。
- 風格建議統一：可愛童書插畫風、線條清楚、色彩明亮（適合兒童）。

---

## 1. 怪物 `assets/monsters/`
**目前結構**：3 層、每層 1 隻雜魚 → 1 隻 Boss，共 6 場。雜魚每層不同；Boss 支援每層不同圖。

### 1a. 雜魚（每層一種，現在用到）✅ 已完成
| 檔名 | 出現層 | Recraft prompt |
|---|---|---|
| `slime.webp` | L1 | a small translucent green slime monster, jelly body, cute menacing face, front view, transparent background |
| `goblin.webp` | L2 | a scrawny goblin with crude dagger, big ears, sly grin, front view, transparent background |
| `skeleton.webp` | L3 | an animated skeleton warrior holding a notched sword, glowing eye sockets, front view, transparent background |

### 1b. Boss（每層各一隻，建議生不同的）⬜ 待生
程式會優先載入 `boss{層}.webp`，缺圖自動回退到通用 `boss.webp`（已有），再回退 emoji——沒生不會壞。
| 檔名 | 出現層 | Recraft prompt |
|---|---|---|
| `boss1.webp` | L1 Boss | a chubby cute slime king boss with a tiny crown, jelly body, transparent background |
| `boss2.webp` | L2 Boss | a big goblin warlord boss with spiked armor and club, menacing but cartoonish, transparent background |
| `boss3.webp` | L3 Boss（最終） | a towering armored tower-guardian boss, ornate geometric armor, glowing runes, imposing, transparent background |
| `boss.webp` | 通用回退 | （已有，作為缺圖時的備援，可不動） |

### 1c. 想要更多雜魚種類？（可選，需我接線）
若想每層 2–3 隻不同雜魚（會增加總場數），先生圖、跟我說，我把 `MOBS_PER_LAYER` 與對應名單接上：
| 建議檔名 | Recraft prompt |
|---|---|
| `bat.webp` | a small purple cave bat, big eyes, cute, front view, transparent background |
| `spider.webp` | a round fuzzy spider with big eyes, cute creepy, front view, transparent background |
| `ghost.webp` | a floating white ghost with a mischievous face, front view, transparent background |
| `mushroom.webp` | a walking red mushroom monster with angry face, front view, transparent background |

> 規格：去背、正方約 512×512、童書插畫風。生好丟進 `assets/monsters/`（或給我壓縮）。

---

## 2. 背景場景 `assets/bg/`  ⬜ 待生（每層一張）
16:9 橫向。會自動疊暗罩讓前景清楚。
| 檔名 | 層 | Recraft prompt |
|---|---|---|
| `floor1.webp` | L1 | inside a stone fantasy tower, mossy lower floor, soft torchlight, game background, 16:9 |
| `floor2.webp` | L2 | fantasy tower mid floor, stairs and banners, dramatic torchlight, game background, 16:9 |
| `floor3.webp` | L3 Boss | top of a fantasy tower, grand boss chamber, glowing runes, ominous mood, game background, 16:9 |

> 想省事可只生一張，複製成 floor1/2/3 三份。

---

## 3. 場景點綴素材 `assets/props/`  ⬜ 待生
去背小素材，會沿地面散佈、自動大小不一。
| 檔名 | 內容 | Recraft prompt |
|---|---|---|
| `grass.webp` | 一叢草 | a tuft of green grass, game sprite, transparent background, simple cute |

> 想加更多種類（石頭/花/蘑菇）跟我說，我把散佈邏輯改成多素材隨機取用。

---

## 4. 繪本故事插圖 `assets/story/`  ⬜ 待生（每層之間一張）
橫向插圖，有 🔊 語音朗讀。故事文字在 `src/main.js` 的 `STORY`，可自行改字。
| 檔名 | 時機 | Recraft prompt |
|---|---|---|
| `page1.webp` | 打完 L1 | children's storybook illustration, brave kid hero, defeated slime, tower interior, warm colors |
| `page2.webp` | 打完 L2 | children's storybook illustration, goblin fleeing dropping a key, tower stairs |
| `page3.webp` | 破關 | children's storybook illustration, kid hero triumphant at tower top, sunrise, confetti |

---

## 4b. 封面 `assets/ui/`  ⬜ 待生
開始畫面的封面圖（直式或方形，去背或滿版皆可）。
| 檔名 | 內容 | Recraft prompt |
|---|---|---|
| `cover.webp` | 遊戲封面 | game cover art for a kids math card RPG, a brave little hero in front of a tall magic tower, glowing numbers and cards floating, bright playful storybook style |

---

## 5. Joker 卡面 `assets/cards/`  ✅ 已完成
命名規則 `joker-<id>.webp`。下表是各卡目前的效果（卡面會再疊上效果符號）。
若想重生（特別是 vamp、calm 已換主題），用對應 prompt：
| 檔名 | 效果 | Recraft prompt |
|---|---|---|
| `joker-sharp.webp` | +12 傷害 | a glowing sharp dagger icon, game card art, transparent background |
| `joker-bigchip.webp` | +40 傷害 | a large glowing diamond chip, treasure gem icon, transparent background |
| `joker-vamp.webp` | +25 傷害（尖牙🦷） | a sharp white fang tooth icon, game card art, transparent background |
| `joker-twin.webp` | ×2 倍率 | two glowing magic runes side by side, x2 motif, transparent background |
| `joker-calm.webp` | ×1.5 倍率（幸運草🍀） | a lucky four-leaf clover icon, soft glow, transparent background |
| `joker-even.webp` | 偶數答案 ×3 | a blue totem with even-number symbol, mystical icon, transparent background |
| `joker-odd.webp` | 奇數答案 ×3 | a red totem with odd-number symbol, mystical icon, transparent background |
| `joker-streak.webp` | 連擊倍率增強 | a burning fire core orb, combo energy, transparent background |
| `joker-echo.webp` | +（答案值）傷害 | a swirling blue spiral vortex of numbers, transparent background |
| `joker-crit.webp` | 25% 機率 ×5 | a crackling yellow lightning orb, critical-hit gem, transparent background |

---

## 6. 玩家角色 `assets/player/`  （目前戰鬥未顯示，可先不生）
| 檔名 | 內容 | 備註 |
|---|---|---|
| `hero-back.webp` | 背面勇者 | 之前的半第一人稱用；目前 Balatro 關卡制版面沒放玩家角色，要的話再說。 |

---

### 丟檔後怎麼看效果
1. 存成上面的檔名、放對資料夾。
2. `git add -A && git commit -m "art" && git push`（或丟給我，我幫你壓縮＋接上）。
3. 等 GitHub Pages 重建，強制重整（Ctrl+Shift+R）。開始畫面版本號可確認是否最新。
