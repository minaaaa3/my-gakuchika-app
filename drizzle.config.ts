import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Next.js と同じ .env.local を読む
config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
