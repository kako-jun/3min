# 3 min. Calendar - 開発者向けドキュメント

## 概要

**3 min. Calendar** は、小規模店舗・個人事業主向けの「営業カレンダー画像作成アプリ」。

カップラーメンの3分タイマーにかけた名前の通り、たった3分で今月の営業カレンダーを作成し、SNSでシェアできる。

### ブランディング

- **表記**: `3 min. Calendar`（日本語版・英語版共通）
- **読み方**: 「スリーミン カレンダー」（日本での愛称は「スリーミン」）
- **アイコン**: 砂時計（カレンダー＋時間を象徴）
- **ロゴの「.」**: 肉球マークに置き換え（将来）

---

## 開発の動機

### 問題：既存ツールの不満

開発者自身がSNS用の営業カレンダーを作る必要があり、調査したところ：

- **検索上位はすべて「Canvaでテンプレートを編集」という方法**
- テンプレートの罫線は単なる画像で、位置調整が必要
- 祝日は毎月手動で設定
- 毎月同じ作業の繰り返しで、3分では終わらない

「こんな馬鹿なことがあるか？」と思ったが、専用ツールがほぼ存在しなかった。

### 市場調査結果（2025年11月）

| ツール名                                                                                         | 特徴                     | 課題                           |
| ------------------------------------------------------------------------------------------------ | ------------------------ | ------------------------------ |
| [Canva](https://www.canva.com/ja_jp/templates/s/eigyoubi/)                                       | テンプレート豊富         | 毎月手動編集、祝日手動         |
| [marCalend](https://webimemo.com/marcalend/)                                                     | ブラウザで動作、シンプル | 機能限定、祝日なし、テーマなし |
| [ShopCalendar](https://play.google.com/store/apps/details?id=com.takekonoko.shop_calendar&hl=ja) | Androidアプリ            | プラットフォーム限定           |
| [コトノハデザイン](https://cotonoha-design.com/blog/ig-calendar-2025/)                           | 無料素材配布             | 画像に手動で文字入れ必要       |

**結論**: ニーズはあるのに、ちゃんとした解決策がない市場。

### なぜ誰も作っていないのか（推測）

1. **ニッチに見えて実はニッチ** - 店舗オーナーは「カレンダー作成」で検索せず、「インスタ 投稿」でCanvaに流れる
2. **マネタイズが難しい** - 無料で十分、広告も嫌われる
3. **IT企業の視点では小さい市場** - 大手が参入するほどではない
4. **個人開発者は気づかない** - 飲食店経営の経験がないと痛みがわからない

### 3分カレンダーの差別化ポイント

- ✅ 祝日自動判定（20カ国対応）
- ✅ 定型ボタン（休/◯/△/✕/満）で素早く入力
- ✅ テーマプリセット（細かい調整不要）
- ✅ 店名表示
- ✅ オフライン動作（PWA）
- ✅ 国際対応（日本語/英語）
- ✅ ブラウザ表示と出力画像の比率が完全一致

---

### ターゲットユーザー

- 飲食店、旅館、美容室などの個人経営者
- ITリテラシーが高くない人でも使える
- 世界中の小規模事業者（国際化対応）

### 主な用途

- 月間営業カレンダーの作成
- 定休日・予約状況の一括入力
- Instagram等SNSへの画像シェア

---

## アプリの思想

### 「頑張る個人経営者の味方」

- **シンプルさ**: 余計な機能は付けない。3分で完了できることが最優先
- **画像比率の一致**: ブラウザ表示と出力画像の比率が完全一致（これが最重要）
- **オフライン動作**: バックエンドなし、IndexedDBでローカル保存
- **国際対応**: 日本語/英語、世界20カ国の祝日対応

### デザイン原則

- テーマはプリセットから選択（細かいカスタマイズは提供しない）
- 定型入力ボタン（休/◯/△/✕/満）で素早く入力
- モバイルファースト（主な利用シーンはスマホ→Instagram）

---

## 技術スタック

| カテゴリ       | 技術                    | 用途                     |
| -------------- | ----------------------- | ------------------------ |
| フレームワーク | React 18 + TypeScript 5 | UI構築                   |
| ビルドツール   | Vite 5                  | 高速な開発環境           |
| 状態管理       | Zustand 5               | シンプルなグローバル状態 |
| スタイリング   | Tailwind CSS 3          | ユーティリティファースト |
| 日付操作       | date-fns 4              | 軽量な日付ライブラリ     |
| 祝日判定       | date-holidays           | 世界の祝日対応           |
| 国際化         | i18next + react-i18next | 多言語対応               |
| 画像キャプチャ | html2canvas             | DOM→Canvas変換           |
| QRコード生成   | react-qrcode-logo       | カスタマイズ可能なQR生成 |
| アニメーション | framer-motion           | UIアニメーション         |
| PWA            | vite-plugin-pwa         | オフライン対応           |
| データ保存     | IndexedDB               | ブラウザローカルDB       |

---

## プロジェクト構造

```
src/
├── main.tsx                  # エントリーポイント
├── App.tsx                   # ルートコンポーネント（テーマ適用）
├── index.css                 # Tailwind読み込み
├── hooks/
│   └── useLogoImage.ts       # ロゴ画像選択・アスペクト比管理
├── lib/
│   ├── types.ts              # 型定義（Theme, Settings, Template等）
│   ├── store.ts              # Zustandストア（状態管理の中心）
│   ├── storage.ts            # IndexedDB操作（entries, settings, templates）
│   ├── calendar.ts           # カレンダーロジック（グリッド生成）
│   ├── capture.ts            # 画像キャプチャ（html2canvas）
│   ├── holidays.ts           # 祝日判定（20カ国対応）
│   ├── theme.ts              # テーマユーティリティ
│   ├── qr.ts                 # QRコード関連定数・ユーティリティ
│   ├── time.ts               # 時刻関連ユーティリティ
│   ├── entry.ts              # DayEntryシリアライズ/デシリアライズ
│   └── i18n/
│       ├── index.ts          # i18n初期化
│       ├── ja.json           # 日本語翻訳
│       └── en.json           # 英語翻訳
└── components/
    ├── ui/                   # 再利用可能なUIコンポーネント
    │   ├── SegmentedControl.tsx  # セグメント選択ボタン
    │   ├── ColorInput.tsx        # カラーピッカー+テキスト入力
    │   ├── ToggleSwitch.tsx      # ON/OFFトグル
    │   └── ImageSelector.tsx     # 画像選択+プレビュー
    ├── Calendar.tsx          # メインレイアウト
    ├── AppHeader.tsx         # アプリ名とキャッチコピー
    ├── MonthSelector.tsx     # 年月ナビゲーション
    ├── CalendarGrid.tsx      # カレンダーグリッド（画像キャプチャ対象）
    ├── DayEditor.tsx         # 日ごとの編集領域（3日表示/全日表示）
    ├── DayRow.tsx            # 1日分の編集行
    ├── QuickInputButtons.tsx # 定型入力ボタン
    ├── EmojiPicker.tsx       # 絵文字ピッカー
    ├── ActionButtons.tsx     # シェア/ダウンロードボタン
    ├── SettingsPanel.tsx     # 設定モーダル
    └── QRPage.tsx            # QRコード生成ページ
```

---

## データモデル

### DayEntry（日ごとの入力データ）

```typescript
interface DayEntry {
  date: string // YYYY-MM-DD（主キー）
  stamp: string | null // 定型スタンプ（'closed', 'available', 'few', 'full', 'unavailable'）
  timeFrom: string // 開始時刻（'09:00'形式）
  timeTo: string // 終了時刻（'18:00'形式）
  text: string // 自由テキスト
}
```

### Settings（アプリ設定）

```typescript
interface Settings {
  weekStartsOn: 0 | 1 // 0: 日曜始まり, 1: 月曜始まり
  theme: ThemeId // 'dark' | 'light' | 'cafe' | 'nature' | 'ocean' | 'sunset'
  language: 'ja' | 'en'
  country: CountryCode // 'JP' | 'US' | 'GB' | ... （20カ国）
  shopName: string // カレンダーに表示する店名
  showHolidays: boolean // 祝日を色分け表示するか
}
```

### Template（定休日パターン）

```typescript
interface Template {
  id: string
  name: string // 「毎週水曜定休」等
  weekdayDefaults: Record<number, string> // 曜日ごとのデフォルト値
}
```

---

## 主要機能

### カレンダー表示（CalendarGrid.tsx）

- 6行7列の固定グリッド（aspect-square）
- テーマカラーに完全対応（インラインstyle）
- 祝日は日曜色で表示（showHolidays有効時）
- 店名をカレンダー上部に表示

### 定型入力（QuickInputButtons.tsx）

| ボタン | 日本語 | 英語   | 用途       |
| ------ | ------ | ------ | ---------- |
| 休     | 休     | Closed | 定休日     |
| ◯      | ◯      | ◯      | 空きあり   |
| △      | △      | △      | 残りわずか |
| ✕      | ✕      | ✕      | 予約済み   |
| 満     | 満     | Full   | 満席/満室  |

### 画像キャプチャ（capture.ts）

- **重要**: ブラウザ表示と出力画像の比率が完全一致すること
- html2canvasでDOM要素を直接キャプチャ（scale: 2で高解像度）
- Web Share API対応時はシェア、非対応時はクリップボードコピー

### 設定パネル（SettingsPanel.tsx）

- 言語切り替え（日本語/英語）
- 国/地域選択（祝日判定用、20カ国）
- テーマ選択（6種類のプリセット）
- 店名入力・店名ロゴ設定
- 背景画像・透明度設定
- 祝日表示ON/OFF
- 週の開始日（日曜/月曜）

### QRコード生成（QRPage.tsx）

- URLを入力してQRコードを生成
- スタイル選択（四角/ドット/流体）
- 目の形状選択（四角/角丸/円形）- 自動計算で最適な角丸半径
- 色のカスタマイズ（背景色・前景色）
- 中央ロゴ画像の挿入（アスペクト比を維持）
- サイズ選択（128/256/512px）
- エラー訂正レベルは常にH（最大）で固定
- 画像ダウンロード機能

---

## テーマシステム

6種類のプリセットテーマ。カスタムカラーは意図的に非対応。

```typescript
type ThemeId = 'dark' | 'light' | 'cafe' | 'nature' | 'ocean' | 'sunset'

interface ThemeColors {
  bg: string // 背景色
  surface: string // カード等の背景
  text: string // 通常テキスト
  textMuted: string // 薄いテキスト
  accent: string // アクセント色
  sunday: string // 日曜・祝日の色
  saturday: string // 土曜の色
  holiday: string // 祝日の色
}
```

---

## IndexedDB構造

- **DB名**: `3min-calendar-db`
- **バージョン**: 2
- **ストア**:
  - `entries`: 日ごとのテキスト（keyPath: `date`）
  - `settings`: 設定（keyPath: `key`）
  - `templates`: テンプレート（keyPath: `id`）

---

## 国際化（i18n）

- i18next + react-i18next
- ブラウザ言語を自動検出
- 設定で手動切り替え可能
- 翻訳ファイル: `src/lib/i18n/ja.json`, `en.json`

### 翻訳キー構造

```json
{
  "app": { "title": "アプリ名", "tagline": "キャッチコピー" },
  "calendar": { "today": "今日", "yearMonth": "年月表示" },
  "weekdays": { "sun": "日", "mon": "月", ... },
  "settings": { ... },
  "actions": { ... },
  "quickInput": { ... },
  "themes": { ... }
}
```

---

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run preview      # ビルド結果確認
npm run format       # Prettierでフォーマット
npm run lint         # フォーマットチェック + 型チェック
```

---

## コミット時の自動チェック（husky）

- pre-commit: `npm run lint`
- フォーマット: Prettier
- 型チェック: TypeScript

---

## 設計上の注意点

### 画像比率の一致（最重要）

CalendarGridは`aspect-square`で固定。キャプチャ時もこの比率を維持すること。
比率がずれるとユーザー体験が大きく損なわれる。

### コンポーネント分離

リファクタリングを避けるため、最初からコンポーネント化を徹底。
共通ロジックはlib/に切り出す。

### テーマのハードコード

テーマカラーはTailwindクラスではなくインラインstyleで適用。
これにより動的なテーマ切り替えが可能。

### 再利用可能なUIコンポーネント（components/ui/）

共通UIパターンは`components/ui/`ディレクトリに切り出し:

- **SegmentedControl**: 複数選択肢からひとつを選ぶボタングループ
- **ColorInput**: カラーピッカーとテキスト入力の組み合わせ
- **ToggleSwitch**: ON/OFFの切り替え（オプションでラベル付き）
- **ImageSelector**: 画像選択、プレビュー表示、削除機能

これらはテーマオブジェクト（`AppThemeColors`型）を受け取り、動的にスタイル適用。

---

## 今後の拡張候補

- [ ] テンプレート機能の完全実装（UI）
- [ ] エクスポート/インポート（JSON）
- [ ] より多くの国の祝日対応
- [ ] 年間カレンダー表示

---

**Last Updated**: 2025-12-08
