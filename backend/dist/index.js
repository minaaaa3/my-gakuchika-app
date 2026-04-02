"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/index.ts
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const gemini_1 = require("./lib/gemini");
const auth_1 = require("./middleware/auth");
// 【重要】ここでチェック！
console.log("--- サーバー起動チェック ---");
console.log("取得したAPIキー:", process.env.GEMINI_API_KEY
    ? "✅ OK (先頭3文字: " + process.env.GEMINI_API_KEY.substring(0, 3) + ")"
    : "❌ 消えています");
console.log("---------------------------");
const app = (0, express_1.default)();
const PORT = 5000;
// ミドルウェア
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ヘルスチェック
app.get("/", (_req, res) => {
    res.send("Gakuchika Log API is running!");
});
app.post("/logs", auth_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { content, targetJob } = req.body;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "unknown-user";
        console.log(`分析開始 (User: ${userId}):`, content);
        // AIで分析を実行
        const analysisResult = yield (0, gemini_1.analyzeGakuchika)(content, targetJob);
        // AIの結果をフロントエンドに返す
        res.json({
            analysis: analysisResult,
        });
    }
    catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: "分析に失敗しました" });
    }
}));
// テスト用にappをエクスポート
exports.default = app;
// サーバー起動(テスト時は起動しない)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
