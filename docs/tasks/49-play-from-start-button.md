# 49: 先頭から全体再生ボタンの追加

現状: Play ボタンはクリップ選択中はそのクリップ範囲のみ再生し、未選択時は現在位置から末尾まで再生する。「最初から全体を通して再生する」操作にはクリップ選択を解除 → プレイヘッドを先頭に移動 → Play の 3 ステップが必要。

目標: 1 クリックで「クリップ選択を解除し、先頭 (0ms) から全体再生」できるボタンを追加する。

**A. PreviewPlayer に「最初から再生」ボタンを追加** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [ ] Play ボタンの左に「⏮」(先頭から再生) ボタンを追加
  - クリック時: `onTimeUpdate(0)` でプレイヘッドを先頭に移動
  - `onSelectClip(null)` でクリップ選択を解除 (全体再生モードにする)
  - `onPlayPause()` で再生開始 (既に再生中なら一度停止してから再開)
- [ ] Props に `onSelectClip: (id: string | null) => void` を追加
  - EditorPage からクリップ選択解除を呼べるようにする

**B. ボタン UI** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [ ] 既存の Play ボタンと統一したスタイル
  - サイズ・背景色・ボーダーを合わせる
  - ラベル: 「⏮」または「Restart」(コンパクトな表記)
- [ ] ボタン配置: 「⏮ Play」の順で左から並べる
- [ ] 再生中に「⏮」を押した場合: 再生を停止 → 先頭にシーク → 再生開始

**C. EditorPage の接続** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] PreviewPlayer に `onSelectClip={handleSelectClip}` を渡す (既存の handleSelectClip を再利用)
  - ただし PreviewPlayer 内では `onSelectClip(null)` のみ使用 (選択解除のみ)
