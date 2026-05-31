import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, logs, aiAnalyses } from "@/lib/db/schema";
import { analyzeGakuchika } from "@/lib/ai/gemini";
import { eq, desc } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    return NextResponse.json(userLogs);
  } catch (error) {
    console.error("Fetch Logs Error:", error);
    return NextResponse.json({ error: "履歴の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, targetJob } = await req.json();
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userEmail = user.primaryEmailAddress?.emailAddress || "";

    console.log(`分析開始 (User: ${userId}):`, content);

    // 1. ユーザーをDBに同期 (Neon DB)
    await db.insert(users)
      .values({ id: userId, email: userEmail })
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
      // followUpQuestions: JSON.stringify(analysisResult.follow_up_questions),
    });

    return NextResponse.json({
      id: insertedLog.id,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error("Analysis Error Details:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "分析に失敗しました", 
      message 
    }, { status: 500 });
  }
}
