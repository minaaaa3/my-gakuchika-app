import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

// 環境変数からSupabase情報を取得
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase URL or Key is missing in environment variables.");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

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
    
    // Supabase で JWT トークンを検証し、ユーザー情報を取得
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("Auth Error:", error);
      res.status(401).json({ error: "トークンが無効です" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ error: "サーバーエラー" });
  }
};
