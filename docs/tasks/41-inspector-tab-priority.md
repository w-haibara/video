# 41: Inspector タブの優先表示とクリップ選択連動

タイムラインでクリップを選択したとき、自動的に Inspector タブに切り替える。

**A. クリップ選択時の自動タブ切り替え** (`app/frontend/src/components/EditorMainPanel.tsx`)
- [ ] `selectedClipId` prop を受け取る
- [ ] `useEffect` で `selectedClipId` の変化を監視
  - `selectedClipId` が `null` → 非 null に変わったとき、タブを `"inspector"` に切り替え
  - `null` → `null` や非 null → 別の非 null では切り替えない (ユーザーが意図的に別タブにいる場合を尊重)
- [ ] ただし、初回レンダー時は切り替えを発生させない (`useRef` でマウント済みフラグ管理)

**B. Inspector タブの視覚的な強調**
- [ ] Inspector タブのラベルを太字にする (`fontWeight: 600`)
- [ ] クリップ選択中は Inspector タブのラベル横にインジケータ (小さな青い丸) を表示
  - `width: 6px, height: 6px, borderRadius: 50%, background: #5b8def`
  - クリップ未選択時は非表示
