# 秘密探險隊 · The Secret 小朋友版

幫小學生同初中生學習 Rhonda Byrne《The Secret》嘅廣東話互動學習 App。iPad、電腦、手機都玩得。

## 檔案結構（成個資料夾上載去 GitHub）
```
index.html          ← App 本體
audio/01.mp3        ← 背景音樂 1
audio/02.mp3        ← 背景音樂 2
firestore.rules     ← Firebase 保安規則（用雲端同步先需要）
README.md
```

## 內容
- **十個關卡**：跟原著十個章節。每關四步：📜 學習 → 🎮 遊戲 → ❓ 考考你 → 🌟 生活任務。集齊十粒寶石可以列印證書。
- **💗 心靈角落**：小朋友唔開心時用：講出感覺、泡泡呼吸、感覺階梯、快樂清單、感恩罐、同自己個心講說話。
- **🌳 秘密樹窿**：講出心事，AI 會同理、拆解問題、建議一小步，再寫一段自我對話逐字稿。
- **👨‍👩‍👧 家長專區（要 PIN）**：睇樹窿記錄、心情統計、安全警報、「點樣開導」建議、匯出到電腦、雲端同步。
- **🔊 廣東話語音** 同 **🎵 背景音樂**（讀緊廣東話嗰陣，背景音樂會自動調細）。

---

## 放上 GitHub Pages
1. 喺 GitHub 開一個新 repository，將上面所有檔案上載（`audio` 資料夾都要）。
2. 去 **Settings → Pages**：Source 揀 `Deploy from a branch`，Branch 揀 `main`，資料夾揀 `/ (root)`，撳 **Save**。
3. 等一兩分鐘，就可以喺 `https://你嘅用戶名.github.io/repository名/` 打開。

> 💡 用雲端同步嘅話，一定要用呢個 https 網址開，唔好直接撳開電腦入面嘅 .html 檔。

---

## 樹窿記錄：三個模式
家長喺小朋友部機嘅 **⚙️ › 家長專區 › 設定** 揀。模式係跟部機嘅，所以要喺小朋友部機設定。

| 模式 | 家長睇到咩 | 建議年齡 |
|---|---|---|
| 守護模式（預設） | 全部樹窿對話、心情 | 6–10 歲 |
| 信任模式 | 小朋友揀咗分享嘅對話；冇分享嘅只見到心情 | 10 歲以上 |
| 只限安全警報 | 平時乜都唔記錄 | — |

無論邊個模式，出現危險字眼（例如被打、想傷害自己）都一定會記錄。小朋友第一次用樹窿會見到「樹窿嘅約定」，清楚知道規則。改模式之後，佢會再見到新嘅約定。

**樹窿特赦**：唔好因為小朋友喺樹窿講嘅嘢鬧佢或者罰佢，亦唔好喺其他人面前提起。

> ⚠️ App 唔會即時通知家長，請定期打開家長專區睇下，尤其係「安全警報」。

---

## Firebase 雲端同步（小朋友用 iPad，家長用電腦／手機）
小朋友喺 iPad 用樹窿，記錄會自動上載。家長喺自己部電腦、Android 或者 iPhone 登入 Google，就睇到同匯出。免費嘅 Spark 計劃已經夠用。

保安設計：
- **家長用 Google 登入**（亦可以用電郵做後備）。
- **小朋友部 iPad 唔使登入任何帳戶**：家長產生一個 8 位**配對碼**，喺 iPad 輸入就得。iPad 只可以新增記錄，唔可以讀、改或者刪除。
- **另一位家長**（例如爸爸用 Android、媽媽用 iPhone）用**家長邀請碼**加入，用返佢自己嘅 Google 帳戶。
- 配對碼同邀請碼 15 分鐘後失效。其他人乜都睇唔到。

### 第 1 步：建立 Firebase 專案
1. 去 <https://console.firebase.google.com>，用你嘅 Google 帳戶登入。
2. 撳 **建立專案 / Create a project**，改個名（例如 `secret-kids`）。
3. Google Analytics 可以關掉，撳 **建立專案**。

### 第 2 步：加入網頁 App，攞 firebaseConfig
1. 喺專案總覽撳 **`</>`（網頁）** 圖示。
2. 改個暱稱（例如 `secret-web`），**唔使**剔 Firebase Hosting，撳 **註冊應用程式**。
3. 畫面會出現一個灰色框，入面有一段好似下面咁嘅嘢。**唔使理縮排**，成段複製就得：

```js
const firebaseConfig = {
  apiKey: "AIzaSyA1b2C3d4E5f6G7h8I9j0KlMnOpQrStUvW",
  authDomain: "secret-kids.firebaseapp.com",
  projectId: "secret-kids",
  storageBucket: "secret-kids.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6a7b8c9d0e1"
};
```

（以上係範例，你嘅數值會唔同。之後喺 ⚙️ 專案設定 › 一般 › 你的應用程式，都可以再搵返。）

貼入 App 嘅時候：
- 縮排、空格、換行**全部唔緊要**；成個灰色框連 `import …` 嗰幾行一齊貼都得，App 會自動搵返 `firebaseConfig`。
- 貼完之後，下面會即刻顯示 ✅／❌。四個 ✅（apiKey、authDomain、projectId、appId）就代表啱，可以撳「儲存設定」。
- App 入面亦有 **📄 睇範例** 掣。

### 第 3 步：開啟登入方式
1. 左邊選單 **Build › Authentication**，撳 **開始使用 / Get started**。
2. 去 **Sign-in method** 分頁：
   - 開啟 **Google**：揀一個「專案支援電子郵件」（揀你自己嘅 Gmail），撳儲存。
   - 開啟 **匿名（Anonymous）**，撳儲存。呢個係俾小朋友部 iPad 用嘅。
   - （可選）開啟 **電子郵件/密碼**，做後備登入。
3. 去 **Settings › Authorized domains**，撳 **Add domain**，加入 `你嘅用戶名.github.io`。**唔加呢個，Google 登入會失敗。**

### 第 4 步：建立 Firestore 資料庫
1. 左邊選單 **Build › Firestore Database**，撳 **建立資料庫 / Create database**。
2. 位置揀近你嘅地方：倫敦揀 `europe-west2`，香港揀 `asia-east2`。**揀咗之後唔可以改。**
3. 揀 **以正式版模式啟動 / Start in production mode**，撳建立。

### 第 5 步：貼上保安規則
1. 喺 Firestore 撳 **規則 / Rules** 分頁。
2. 刪除原本全部內容，將 `firestore.rules` 檔入面嘅**全部內容**貼上去。
3. 撳 **發佈 / Publish**。

### 第 6 步：家長部電腦／手機（先做）
1. 用 Chrome 或者 Safari 打開你嘅 GitHub Pages 網址。
2. 撳右上角 **⚙️ › 🔒 家長專區**，設定家長 PIN。
3. 去 **☁️ 雲端同步**，將第 2 步嗰段 `firebaseConfig` 貼入去，見到四個 ✅ 就撳 **儲存設定**。
4. 「② 呢部機係邊個用？」揀 **👨‍👩‍👧 家長**，然後撳 **用 Google 登入**。
5. 喺「🔗 配對小朋友部 iPad」撳 **產生配對碼**，畫面會顯示一個 8 位碼，例如 `7CAG-6DJD`，15 分鐘內有效。

### 第 7 步：小朋友部 iPad
1. 用小朋友平時開 App 嘅方式打開。如果佢用「加入主畫面」嘅 icon，就喺嗰個 icon 入面做，因為 icon 同 Safari 嘅資料係分開嘅。
2. **⚙️ › 🔒 家長專區**，設定 PIN（可以同你部手機唔同）。
3. **☁️ 雲端同步**，貼上同一段 `firebaseConfig`，撳 **儲存設定**。
4. 「② 呢部機係邊個用？」揀 **🧒 小朋友**，輸入第 6 步嘅配對碼，撳 **🔗 配對**。
5. 見到「✅ 呢部機已經配對」就完成。再去 **⚙️ 設定** 揀記錄模式。

### 第 8 步（可選）：另一位家長
1. 你喺家長部機撳 **產生家長邀請碼**。
2. 另一位家長喺佢自己部手機或者電腦做第 6 步嘅 1 至 4，用**佢自己**嘅 Google 帳戶登入。
3. 撳 **我收到另一位家長嘅邀請碼**，輸入個碼，撳 **加入**。之後佢都睇到同一批記錄。

### 之後日常使用
家長打開網址 › ⚙️ › 🔒 家長專區 › 輸入 PIN，就會**自動載入雲端記錄**：
- 📋 總覽：最近 14 日心情同安全警報
- 🌳 樹窿記錄：全文，同「💡 點樣開導？」
- 📤 匯出：揀範圍同格式（見下面）

### 唔想每部機都貼設定？（可選）
用文字編輯器（或者 GitHub 網頁嘅 ✏️ 編輯）打開 `index.html`，搜尋 `const FIREBASE_CONFIG_BUILTIN = null;`。將 `null` 換成 `{` 到 `}` 嗰部分，例如：

```js
const FIREBASE_CONFIG_BUILTIN = {
  apiKey: "AIza……",
  authDomain: "secret-kids.firebaseapp.com",
  projectId: "secret-kids",
  storageBucket: "secret-kids.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:……"
};
```

注意兩點：
- 前面係 `const FIREBASE_CONFIG_BUILTIN =`，**唔好**抄埋 `const firebaseConfig =`。
- 最尾要有 `;`。

咁樣每部機都會自動有設定。呢啲設定唔係密碼，放喺網頁入面係正常做法，真正保護資料嘅係 `firestore.rules`。

### 常見問題
- **Google 登入視窗彈唔出**：瀏覽器可能擋咗彈出視窗，請容許之後再撳。如果用緊「主畫面」icon 模式，請改用 Safari／Chrome 直接開網址登入，或者用電郵登入。
- **顯示「未加入 Firebase 授權網域」**：做返第 3 步第 3 點。
- **配對失敗／冇權限**：
  - 檢查第 3 步有冇開 Anonymous。
  - 檢查第 5 步規則有冇撳發佈。
  - 配對碼係咪過咗 15 分鐘。
- **換咗 iPad，或者清除咗 Safari 資料**：部機會變成「未配對」，產生一個新配對碼重新配對就得。舊裝置可以喺「已配對嘅裝置」撳 ✕ 移除。
- **忘記 PIN**：撳「忘記 PIN？」可以重設，但會刪除嗰部機上面嘅本機記錄。雲端記錄唔受影響。
- **可選加強保安**：去 Google Cloud Console › APIs & Services › Credentials，將 Browser key 限制為只可以喺 `https://你嘅用戶名.github.io/*` 使用。

---

## 匯出到電腦
**⚙️ › 家長專區 › 📤 匯出**，資料來源揀「☁️ 雲端」，揀範圍，然後揀格式：
- **📄 文字檔 (.txt)**：方便閱讀同列印
- **📊 Excel 表格 (.csv)**：可以用 Excel、Numbers 或者 Google Sheets 開
- **💾 完整備份 (.json)**：原始資料

檔案會去邊度：
- 電腦：「下載」資料夾
- Android：「下載」／Downloads
- iPhone／iPad：揀「儲存到檔案」

冇設定 Firebase 嘅話，都可以喺小朋友部 iPad 嘅家長專區，揀「📱 呢部機」匯出。

---

## 廣東話語音設定（iPad）
設定 → 輔助使用 → 朗讀內容 → 聲音 → 中文 → **中文（香港）**，下載一個聲音（建議揀增強版）。之後喺 App 右上角 ⚙️ 可以揀聲音同調語速。

## AI 設定（GLM 5.3 國際版）
**⚙️ › 家長專區 › 設定 › AI 設定**：
- Base URL：`https://api.z.ai/api/paas/v4`
- Model：`glm-5.3`
- API Key：你自己嘅 key

設定只會暫存喺嗰部機嘅瀏覽器。每部機都要各自設定：小朋友部機用嚟做樹窿，家長部機用嚟做「點樣開導」建議。

## 私隱同安全
- 小朋友喺樹窿打嘅內容會傳送去你設定嘅 AI 服務。開咗雲端同步嘅話，亦會存入你自己嘅 Firebase 專案。
- 呢啲係小朋友嘅私密心事。匯出嘅檔案請妥善保管，唔好轉發。
- AI 唔可以代替專業輔導。如果小朋友持續低落，或者提到欺凌、傷害自己，請聯絡學校社工、醫生或者熱線：香港撒瑪利亞會 2896 0000、英國 Childline 0800 1111，緊急情況打 999。

## 關於插圖
為尊重版權，App 冇使用原著書本嘅插圖，而係用原創嘅羊皮紙卷軸、紅色蠟封同 three.js 金色星河，營造原著嘅神秘感。
