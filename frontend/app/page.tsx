"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Quote } from "lucide-react";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/loading-bot.json";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

// 型定義
interface AnalysisResult {
  strength: string;
  es_ready_text: string;
}

// --- 手書き風カスタムアイコン ---
const HandDrawnPencil = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="rotate-[-10deg]"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    <path d="M15 5l3 3" />
  </svg>
);

const HandDrawnGradCap = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="scale-110"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

export default function GakuchikaPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAnalyze = async () => {
    if (!user) {
      alert("ログインしてください！");
      return;
    }

    setLoading(true);
    // 演出のために最低1.5秒はローディングを見せる
    const start = Date.now();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/logs`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) {
        throw new Error("APIエラー: " + response.statusText);
      }

      const data = await response.json();

      const elapsed = Date.now() - start;
      setTimeout(() => {
        setResult(data.analysis);
        setLoading(false);
      }, Math.max(0, 1500 - elapsed));
    } catch (e: any) {
      setLoading(false);
      alert(e.message || "エラーが発生しました！");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#2d2d2d] font-sans selection:bg-yellow-200 overflow-x-hidden">
      {/* 背景装飾 */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] -z-10 opacity-60" />

      {/* ナビゲーション */}
      <nav className="p-8 max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-indigo-600 p-2 rounded-2xl rotate-[-6deg] group-hover:rotate-0 transition-all shadow-lg">
            <HandDrawnGradCap />
          </div>
          <span className="font-black text-2xl tracking-tighter italic">
            Gakuchika Log
          </span>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500 hidden sm:inline-block">{user.email}</span>
              <button 
                onClick={handleLogout}
                className="text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="bg-slate-900 text-white text-sm font-bold py-2 px-6 rounded-full hover:bg-slate-800 transition-colors shadow-md"
            >
              ログイン
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pb-24 space-y-12">
        {/* ヒーロー */}
        <section className="pt-10 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black leading-tight">
            ガクチカは、
            <br />
            <span className="relative inline-block">
              日常から生まれる。
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="8"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5C20 2 40 8 60 5C80 2 100 5 100 5"
                  stroke="#6366f1"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
        </section>

        {/* 入力フォーム */}
        {!loading && !result && (
          <div
            className="
    group
    relative 
    bg-white 
    rounded-[2.5rem] 
    border-[3px] 
    border-slate-900 
    p-8 
    shadow-[8px_8px_0_0_#1e293b] 
    transition-all 
    duration-200
    /* フォーカス時にカードを少し右下にずらし、影を短くする（押し込み感） */
    focus-within:translate-x-[2px] 
    focus-within:translate-y-[2px] 
    focus-within:shadow-[5px_5px_0_0_#1e293b]
  "
          >
            <div className="flex items-center gap-2 mb-6 font-bold transition-colors duration-300 group-focus-within:text-indigo-600 text-slate-400">
              {/* フォーカス時にアイコンを揺らすアニメーション */}
              <div className="group-focus-within:animate-bounce">
                <HandDrawnPencil />
              </div>
              <span>今日頑張ったことをラフに書こう</span>
            </div>

            <textarea
              className="
        w-full h-48 p-4 
        rounded-2xl
        border-none 
        focus:ring-0 
        text-xl 
        placeholder:text-slate-300 
        resize-none 
        font-medium 
        leading-relaxed 
        bg-transparent
        transition-colors
        /* 入力中にうっすらと色を付ける */
        focus:bg-indigo-50/30
      "
              placeholder="例：バイトで後輩がミスした時、怒るんじゃなくて一緒に原因を考えた。"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button
              onClick={handleAnalyze}
              disabled={!text}
              className="
        w-full mt-6 
        bg-indigo-600 
        hover:bg-indigo-700 
        disabled:bg-slate-200 
        text-white 
        font-black 
        py-5 
        rounded-2xl 
        flex items-center justify-center gap-3 
        transition-all 
        active:scale-[0.98] 
        shadow-[0_6px_0_rgb(49,46,129)]
        /* 未入力時は少し透明に、入力時はハッキリ */
        disabled:opacity-50
      "
            >
              強みを分析する <Sparkles size={20} />
            </button>
          </div>
        )}

        {/* Lottieローディング表示 */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-90">
            <div className="w-64 h-64">
              <Lottie animationData={loadingAnimation} loop={true} />
            </div>
            <div className="text-center space-y-2">
              <p className="font-black text-2xl text-indigo-600 animate-bounce">
                AIがあなたの強みを探しています
              </p>
              <p className="text-slate-400 font-medium">
                これ、実はすごい経験かも...
              </p>
            </div>
          </div>
        )}

        {/* 解析結果表示 */}
        {result && !loading && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
            <div className="bg-[#EEF2FF] border-[3px] border-indigo-600 p-10 rounded-[3rem] relative shadow-[8px_8px_0_0_#4f46e5]">
              <div className="flex flex-col gap-2">
                <span className="text-indigo-600 font-black tracking-widest text-sm uppercase">
                  Strength Found!
                </span>
                <h3 className="text-4xl font-black text-indigo-950">
                  ✨ {result.strength}
                </h3>
              </div>
            </div>

            <div className="bg-white p-8 border-2 border-dashed border-slate-300 rounded-[2.5rem] relative">
              <h4 className="absolute -top-4 left-8 bg-rose-500 text-white px-4 py-1 rounded-lg font-bold text-sm -rotate-2">
                ESにそのまま使える文章案
              </h4>
              <p className="text-lg leading-loose text-slate-700 font-medium whitespace-pre-wrap pt-4">
                {result.es_ready_text}
              </p>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setResult(null)}
                  className="text-slate-400 hover:text-indigo-600 font-bold transition-colors"
                >
                  もう一度書き直す
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
