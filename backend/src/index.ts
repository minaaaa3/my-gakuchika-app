// backend/src/index.ts
import express from "express";
import cors from "cors";
import { analyzeGakuchika } from "./lib/gemini";
// 【重要】ここでチェック！
console.log("--- サーバー起動チェック ---");
console.log(
  "取得したAPIキー:",
  process.env.GEMINI_API_KEY
    ? "✅ OK (先頭3文字: " + process.env.GEMINI_API_KEY.substring(0, 3) + ")"
    : "❌ 消えています"
);
console.log("---------------------------");
const app = express();
const PORT = 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// ヘルスチェック
app.get("/", (_req, res) => {
  res.send("Gakuchika Log API is running!");
});

app.post("/logs", async (req, res) => {
  try {
    const { content, targetJob } = req.body;

    console.log("分析開始:", content);

    // AIで分析を実行
    const analysisResult = await analyzeGakuchika(content, targetJob);

    // AIの結果をフロントエンドに返す
    res.json({
      analysis: analysisResult,
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "分析に失敗しました" });
  }
});

// テスト用にappをエクスポート
export default app;

// サーバー起動(テスト時は起動しない)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
