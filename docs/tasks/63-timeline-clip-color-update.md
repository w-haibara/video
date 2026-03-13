# 63: タイムライン・クリップコンポーネントの色彩更新

タイムライン関連コンポーネントの色彩を Everforest Light テーマに統一する。

**A. Timeline の更新** (`app/frontend/src/components/Timeline.tsx`)
- [ ] タイムライン背景: `#1a1a1a` → `theme.timelineBg`
- [ ] トラックヘッダー → `theme.bgPanel`
- [ ] ボーダー・区切り線: `#333` → `theme.border`
- [ ] テキスト (トラックラベル) → `theme.text`
- [ ] 終端マーカー (赤い破線) → `theme.error`

**B. TimelineTrack の更新** (`app/frontend/src/components/TimelineTrack.tsx`)
- [ ] トラック背景: ダーク系 → `theme.timelineTrackBg`
- [ ] 交互行色 (あれば) → `theme.bgPanel` / `theme.bg`

**C. TimelineClip の更新** (`app/frontend/src/components/TimelineClip.tsx`)
- [ ] video クリップ: `#3a6ad4` → `theme.clipVideo`, 選択時 `#2a4a9a` → `theme.clipVideoSelect`
- [ ] audio クリップ: `#27ae60` / `#1e8449` → `theme.clipAudio` / `theme.clipAudioSelect`
- [ ] text クリップ: `#9b59b6` / `#8e44ad` → `theme.clipText` / `theme.clipTextSelect`
- [ ] クリップ内テキスト → `#FFFFFF` (ライトテーマでもクリップ上のテキストは白を維持して可読性を確保)
- [ ] トリムハンドル → ライトテーマ適応

**D. TimelineRuler の更新** (`app/frontend/src/components/TimelineRuler.tsx`)
- [ ] ルーラー背景 → `theme.timelineRuler`
- [ ] 目盛り線 → `theme.textMuted`
- [ ] 時間ラベル → `theme.text`

**E. Playhead の更新** (`app/frontend/src/components/Playhead.tsx`)
- [ ] プレイヘッド色: 既存の赤系 → `theme.playhead` (`#F85552`)

**F. EditorPage のインライン色** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] エディタ画面内のインラインスタイル色をすべて `theme.*` に置換

---
