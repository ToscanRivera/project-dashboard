"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGithubSignIn = async () => {
    setLoading(true);
    await signIn("github", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📊</div>
          <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Project Dashboard</h1>
          <p className="mt-2 text-sm" style={{ color: "#94a3b8" }}>Executive project management</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleGithubSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ background: "linear-gradient(135deg, #333, #24292e)" }}
          >
            <svg 
              className="w-5 h-5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" 
                clipRule="evenodd" 
              />
            </svg>
            {loading ? "Signing in..." : "Sign in with GitHub"}
          </button>
          
          <div className="text-center text-sm" style={{ color: "#64748b" }}>
            <p>Sign in with your GitHub account to access the dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}