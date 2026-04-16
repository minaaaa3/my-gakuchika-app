import { Request, Response, NextFunction } from "express";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

const getSupabase = () => {
  if (supabase) return supabase;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is missing in environment variables.");
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
};

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "認証トークンがありません" });
      return;
    }

    const token = authHeader.split(" ")[1];
    
    // Supabase インスタンスを取得
    const client = getSupabase();
    
    // Supabase で JWT トークンを検証し、ユーザー情報を取得
    const { data: { user }, error } = await client.auth.getUser(token);

    if (error || !user) {
      console.error("Auth Error:", error);
      res.status(401).json({ error: "トークンが無効です" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: "サーバーエラー", message });
  }
};
