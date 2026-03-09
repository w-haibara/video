import type React from 'react';

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
  white:        '#FFFFFF',                    // 汎用ホワイト
  black:        '#000000',                    // 汎用ブラック
  clipLabelText:'#FFFFFF',                    // クリップ上の白テキスト
  overlayLight: 'rgba(255, 255, 255, 0.2)',   // 明るい半透明オーバーレイ
  overlayLightBorder: 'rgba(255, 255, 255, 0.5)', // 明るい半透明ボーダー
  overlayLightSubtle: 'rgba(255, 255, 255, 0.15)', // 薄い半透明ボーダー
  overlayLightMed: 'rgba(255, 255, 255, 0.3)', // やや明るい半透明オーバーレイ
  overlayDark:  'rgba(0, 0, 0, 0.85)',        // 暗い半透明オーバーレイ（ツールチップ等）
  errorOverlay: 'rgba(248, 85, 82, 0.5)',     // エラー半透明オーバーレイ
  shadow:       'rgba(92, 106, 114, 0.12)',   // ドロップシャドウ
  overlay:      'rgba(92, 106, 114, 0.5)',    // モーダルオーバーレイ
} as const;

// ── スペーシングスケール (px) ──
export const spacing = {
  xs: 4,   // ラベル〜入力間、密なギャップ
  sm: 8,   // セクション内マージン、パネルパディング
  md: 12,  // セクション間マージン
  lg: 16,  // ヘッダー・ダイアログ内パディング
  xl: 24,  // ページレベルパディング
} as const;

// ── フォントサイズスケール ──
export const fontSize = {
  xs:       '11px',  // メタ情報（タイムスタンプ等）
  sm:       '12px',  // フィールドラベル、タイムラインクリップ
  md:       '13px',  // 本文テキスト、入力フィールド、ボタン（小）
  lg:       '14px',  // タブテキスト、ボタン（標準）
  xl:       '16px',  // ボタン（大）
  heading3: '18px',  // セクション見出し
  heading2: '20px',  // ダイアログ見出し
  heading1: '22px',  // ページ見出し
} as const;

// ── 角丸スケール ──
export const radius = {
  xs: '2px',  // プログレスバー
  sm: '3px',  // 入力フィールド、小ボタン
  md: '4px',  // 標準ボタン、カード内要素
  lg: '6px',  // ダイアログボタン
  xl: '8px',  // カード、ダイアログ
} as const;

// ── ボタンスタイルプリセット ──
const buttonBase: React.CSSProperties = {
  border: 'none',
  borderRadius: radius.md,
  padding: '6px 12px',
  fontSize: fontSize.md,
  cursor: 'pointer',
};

export const buttonStyle = {
  primary: {
    ...buttonBase,
    background: theme.button,
    color: theme.buttonText,
  } as React.CSSProperties,
  secondary: {
    ...buttonBase,
    background: 'none',
    border: `1px solid ${theme.border}`,
    color: theme.text,
  } as React.CSSProperties,
  danger: {
    ...buttonBase,
    background: theme.buttonDanger,
    color: theme.buttonText,
  } as React.CSSProperties,
  small: {
    padding: '2px 8px',
    fontSize: fontSize.sm,
  } as React.CSSProperties,
} as const;

// ── 入力フィールド共通スタイル ──
export const inputStyle: React.CSSProperties = {
  width: '100%',
  background: theme.bgPanel,
  color: theme.text,
  border: `1px solid ${theme.border}`,
  borderRadius: radius.sm,
  padding: '4px 6px',
  fontSize: fontSize.md,
  boxSizing: 'border-box',
};

// ── セクション見出し共通スタイル ──
export const sectionHeadingStyle: React.CSSProperties = {
  fontSize: fontSize.heading3,
  fontWeight: 600,
  margin: '0 0 8px',
};

export type Theme = typeof theme;
export type Spacing = typeof spacing;
export type FontSize = typeof fontSize;
export type Radius = typeof radius;
export type ButtonStyle = typeof buttonStyle;
