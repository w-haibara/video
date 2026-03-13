# 39: エディタ画面レイアウト大改修: プレビュー左固定 + 右ペインタブ化

EditorLayout のグリッド構造を全面的に変更し、プレビューを左 1/3 に固定、右 2/3 をタブ付きペインにする。

**A. EditorLayout の CSS Grid 再設計** (`app/frontend/src/components/EditorLayout.tsx`)
- [ ] Props を変更:
  - 旧: `{ left, center, right, bottom }`
  - 新: `{ preview, mainPanel, bottom }`
  - `preview`: PreviewPlayer を配置
  - `mainPanel`: タブ付きペイン (Inspector / Assets / Export を含む)
  - `bottom`: Timeline (変更なし)
- [ ] gridTemplateColumns を `"1fr 2fr"` に変更 (左 1/3、右 2/3)
- [ ] gridTemplateRows は `"1fr 220px"` を維持
- [ ] プレビュー領域 (左): row 1, col 1
  - `background: #111`, `display: flex`, `alignItems: center`, `justifyContent: center`
  - `overflow: hidden`
- [ ] メインペイン (右): row 1, col 2
  - `background: #1a1a1a`, `overflow: auto`
  - `display: flex`, `flexDirection: column` (タブバー + コンテンツ)
- [ ] タイムライン (下): row 2, col 1-2 (`gridColumn: "1 / -1"`)

**B. EditorPage の組み替え** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] `left` / `center` / `right` の分離をやめ、`preview` と `mainPanel` に統合
- [ ] `preview` には PreviewPlayer のみを渡す
- [ ] `mainPanel` には新しい `EditorMainPanel` コンポーネントを渡す
  - EditorMainPanel がタブ管理を担当 (タスク 40 で詳細化)
