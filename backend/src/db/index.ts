import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

if (!process.env.DATABASE_URL) {
  console.error("❌ エラー: DATABASE_URL が設定されていません！");
} else {
  // パスワードを隠して接続先を表示（デバッグ用）
  const url = new URL(process.env.DATABASE_URL.replace("[YOUR-PASSWORD]", "REDACTED"));
  console.log("--- 接続先デバッグ ---");
  console.log("ユーザー名:", url.username);
  console.log("ホスト名:", url.hostname);
  console.log("ポート:", url.port);
  console.log("データベース:", url.pathname);
  console.log("----------------------");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ データベース接続失敗:", err.message);
    if (err.message.includes("Tenant or user not found")) {
      console.error("👉 原因の可能性: プロジェクトID(ユーザー名)かパスワードが間違っています。URLエンコードが必要な記号が含まれていないか確認してください。");
    }
  } else {
    console.log("✅ データベース接続成功！");
    release();
  }
});
