import { createNeonAuth } from "@neondatabase/auth/next/server";

// サーバー側の Neon Auth インスタンス。
// - auth.handler()    → /api/auth/[...path] のルートハンドラ
// - auth.getSession() → サーバー側で現在のセッション/ユーザーを取得
// 環境変数は Neon Console で Neon Auth を有効化すると取得できる。
const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

// ビルド時（page data 収集）に実行時シークレットを要求して失敗しないよう、
// 未設定/不十分なときはプレースホルダにフォールバックする。
// ※ 実運用では Vercel / .env.local に必ず正しい値を設定すること（未設定だと認証は機能しない）。
if (!baseUrl || !cookieSecret || cookieSecret.length < 32) {
  console.warn(
    "⚠️ Neon Auth が未設定です。NEON_AUTH_BASE_URL と NEON_AUTH_COOKIE_SECRET(32文字以上) を設定してください。未設定のままでは認証は動作しません。"
  );
}

export const auth = createNeonAuth({
  baseUrl: baseUrl || "https://neon-auth-not-configured.invalid/auth",
  cookies: {
    // 32文字以上必須（openssl rand -base64 32 で生成）
    secret:
      cookieSecret && cookieSecret.length >= 32
        ? cookieSecret
        : "neon-auth-build-time-placeholder-secret-please-configure-env",
  },
});
