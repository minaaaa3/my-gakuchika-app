"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-6">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
            card: 'rounded-[2.5rem] border-[3px] border-slate-900 shadow-[8px_8px_0_0_#1e293b]',
          }
        }}
        signUpUrl="/login" // 簡易化のため
      />
    </div>
  );
}
