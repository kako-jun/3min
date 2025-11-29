# 3min. Calendar - 開発者向けドキュメント

## 概要

**3min. Calendar** は、Instagram共有用の正方形カレンダー画像を作成するモバイルファーストWebアプリ。

### 狙い

- 月間カレンダーに日ごとのメモを入力
- 1080x1080pxの正方形画像としてキャプチャ
- AndroidではWeb Share APIでInstagram等に直接シェア
- PCではPNG画像としてダウンロード

---

## 技術スタック

| カテゴリ       | 技術               | バージョン |
| -------------- | ------------------ | ---------- |
| フレームワーク | React + TypeScript | 18.3 / 5.7 |
| ビルドツール   | Vite               | 5.4        |
| 状態管理       | Zustand            | 5.0        |
| スタイリング   | Tailwind CSS       | 3.4        |
| 日付操作       | date-fns           | 4.1        |
| 画像キャプチャ | html2canvas        | -          |
| PWA            | vite-plugin-pwa    | 1.1        |
| データ保存     | IndexedDB          | -          |

---

## プロジェクト構造

```
src/
├── main.tsx              # エントリーポイント
├── App.tsx               # ルートコンポーネント
├── index.css             # Tailwind読み込み
├── vite-env.d.ts         # 型定義
├── lib/
│   ├── types.ts          # 型定義（DayEntry, Settings, CalendarState）
│   ├── store.ts          # Zustandストア
│   ├── storage.ts        # IndexedDB永続化
│   ├── calendar.ts       # date-fnsを使ったカレンダーロジック
│   └── capture.ts        # html2canvasによる画像キャプチャ
└── components/
    ├── Calendar.tsx      # メインレイアウト（レスポンシブ）
    ├── MonthSelector.tsx # 年月ナビゲーション
    ├── SettingsBar.tsx   # 週開始日スイッチ
    ├── CalendarGrid.tsx  # カレンダーグリッド（forwardRefでキャプチャ対応）
    ├── DayEditor.tsx     # 31日分の編集領域
    └── ActionButtons.tsx # シェア/ダウンロードボタン
```

---

## データモデル

### DayEntry（日ごとのテキスト）

```typescript
interface DayEntry {
  date: string // YYYY-MM-DD（主キー）
  text: string // 入力テキスト
}
```

### Settings（アプリ設定）

```typescript
interface Settings {
  weekStartsOn: 0 | 1 // 0: 日曜始まり, 1: 月曜始まり
  theme: 'dark' | 'light'
}
```

---

## 主要機能

### カレンダー表示

- date-fnsで月のグリッドを生成（うるう年等は自動計算）
- 曜日ヘッダー（日曜赤、土曜青）
- 当月/前後月の日付を区別表示
- 今日をハイライト（ring-2 ring-blue-500）

### 編集領域

- 31日分の縦並びリスト
- 各行: 日付 + テキスト入力 + コピー📋 + ペースト📥
- 入力は即座にIndexedDBに保存
- システムクリップボードとアプリ内クリップボードの両対応

### 画像キャプチャ（capture.ts）

- **出力サイズ**: 1080x1080px（Instagram推奨）
- **パディング**: 40px
- **背景色**: #1f2937（gray-800）
- html2canvasで要素をクローン→キャプチャ

### シェア/ダウンロード

- **シェアボタン**: Web Share API → 非対応時はクリップボードにコピー
- **保存ボタン**: PNGとしてダウンロード
- ファイル名: `calendar-YYYY-MM.png`

---

## レスポンシブデザイン

### モバイル（< 1024px）

```
◀ 2025年11月 ▶ [今日]
         日曜 ⚪── 月曜

┌────────────────┐
│   カレンダー    │
└────────────────┘
  [📤 シェア] [💾 保存]

[ 1 (土)] [入力...] 📋 📥
[ 2 (日)] [入力...] 📋 📥
...
```

### デスクトップ（≥ 1024px）

```
◀ 2025年11月 ▶ [今日]
              日曜 ⚪── 月曜

┌────────────────┐ ┌────────────────┐
│                │ │ [ 1] [...] 📋📥│
│   カレンダー    │ │ [ 2] [...] 📋📥│
│                │ │ (スクロール可)  │
└────────────────┘ └────────────────┘
  [📤 シェア] [💾 保存]
```

---

## IndexedDB構造

- **DB名**: `3min-calendar-db`
- **バージョン**: 1
- **ストア**:
  - `entries`: 日ごとのテキスト（keyPath: `date`）
  - `settings`: 設定（keyPath: `key`）

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

## 設計思想

- **モバイルファースト**: 主な用途はスマホからInstagramへのシェア
- **オフライン対応**: IndexedDBでローカル保存、バックエンド不要
- **シンプル**: 1画面完結、余計な機能なし
- **agasteer参考**: 同プロジェクトの構造・コードスタイルを踏襲

---

## 今後の拡張候補

- [ ] ライトテーマ対応
- [ ] 複数月の一括編集
- [ ] テンプレート機能（毎月の定型イベント）
- [ ] エクスポート/インポート（JSON）

---

**Last Updated**: 2025-11-30
