# Video Course Platform

YouTube動画を使用した、Udemy風の動画講座プラットフォームMVP。
ログインユーザーが動画を投稿し、他のユーザーが視聴・コメント・いいねできるサービスです。

## Tech Stack

| カテゴリ        | 技術                          |
| --------------- | ----------------------------- |
| フロントエンド  | React 18+ with TypeScript     |
| ルーティング    | React Router v6               |
| ビルドツール    | Vite                          |
| スタイリング    | TailwindCSS                   |
| コード品質      | ESLint + Prettier             |
| バックエンド/DB | Supabase（認証 + PostgreSQL） |
| デプロイ        | Vercel                        |

## Getting Started

### 必要な環境

- Node.js 18+
- npm

### インストール

```bash
# 依存関係のインストール
npm install
```

### 環境変数の設定

`.env`ファイルをプロジェクトルートに作成し、以下の環境変数を設定してください。

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 開発サーバーの起動

```bash
npm run dev
```

## Scripts

| コマンド          | 説明                                     |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | 開発サーバーを起動（HMR有効）            |
| `npm run build`   | TypeScriptの型チェック後、本番ビルド     |
| `npm run lint`    | ESLintを実行                             |
| `npm run preview` | 本番ビルドをローカルでプレビュー         |

## Features

### 認証機能

- ユーザー登録（メールアドレス + パスワード）
- ログイン / ログアウト
- プロフィール編集（アイコン画像、自己紹介文）

### 動画機能

- 動画投稿（YouTube URL、タイトル、説明文）
- 動画一覧表示（カード形式）
- 動画詳細表示（YouTube埋め込みプレイヤー）
- 動画編集・削除（投稿者のみ）

### いいね機能

- 動画へのいいね / いいね解除
- いいね数の表示

### コメント機能

- コメント投稿
- コメント返信（スレッド形式）
- コメント編集・削除（投稿者のみ）

## Directory Structure

```
src/
├── components/          # 共通コンポーネント
│   ├── common/          # ボタン、入力フォームなど
│   ├── layout/          # ヘッダー、フッターなど
│   └── video/           # 動画関連コンポーネント
├── pages/               # ページコンポーネント
├── hooks/               # カスタムフック
├── lib/                 # Supabaseクライアントなど
├── contexts/            # React Context（認証状態など）
├── utils/               # ユーティリティ関数
├── App.tsx
└── main.tsx
```

## License

Private
