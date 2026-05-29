# Gakuchika-log (ガクチカ・ログ)

学生時代に力を入れたこと（ガクチカ）を整理・記録し、AI（Gemini）の力を借りてブラッシュアップするための Web アプリケーションです。

## 🚀 プロジェクト概要

就職活動や自己分析で重要な “ガクチカ” のエピソードを管理するためのアプリです。
直感的な UI でエピソードを記録し、Gemini API を活用して内容の改善提案や要約を行います。

### 主な機能

- **エピソード管理**: ガクチカの記録・一覧（カレンダー）表示。
- **AI サポート**: Google Gemini API を使った、エピソードの強み抽出・ES 文章案の生成。
- **認証機能**: Neon Auth（Better Auth）によるセキュアなユーザー認証。
- **レスポンシブデザイン**: PC・スマートフォン両対応。

## 🛠 技術スタック

**単一の Next.js アプリ**に統合された構成です（フロント・API・DB・認証がひとつのアプリ内）。

- **Framework**: Next.js 16 (App Router) / TypeScript
- **API**: Next.js Route Handlers（`app/api/*`）
- **Styling**: Tailwind CSS 4 / Lucide React / Lottie-react
- **Database**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM（`@neondatabase/serverless` ドライバ）
- **Auth**: Neon Auth（Better Auth ベース・`@neondatabase/auth`）
- **AI**: Google Gemini API

## 🌐 デプロイ

- **Hosting**: Vercel（単一アプリをそのままデプロイ）
- **Database / Auth**: Neon（DB と Neon Auth）

## 📂 ディレクトリ構造

```text
.
├── app/
│   ├── layout.tsx                 # ルートレイアウト
│   ├── page.tsx                   # メイン画面（入力 → AI分析 → カレンダー履歴）
│   ├── login/page.tsx             # ログイン / 新規登録
│   └── api/
│       ├── logs/route.ts          # ガクチカの取得(GET)・分析保存(POST)
│       └── auth/[...path]/route.ts# Neon Auth ハンドラ
├── lib/
│   ├── gemini.ts                  # Gemini API 連携ロジック
│   └── auth/
│       ├── server.ts              # サーバー側 Neon Auth インスタンス
│       └── client.ts              # クライアント側 Neon Auth クライアント
├── db/
│   ├── schema.ts                  # Drizzle スキーマ（logs / ai_analyses）
│   └── index.ts                   # DB 接続（Neon serverless + Drizzle）
├── drizzle.config.ts              # drizzle-kit 設定
└── .github/workflows/test.yml     # CI（lint + build）
```

## ⚙️ セットアップ

### 前提

- Node.js v18 以上
- Neon アカウント（DB + Neon Auth）
- Google Gemini API キー

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数

`.env.local.example` を `.env.local` にコピーして値を埋めます。

```env
DATABASE_URL=...            # Neon の接続文字列
NEON_AUTH_BASE_URL=...      # Neon Console で Neon Auth を有効化すると取得
NEON_AUTH_COOKIE_SECRET=... # 32文字以上（openssl rand -base64 32 で生成）
GEMINI_API_KEY=...          # Google Gemini API キー
```

### 3. データベースの初期化

```bash
# Neon Auth が neon_auth スキーマに作る user テーブルなどを取り込む
npm run db:pull
# logs / ai_analyses テーブルを作成
npm run db:push
```

### 4. 開発サーバー起動

```bash
npm run dev
# http://localhost:3000
```

## 🔑 はじめての構築手順（オーナー向けハンドオフ）

このリポジトリのコードは **Neon Auth + Neon + Vercel** 前提に統合済みです。実際に動かすには、以下を一度だけ設定してください。

1. **Neon Console でプロジェクトを作成**し、`DATABASE_URL` を取得。
2. **Neon Auth を有効化**し、`NEON_AUTH_BASE_URL` を取得。
3. `NEON_AUTH_COOKIE_SECRET` を生成（`openssl rand -base64 32`）。
4. `GEMINI_API_KEY` を用意（Google AI Studio）。
5. 上記を `.env.local` に設定（ローカル）し、**Vercel のプロジェクト環境変数にも同じ4つを登録**。
6. `npm run db:pull` → `npm run db:push` でスキーマを同期。
7. `npm run dev` で動作確認 → Vercel にデプロイ。

> メモ:
> - 認証は `@neondatabase/auth`（Better Auth ベース）を使用しています（現時点ではベータ版）。
> - メール確認の有無は Neon Auth 側の設定に依存します。
> - `logs.user_id` は Neon Auth のユーザーID（text）を保持します。`db:pull` 後、必要なら `neon_auth` の user テーブルへ外部キーを追加できます。
