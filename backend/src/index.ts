// backend/src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { analyzeGakuchika } from "./lib/gemini";
import { requireAuth, AuthRequest } from "./middleware/auth";
import { db } from "./db/index";
import { users, logs, aiAnalyses } from "./db/schema";
import { eq, desc } from "drizzle-orm";

const app = express();
const PORT = process.env.PORT || 5000;

// 【重要】ここでチェック！
console.log("--- サーバー起動チェック ---");
console.log(
  "取得したAPIキー:",
  process.env.GEMINI_API_KEY
    ? "✅ OK (先頭3文字: " + process.env.GEMINI_API_KEY.substring(0, 3) + ")"
    : "❌ 未設定"
);
console.log("ポート番号:", PORT);
console.log("---------------------------");

// ミドルウェア
app.use(cors());
app.use(express.json());

// ヘルスチェック
app.get("/", (_req, res) => {
  res.send("Gakuchika Log API is running!");
});

// 履歴取得エンドポイント
app.get("/logs", requireAuth, async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // 履歴をデータベースから取得（新しい順）
    // logs と aiAnalyses を結合
    const userLogs = await db
      .select({
        id: logs.id,
        content: logs.content,
        createdAt: logs.createdAt,
        strength: aiAnalyses.strength,
        esReadyText: aiAnalyses.esReadyText,
      })
      .from(logs)
      .leftJoin(aiAnalyses, eq(logs.id, aiAnalyses.logId))
      .where(eq(logs.userId, userId))
      .orderBy(desc(logs.createdAt));

    res.json(userLogs);
  } catch (error: any) {
    console.error("Fetch Logs Error:", error);
    res.status(500).json({ error: "履歴の取得に失敗しました" });
  }
});

// 分析実行・保存エンドポイント
app.post("/logs", requireAuth, async (req: AuthRequest, res: any) => {
  try {
    const { content, targetJob } = req.body;
    const userId = req.user?.id;
    const email = req.user?.email;

    if (!userId || !email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log(`分析開始 (User: ${userId}):`, content);

    // 1. ユーザーをDBに同期 (存在しなければ作成)
    // drizzle-orm の upsert パターン
    await db.insert(users)
      .values({ id: userId, email: email })
      .onConflictDoNothing();

    // 2. AIで分析を実行
    const analysisResult = await analyzeGakuchika(content, targetJob);

    // 3. データベースに保存
    const [insertedLog] = await db.insert(logs).values({
      userId: userId,
      content: content,
    }).returning({ id: logs.id });

    await db.insert(aiAnalyses).values({
      logId: insertedLog.id,
      strength: analysisResult.strength,
      esReadyText: analysisResult.es_ready_text,
      followUpQuestions: JSON.stringify(analysisResult.follow_up_questions),
    });

    // AIの結果をフロントエンドに返す
    res.json({
      id: insertedLog.id,
      analysis: analysisResult,
    });
  } catch (error: any) {
    console.error("Analysis Error Details:", error);
    res.status(500).json({ 
      error: "分析に失敗しました", 
      message: error.message || "Unknown error" 
    });
  }
});

// テスト用にappをエクスポート
export default app;

// サーバー起動(テスト時は起動しない)
if (require.main === module) {
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
