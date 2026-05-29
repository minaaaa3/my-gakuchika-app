"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0],
        });
        if (error) throw new Error(error.message);
        setMessage(
          "登録しました。メール確認が有効な場合は、届いたメールのリンクをクリックしてください。完了後にログインできます。"
        );
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });
        if (error) throw new Error(error.message);
        window.location.href = "/"; // ログイン成功時にトップページへリダイレクト
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "認証に失敗しました。";
      setMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-6">
      <div className="bg-white p-8 rounded-[2.5rem] border-[3px] border-slate-900 shadow-[8px_8px_0_0_#1e293b] w-full max-w-md">
        <h2 className="text-2xl font-black text-center mb-6">
          {isSignUp ? "新規登録" : "ログイン"}
        </h2>
        
        {message && (
          <div className="mb-4 p-4 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:ring-0 outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:ring-0 outline-none transition-colors"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_0_rgb(49,46,129)] active:translate-y-1 active:shadow-none mt-4"
          >
            {loading ? "処理中..." : (isSignUp ? "登録する" : "ログイン")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-slate-500 hover:text-indigo-600 font-bold text-sm underline underline-offset-4"
          >
            {isSignUp ? "既にアカウントをお持ちの方はこちら" : "初めての方はこちら（新規登録）"}
          </button>
        </div>
      </div>
    </div>
  );
}
