"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { credentials: "include" });
        const session = (await response.json().catch(() => ({}))) as { authenticated?: boolean };
        if (response.ok && session.authenticated) {
          router.replace("/admin");
        }
      } catch {
        // ignore
      }
    };

    void checkSession();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(result.error || "Unable to sign in");
        setPending(false);
        return;
      }

      router.replace("/admin");
    } catch {
      setError("Unable to sign in right now");
      setPending(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-2 py-8 sm:px-4">
      <div className="w-full rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-600">Secure access</p>
            <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">Use the credentials for the private collection area.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none ring-0"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none ring-0"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p className="text-sm text-rose-700">{error}</p> : null}

          <button type="submit" disabled={pending} className="w-full rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70">
            {pending ? "Signing in..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
