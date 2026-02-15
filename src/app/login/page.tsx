"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Invalid credentials");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📊</div>
          <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Project Dashboard</h1>
          <p className="mt-2 text-sm" style={{ color: "#94a3b8" }}>Executive project management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500"
              style={{ background: "#0f172a", color: "#f1f5f9", border: "1px solid #334155" }}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500"
              style={{ background: "#0f172a", color: "#f1f5f9", border: "1px solid #334155" }}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
