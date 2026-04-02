// backend/src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { analyzeGakuchika } from "./lib/gemini";
import { requireAuth, AuthRequest } from "./middleware/auth";

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

app.post("/logs", requireAuth, async (req: AuthRequest, res: any) => {
  try {
    const { content, targetJob } = req.body;
    const userId = req.user?.id || "unknown-user";

    console.log(`分析開始 (User: ${userId}):`, content);

    // AIで分析を実行
    const analysisResult = await analyzeGakuchika(content, targetJob);

    // AIの結果をフロントエンドに返す
    res.json({
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
