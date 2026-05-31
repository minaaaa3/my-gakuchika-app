# 🚀 ガクチカ・ログ (Gakuchika-log)

### 〜 日常の何気ない行動を、内定レベルの「強み」にリフレーミング 〜

「ガクチカ（学生時代に力を入れたこと）が書けない」「日常的に何かはしているけど、言語化できない」
そんな就活生の悩みを解決するために生まれた、**AI（Gemini）搭載型のガクチカ生成・管理アプリ**です。

---

## 💡 コンセプト

多くの学生は、日々素晴らしい行動をしていても「これはガクチカにするほどではない」と謙遜したり、言語化に苦労したりします。
『ガクチカ・ログ』は、**「今日やったこと」を一行書くだけで、AIがその行動をビジネススキルに変換し、ES（エントリーシート）レベルの文章へと昇華させます。**

- **日記を「実績」へ**: 「バイトで話し合った」→「組織内調整力を活かしたボトムアップの提案」
- **不足を「補完」**: 行動の背景や工夫をAIがプロの視点で補完し、説得力を高めます。
- **面接を「シミュレート」**: 生成された文章に対し、面接官が聞きそうな「深掘り質問」も自動生成。

---

## ✨ 主な機能

- **📝 ログ記録**: 
  - 日常の些細な行動や気づきを、チャット感覚で素早く記録。
- **🤖 AIリフレーミング (Gemini 1.5 Flash)**:
  - 入力されたログを、志望職種に合わせてビジネス用語で再構築。
  - 【結論・行動・結果】の構成で、そのままESに使える文章（約300字）を生成。
- **🎯 職種別最適化**:
  - ユーザーの志望職種（営業、エンジニア、企画など）に応じて、AIが強調すべき強みを選択。
- **❓ 深掘り質問の生成**:
  - 面接で想定される質問をAIが提案。自己分析の深化をサポート。
- **🔐 セキュアな認証**:
  - Supabase Authを利用した安心のログイン・データ管理。

---

## 🛠 技術スタック

本プロジェクトは、最新のライブラリとモダンなアーキテクチャを採用しています。

### Frontend / Backend (Full-stack)
- **Framework**: [Next.js](https://nextjs.org/) (App Router / React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4.0](https://tailwindcss.com/) (最新のCSSエンジン)
- **Database**: [Neon](https://neon.tech/) (Serverless PostgreSQL)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [Supabase Auth](https://supabase.com/auth) (SSR統合)
- **AI Integration**: [Google Gemini 1.5 Flash API](https://ai.google.dev/)
- **Animations**: [Lottie-react](https://github.com/LottieFiles/lottie-react)

---

## 🧠 AIリフレーミングの仕組み

本アプリの核となるAIロジックは、単なる文章の整形ではなく、**「事実（Fact）の抽出とプロフェッショナルな再解釈」**を行っています。

1.  **ビジネススキルへの変換**:
    - 「話し合った」→「調整能力」「ファシリテーション」
    - 「頑張った」→「継続的な改善」「目標達成意欲」
    - ユーザーの素朴な言葉を、企業が求める能力定義に変換します。

2.  **リアリティのある補完**:
    - 日記には書かれにくい「なぜそれをしたのか（背景）」「どんな壁があったのか（苦労）」を、プロのキャリアアドバイザーの視点から推論し、説得力のある物語として肉付けします。

3.  **職種別プロンプトエンジニアリング**:
    - 営業志望なら「行動量や成果」を、エンジニア志望なら「論理的思考や技術的解決」を強調するように、Geminiへのプロンプトを動的に調整しています。

---

## 📂 プロジェクト構造

```text
.
├── frontend/               # メインアプリケーション
│   ├── app/                # App Router (Pages, Layouts, API Routes)
│   │   ├── api/            # AI分析やデータ取得のAPIエンドポイント
│   │   └── login/          # 認証ページ
│   ├── components/         # 再利用可能なUIコンポーネント
│   ├── lib/                # コアロジック
│   │   ├── ai/             # Gemini API 連携プロンプト・ロジック
│   │   └── db/             # Drizzle スキーマ、データベース接続
│   ├── utils/              # Supabase クライアント等のユーティリティ
│   ├── drizzle/            # マイグレーションファイル
│   └── public/             # 静的資産（Lottieアニメーション等）
└── README.md               # 本ドキュメント
```

---

## ⚙️ セットアップ

### 1. プリレクイジット
- Node.js (v20以上推奨)
- [Supabase](https://supabase.com/) プロジェクト
- [Neon](https://neon.tech/) データベース (PostgreSQL)
- [Google AI Studio](https://aistudio.google.com/) からの Gemini API キー

### 2. 環境変数の設定
`frontend/.env.local` を作成し、以下の情報を入力してください。

```env
# Supabase (Auth & Client)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database (Neon / PostgreSQL)
DATABASE_URL=your_neon_postgresql_url

# AI (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. インストールと起動

```bash
# 依存関係のインストール
cd frontend
npm install

# データベースのマイグレーション
npm run db:generate
npm run db:migrate

# 開発サーバーの起動
npm run dev
```

`http://localhost:3000` でアプリが起動します。

---

## 🚀 今後の展望

- **エピソードの統合**: 複数のログを組み合わせて、一つの大きな物語（ガクチカ）を作る機能。
- **文章の長さ調整**: 200字、400字、800字など、提出先に合わせた出力。
- **自己分析マップ**: 記録されたログから、自分の「強みの傾向」を視覚化する機能。

---

## 📄 ライセンス

[MIT License](LICENSE) (もしあれば)

---

*このプロジェクトは、就活生が自信を持って一歩を踏み出せるようにサポートすることを目指しています。*
