import path from "path";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ エラー: GEMINI_API_KEY が環境変数に設定されていません！");
}

interface GeminiResponse {
  strength: string;
  es_ready_text: string;
  follow_up_questions: string[];
}

export const analyzeGakuchika = async (
  content: string,
  targetJob: string = "未定"
): Promise<GeminiResponse> => {
  if (!apiKey) {
    throw new Error("APIキーが設定されていないため、AI分析を実行できません。");
  }

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

  // 利用可能な最新のモデル名のリスト
  const modelNames = [
    "models/gemini-2.0-flash",
    "models/gemini-1.5-flash",
    "models/gemini-flash-latest",
    "models/gemini-pro-latest",
  ];

  let lastError: Error | null = null;

  for (const modelName of modelNames) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

      console.log(`🔄 モデル ${modelName} を試行中...`);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 1.0, maxOutputTokens: 2048 },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ ${modelName} 失敗 (${response.status}):`, errorData);
        lastError = new Error(`Gemini API Error (${modelName}): ${response.status} ${JSON.stringify(errorData)}`);
        continue;
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        console.warn(`⚠️ ${modelName} からの回答が空です（安全フィルターの可能性があります）`);
        continue;
      }

      const responseText = data.candidates[0].content.parts[0].text;
      console.log(`✅ ${modelName} で成功!`);

      // JSONの抽出ロジック
      const jsonMatch = responseText.match(/```[a-zA-Z]*\s*([\s\S]*?)\s*```/);
      let jsonText = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
      jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/i, "").replace(/\s*```$/i, "").trim();

      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
      }

      return JSON.parse(jsonText) as GeminiResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ ${modelName} で例外発生:`, message);
      lastError = error instanceof Error ? error : new Error(message);
    }
  }

  throw lastError || new Error("AIが正常に思考できませんでした。全モデルが失敗しました。");
};
