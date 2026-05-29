import { createNeonAuth } from "@neondatabase/auth/next/server";

// サーバー側の Neon Auth インスタンス。
// - auth.handler()    → /api/auth/[...path] のルートハンドラ
// - auth.getSession() → サーバー側で現在のセッション/ユーザーを取得
// 環境変数は Neon Console で Neon Auth を有効化すると取得できる。
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    // 32文字以上必須（openssl rand -base64 32 で生成）
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
