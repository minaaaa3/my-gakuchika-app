import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  console.error("❌ エラー: DATABASE_URL が設定されていません！");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });

// 接続テスト
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Neonデータベース接続失敗:", err.message);
  } else {
    console.log("✅ Neonデータベース接続成功！");
    release();
  }
});
