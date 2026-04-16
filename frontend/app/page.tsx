"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Quote } from "lucide-react";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/loading-bot.json";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

// Types
interface AnalysisResult {
  strength: string;
  es_ready_text: string;
}

interface LogItem {
  id: string;
  content: string;
  createdAt?: string;
  created_at?: string;
  strength?: string;
  esReadyText?: string;
  es_ready_text?: string;
  analysis?: {
    strength: string;
    es_ready_text: string;
  };
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
  const [history, setHistory] = useState<LogItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const supabase = createClient();

  // カレンダー用のヘルパー
  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );

  const fetchHistory = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      console.log(`Fetching logs from: ${apiUrl}/logs`);

      const response = await fetch(`${apiUrl}/logs`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`Successfully fetched ${data.length} logs.`);
        setHistory(data);
      } else {
        console.error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
      }

    } catch (e) {
      console.error("履歴の取得に失敗:", e);
    }
  };

  useEffect(() => {
    // --- 環境変数チェックログ ---
    console.log("--- フロントエンド環境変数チェック ---");
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log(
      "Supabase URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ 設定あり" : "❌ 未設定"
    );
    console.log("-----------------------------------");

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchHistory();
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) fetchHistory();
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            "APIエラー: " + response.statusText
        );
      }

      const data = await response.json();
      await fetchHistory();

      const elapsed = Date.now() - start;
      setTimeout(() => {
        setResult(data.analysis);
        setLoading(false);
      }, Math.max(0, 1500 - elapsed));
    } catch (e) {
      setLoading(false);
      const message = e instanceof Error ? e.message : "エラーが発生しました！";
      alert(message);
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
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-500 hidden sm:inline-block">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors"
                >
                  ログアウト
                </button>
              </div>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-black transition-all
                  ${
                    showCalendar
                      ? "bg-indigo-600 text-white shadow-md scale-105"
                      : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-2 border-indigo-100 shadow-sm"
                  }
                `}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                ログカレンダー
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

        {/* 履歴表示（カレンダー形式） */}
        {user && !loading && showCalendar && (
          <section className="pt-10 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-center">
              <h3
                className="text-2xl font-black flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => setShowCalendar(false)}
              >
                <Quote className="text-indigo-600" />
                ログカレンダー
              </h3>
              <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border-2 border-slate-100 shadow-sm">
                <button
                  onClick={prevMonth}
                  className="p-1 hover:bg-slate-50 rounded-lg transition-colors font-bold text-indigo-600"
                >
                  &lt;
                </button>
                <span className="font-bold text-sm min-w-[100px] text-center">
                  {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-slate-50 rounded-lg transition-colors font-bold text-indigo-600"
                >
                  &gt;
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border-[3px] border-slate-900 shadow-[8px_8px_0_0_#1e293b]">
              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                  <div
                    key={day}
                    className={`text-center text-xs font-black uppercase tracking-widest ${
                      i === 0
                        ? "text-rose-500"
                        : i === 6
                        ? "text-indigo-500"
                        : "text-slate-400"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* カレンダーグリッド */}
              <div className="grid grid-cols-7 gap-2">
                {/* 月の開始前の空白 */}
                {Array.from({
                  length: getFirstDayOfMonth(
                    currentDate.getFullYear(),
                    currentDate.getMonth()
                  ),
                }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* 日付セル */}
                {Array.from({
                  length: getDaysInMonth(
                    currentDate.getFullYear(),
                    currentDate.getMonth()
                  ),
                }).map((_, i) => {
                  const day = i + 1;
                  const targetDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  );

                  const logsOnDay = history.filter((item) => {
                    const dateValue = item.createdAt || item.created_at;
                    if (!dateValue) return false;
                    const logDate = new Date(dateValue);
                    return (
                      logDate.getFullYear() === targetDate.getFullYear() &&
                      logDate.getMonth() === targetDate.getMonth() &&
                      logDate.getDate() === targetDate.getDate()
                    );
                  });

                  return (
                    <div
                      key={day}
                      className={`
                        aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative cursor-default
                        ${
                          logsOnDay.length > 0
                            ? "bg-indigo-50 cursor-pointer hover:scale-105 active:scale-95 group"
                            : "hover:bg-slate-50"
                        }
                      `}
                      onClick={() => {
                        if (logsOnDay.length > 0) {
                          const item = logsOnDay[0];
                          setResult({
                            strength:
                              item.strength ||
                              item.analysis?.strength ||
                              "分析結果なし",
                            es_ready_text:
                              item.esReadyText ||
                              item.es_ready_text ||
                              item.analysis?.es_ready_text ||
                              "文章が生成されていません",
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                    >
                      <span
                        className={`text-sm font-bold ${
                          logsOnDay.length > 0
                            ? "text-indigo-600"
                            : "text-slate-500"
                        }`}
                      >
                        {day}
                      </span>
                      {logsOnDay.length > 0 && (
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1 group-hover:animate-ping" />
                      )}

                      {/* ツールチップ的なポップアップ（ホバー時） */}
                      {logsOnDay.length > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-3 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                          <p className="font-bold mb-1 text-indigo-300">
                            {logsOnDay[0].strength || "分析中"}
                          </p>
                          <p className="line-clamp-2 text-slate-300 leading-relaxed">
                            {logsOnDay[0].content}
                          </p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {history.length === 0 && (
              <p className="text-slate-400 font-medium py-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                まだログはありません。今日の頑張りを記録しましょう！
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
