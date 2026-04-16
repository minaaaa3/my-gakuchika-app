# Gakuchika-log (ガクチカ・ログ)

学生時代に力を入れたこと（ガクチカ）を整理・記録し、AI（Gemini）の力を借りてブラッシュアップするためのWebアプリケーションです。

## 🚀 プロジェクト概要

このプロジェクトは、就職活動や自己分析において重要な「ガクチカ」のエピソードを管理するために開発されました。
直感的なUIでエピソードを記録し、Gemini API を活用して内容の改善提案や要約を行うことができます。

### 主な機能

- **エピソード管理**: ガクチカの新規作成、編集、削除、一覧表示。
- **AI サポート**: Google Gemini API を使用した、エピソードの添削やアドバイス機能。
- **認証機能**: Supabase Auth を利用した、セキュアなユーザー認証。
- **レスポンシブデザイン**: PC、スマートフォンの両方で快適に利用可能。

## 🛠 技術スタック

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Animations**: Lottie-react
- **Auth/Client**: Supabase SSR

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (via Supabase)
- **AI SDK**: Google Generative AI (Gemini)
- **Testing**: Vitest, Supertest

## 🌐 デプロイ

このプロジェクトは **Vercel** にデプロイされています。

- **Frontend**: Vercel
- **Backend**: Vercel (Serverless Functions) または 外部プラットフォーム（構成に応じて）
- **Database**: Supabase

## 📂 ディレクトリ構造

```text
.
├── frontend/             # Next.js アプリケーション
│   ├── app/              # App Router ページ、レイアウト
│   ├── components/       # 共通コンポーネント
│   └── utils/            # Supabase クライアント等のユーティリティ
├── backend/              # Express API サーバー
│   ├── src/
│   │   ├── db/           # Drizzle スキーマ・接続設定
│   │   ├── lib/          # Gemini API 連携等のロジック
│   │   └── middleware/   # 認証ミドルウェア等
│   └── vitest.config.ts  # テスト設定
└── .github/workflows/    # CI/CD 設定 (GitHub Actions)
```

## ⚙️ セットアップ

### プリレクイジット
- Node.js (v18以上推奨)
- Supabase アカウント
- Google Gemini API キー

### 環境変数の設定

`frontend/.env.local` および `backend/.env` を作成し、必要な情報を入力してください。

**Frontend (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (.env):**
```env
DATABASE_URL=your_postgresql_url
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### インストールと起動

1. リポジトリのクローン
   ```bash
   git clone https://github.com/your-username/gakuchika-log.git
   cd gakuchika-log
   ```

2. 依存関係のインストール
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. 開発サーバーの起動
   ```bash
   # Frontend
   npm run dev

   # Backend
   npm run dev
   ```

## 🧪 テスト

バックエンドのテストを実行するには以下のコマンドを使用します。

```bash
cd backend
npm test
```
