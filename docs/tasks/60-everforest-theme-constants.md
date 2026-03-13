# 60: Everforest Light テーマ定数ファイルの作成

カラーパレットを一元管理する定数ファイルを新規作成し、全コンポーネントから参照可能にする。

**A. テーマ定数ファイルの作成** (`app/frontend/src/theme.ts`)
- [ ] 新規作成
- [ ] Everforest Light のベースカラーを定義:
  ```typescript
  export const theme = {
    // ── ベースカラー ──
    bg:          '#FDF6E3',  // メイン背景 (Background)
    bgPanel:     '#F4F0D9',  // パネル背景 (BrightWhite)
    bgHover:     '#EFE9D5',  // ホバー・選択 (Selection)
    bgDark:      '#E5DFC9',  // 押下・アクティブ (Selection より暗め, 派生色)

    text:        '#5C6A72',  // 本文テキスト (Text / Black)
    textMuted:   '#939F91',  // 補助テキスト (White)
    textDisabled:'#A9B3A5',  // 無効テキスト (White より明るめ, 派生色)

    border:      '#D4CCAB',  // ボーダー (派生色: Selection を暗くしたもの)
    borderLight: '#E5DFC9',  // 薄いボーダー (派生色)

    // ── セマンティックカラー ──
    primary:     '#3A94C5',  // プライマリ (Blue)
    primaryHover:'#2E7BA3',  // プライマリ:hover (Blue 暗め)
    accent:      '#35A77C',  // アクセント (Cyan / Cursor)

    error:       '#F85552',  // エラー (Red)
    warning:     '#DFA000',  // 警告 (Yellow)
    success:     '#8DA101',  // 成功 (Green)
    info:        '#3A94C5',  // 情報 (Blue)

    // ── クリップタイプカラー ──
    clipVideo:       '#3A94C5',  // video クリップ (Blue)
    clipVideoSelect: '#2E7BA3',  // video 選択時
    clipAudio:       '#8DA101',  // audio クリップ (Green)
    clipAudioSelect: '#738501',  // audio 選択時
    clipText:        '#DF69BA',  // text クリップ (Magenta)
    clipTextSelect:  '#C050A0',  // text 選択時

    // ── UI 部品 ──
    tabActive:       '#FDF6E3',  // アクティブタブ背景
    tabInactive:     '#F4F0D9',  // 非アクティブタブ背景
    tabIndicator:    '#3A94C5',  // タブ下線 (Blue)
    tabText:         '#5C6A72',  // タブテキスト
    tabTextInactive: '#939F91',  // 非アクティブタブテキスト

    button:          '#3A94C5',  // ボタン背景
    buttonText:      '#FFFFFF',  // ボタンテキスト
    buttonHover:     '#2E7BA3',  // ボタン:hover
    buttonDanger:    '#F85552',  // 危険ボタン
    buttonDangerHover:'#D94440', // 危険ボタン:hover

    // ── タイムライン ──
    timelineBg:      '#F4F0D9',  // タイムライン背景
    timelineTrackBg: '#FDF6E3',  // トラック背景
    timelineRuler:   '#EFE9D5',  // ルーラー背景
    playhead:        '#F85552',  // プレイヘッド (Red)
    seekBar:         '#35A77C',  // シークバー (Cyan)

    // ── その他 ──
    shadow:    'rgba(92, 106, 114, 0.12)',  // ドロップシャドウ
    overlay:   'rgba(92, 106, 114, 0.5)',   // モーダルオーバーレイ
  } as const;
  ```

**B. 型エクスポート**
- [ ] `export type Theme = typeof theme;` を追加
- [ ] 必要に応じてカラーキーのユニオン型も提供
