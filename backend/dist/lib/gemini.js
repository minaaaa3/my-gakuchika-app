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
exports.analyzeGakuchika = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../.env") });
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ エラー: GEMINI_API_KEY が .env から読み込めていません！");
}
else {
    console.log("✅ GEMINI_API_KEY 読み込み成功");
    // 利用可能なモデルを確認
    fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
        .then((res) => res.json())
        .then((data) => {
        var _a;
        console.log("📋 利用可能なモデル一覧:");
        (_a = data.models) === null || _a === void 0 ? void 0 : _a.forEach((model) => {
            var _a;
            if ((_a = model.supportedGenerationMethods) === null || _a === void 0 ? void 0 : _a.includes("generateContent")) {
                console.log(`  ✅ ${model.name}`);
            }
        });
    })
        .catch((err) => console.error("モデル一覧取得エラー:", err));
}
const analyzeGakuchika = (content_1, ...args_1) => __awaiter(void 0, [content_1, ...args_1], void 0, function* (content, targetJob = "未定") {
    const prompt = `
あなたは超一流のキャリアアドバイザーです。
【絶対ルール】
- ユーザーが入力した「日記の言葉」をそのまま「強み」や「結論」に使ってはいけません。
- 日記が「バイトで話し合った」なら、それを「組織内調整力」や「ボトムアップの提案力」など、必ず【ビジネス用語】に変換してください。
- 日記に書かれていない「背景・苦労・工夫・結果」を、プロの視点でリアリティを持って創作・補完してください。
- 出力に「日記」という言葉を含めないでください。

以下の日記を、志望職種「${targetJob}」で評価されるガクチカ（学生時代に力を入れたこと）にリフレーミングして。

【日記原文】
"${content.trim()}"

【変換のヒント】
- 「話し合った」→ チームの意思決定、対話による課題解決、合意形成
- 「頑張った」→ 目標達成への執着、継続的改善、セルフマネジメント

【出力はJSON形式のみで、説明文は不要です】
{
  "strength": "一言で表すビジネススキル名",
  "es_ready_text": "300字程度の内定レベルの文章（【結論】【行動】【結果】の構成）",
  "follow_up_questions": ["質問1", "質問2", "質問3"]
}
`;
    // 試すモデル名のリスト（優先順位順）
    const modelNames = [
        "models/gemini-2.5-flash",
        "models/gemini-2.5-pro",
        "models/gemini-2.0-flash",
        "models/gemini-flash-latest",
        "models/gemini-pro-latest",
    ];
    let lastError = null;
    // 利用可能なモデルを順番に試す
    for (const modelName of modelNames) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
            console.log(`🔄 モデル ${modelName} を試行中...`);
            const response = yield fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }],
                        },
                    ],
                    generationConfig: {
                        temperature: 1.0,
                        maxOutputTokens: 2048,
                    },
                }),
            });
            if (response.ok) {
                const data = yield response.json();
                const responseText = data.candidates[0].content.parts[0].text;
                console.log(`✅ ${modelName} で成功!`);
                console.log("🔍 Gemini Response:", responseText);
                // JSONブロックや不要なテキストを確実に取り除く
                const jsonMatch = responseText.match(/```[a-zA-Z]*\s*([\s\S]*?)\s*```/);
                let jsonText = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
                // 途中で途切れて ``` が閉じられていない場合などに備えて直接除去
                jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/i, "").replace(/\s*```$/i, "").trim();
                // JSONの波括弧 {...} の部分だけを抽出（前後の挨拶などを無視）
                const firstBrace = jsonText.indexOf('{');
                const lastBrace = jsonText.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
                    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
                }
                return JSON.parse(jsonText);
            }
            else {
                const errorText = yield response.text();
                console.log(`❌ ${modelName} は利用不可: ${response.status}`);
                lastError = new Error(`HTTP error! status: ${response.status}`);
            }
        }
        catch (error) {
            console.log(`❌ ${modelName} でエラー:`, error);
            lastError = error;
        }
    }
    console.error("全てのモデルで失敗しました");
    throw lastError || new Error("AIが正常に思考できませんでした。");
});
exports.analyzeGakuchika = analyzeGakuchika;
