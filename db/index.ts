import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  console.error("❌ エラー: DATABASE_URL が設定されていません！");
}

// Neon の serverless ドライバ（Vercel のサーバーレス環境向け）
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
