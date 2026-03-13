# 61: グローバル CSS・ページコンポーネントの色彩更新

グローバルスタイルとページレベルのコンポーネントを Everforest Light テーマに変更する。

**A. index.css の更新** (`app/frontend/src/index.css`)
- [ ] `body` の `background` を `#FDF6E3` に変更
- [ ] `body` の `color` を `#5C6A72` に変更
- [ ] `::selection` に `background: #EFE9D5` を追加
- [ ] スクロールバーのスタイルをライトテーマに合わせる

**B. HomePage の更新** (`app/frontend/src/pages/HomePage.tsx`)
- [ ] 背景色: `#111` → `theme.bg`
- [ ] テキスト色: `#eee` / `#ccc` → `theme.text`
- [ ] ボタン色: ダーク系 → `theme.button` / `theme.buttonText`
- [ ] カードのスタイル: `ProjectCard.tsx` のダーク背景 → `theme.bgPanel`, ボーダー `theme.border`

**C. ProjectCard の更新** (`app/frontend/src/components/ProjectCard.tsx`)
- [ ] カード背景: ダーク系 → `theme.bgPanel`
- [ ] テキスト色 → `theme.text` / `theme.textMuted`
- [ ] ホバー → `theme.bgHover`
- [ ] ボーダー → `theme.border`

**D. CreateProjectDialog の更新** (`app/frontend/src/components/CreateProjectDialog.tsx`)
- [ ] モーダル背景 → `theme.overlay`
- [ ] ダイアログ背景 → `theme.bg`
- [ ] 入力フィールド: ダーク背景 → `theme.bgPanel`, ボーダー `theme.border`
- [ ] ボタン → `theme.button` / `theme.buttonText`

**E. JobLogPage の更新** (`app/frontend/src/pages/JobLogPage.tsx`)
- [ ] 背景・テキスト → `theme.bg` / `theme.text`
- [ ] テーブル/リストのスタイル → `theme.bgPanel`, `theme.border`

**F. JobProgress の更新** (`app/frontend/src/components/JobProgress.tsx`)
- [ ] プログレスバーの背景 → `theme.bgHover`
- [ ] プログレスバーの前景 → `theme.primary`
