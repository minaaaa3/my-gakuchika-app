import { auth } from "@/lib/auth/server";

// Neon Auth のクライアントからのリクエストを受け、Neon Auth サーバーへプロキシする。
export const { GET, POST } = auth.handler();
