"use client";

import { createAuthClient } from "@neondatabase/auth/next";

// クライアント側の Neon Auth クライアント。
// 同一オリジンの /api/auth を自動的に利用する（baseUrl 指定不要）。
// 利用例: authClient.signIn.email(...), authClient.signUp.email(...),
//        authClient.signOut(), authClient.useSession()
export const authClient = createAuthClient();
