import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";

// ユーザーは Neon Auth (Better Auth) が neon_auth スキーマで管理する。
// ここでは userId として Better Auth のユーザーID(text)を保持する。
// （クロススキーマの外部キーは貼らず、drizzle-kit pull 後に必要なら追加する）

// 日記ログ
export const logs = pgTable("logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // Neon Auth のユーザーID
  content: text("content").notNull(), // 「今日やったこと」
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI解析結果（1つのログに対して1つの解析）
export const aiAnalyses = pgTable("ai_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  logId: uuid("log_id")
    .references(() => logs.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  strength: varchar("strength", { length: 50 }), // 例: 「リーダーシップ」「粘り強さ」
  esReadyText: text("es_ready_text"), // ESにそのまま使える文章案
  followUpQuestions: text("follow_up_questions"), // 面接で深掘りされそうな質問
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});
