import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ユーザー情報
export const users = pgTable("users", {
  id: text("id").primaryKey(), // ClerkのuserId (user_...) をそのまま使用
  email: varchar("email", { length: 255 }).notNull().unique(),
  targetJob: varchar("target_job", { length: 100 }), // 志望職種（AIの変換精度を上げるため）
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 日記ログ
export const logs = pgTable("logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(), // 「今日やったこと」
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI解析結果（1つのログに対して1つの解析）
export const aiAnalyses = pgTable("ai_analyses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  logId: uuid("log_id")
    .references(() => logs.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  strength: varchar("strength", { length: 50 }), // 例: 「リーダーシップ」「粘り強さ」
  esReadyText: text("es_ready_text"), // ESにそのまま使える文章案
  followUpQuestions: text("follow_up_questions"), // 面接で深掘りされそうな質問
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});
