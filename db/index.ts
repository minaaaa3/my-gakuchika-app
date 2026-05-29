import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  console.error("❌ エラー: DATABASE_URL が設定されていません！");
}

// Neon の serverless ドライバ（Vercel のサーバーレス環境向け）。
// DATABASE_URL 未設定でもビルド（page data 収集）が落ちないようプレースホルダにフォールバックする。
// neon() は接続文字列の構築時には接続せず、クエリ実行時に初めて接続する。
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
