interface GeminiResponse {
  strength: string;
  es_ready_text: string;
  follow_up_questions: string[];
}

export const analyzeGakuchika = async (
  content: string,
  targetJob: string = "未定"
): Promise<GeminiResponse> => {
  const apiKey = process.env.GEMINI_API_KEY;
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

【出力はJSON形式のみで、説明文は不要です】
{
  "strength": "一言で表すビジネススキル名",
  "es_ready_text": "300字程度の内定レベルの文章（【結論】【行動】【結果】の構成）",
  "follow_up_questions": ["質問1", "質問2", "質問3"]
}
`;

  try {
    // v1beta エンドポイントを使用（gemini-2.5-flash-lite用）
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    
    console.log(`🔄 Gemini v1beta API (gemini-2.5-flash-lite) に直接リクエスト中...`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ APIエラー (${response.status}):`, errorData);
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;

    console.log(`✅ AI応答を取得しました`);

    // JSONを抽出
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonText = responseText.substring(firstBrace, lastBrace + 1);
        return JSON.parse(jsonText) as GeminiResponse;
    }

    throw new Error("JSON形式の解析に失敗しました");
  } catch (error) {
    console.error(`❌ エラー詳細:`, error);
    throw new Error("AI分析中にエラーが発生しました。時間を置いて再度お試しください。");
  }
};
