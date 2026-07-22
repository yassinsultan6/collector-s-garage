"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Languages, LogIn, LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

interface AppShellProps {
  children: React.ReactNode;
}

interface SessionState {
  authenticated: boolean;
  user: {
    id: string;
    username: string;
    name: string;
    role: "viewer" | "co-admin" | "admin";
    canAccessAdmin: boolean;
  } | null;
}

const publicNavItems = [
  { href: "/", label: "Home", icon: Home },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useTranslation();
  const [session, setSession] = useState<SessionState>({ authenticated: false, user: null });
  const [sessionReady, setSessionReady] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Guest");

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { credentials: "include" });
        if (!response.ok) return;
        const nextSession = (await response.json()) as SessionState;
        setSession(nextSession);
        setDisplayName(nextSession.user?.name || nextSession.user?.username || "Guest");
      } finally {
        setSessionReady(true);
      }
    };

    void loadSession();
  }, []);

  const isPublicRoute = pathname === "/" || pathname === "/vehicles" || pathname.startsWith("/vehicles/") || pathname.startsWith("/vehicle/") || pathname === "/login";
  const isAdminRoute = pathname === "/admin";
  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    if (!sessionReady) return;

    if (isAdminRoute && !session.authenticated) {
      router.replace("/login");
      return;
    }

    if (isLoginRoute && session.authenticated) {
      router.replace("/admin");
      return;
    }

    if (session.authenticated && pathname === "/") {
      router.replace("/admin");
    }
  }, [isAdminRoute, isLoginRoute, pathname, router, session.authenticated, sessionReady]);

  const signOut = async () => {
    await fetch("/api/auth/session", { method: "DELETE", credentials: "include" });
    setSession({ authenticated: false, user: null });
    setDisplayName("Guest");
    router.replace("/");
  };

  const toggleLanguage = () => setLang(lang === "en" ? "ar" : "en");

  if (!sessionReady && !session.authenticated && isAdminRoute) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#fff7ed_100%)] px-4 py-8 text-slate-700 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white/90 p-6 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Loading</p>
          <p className="mt-3 text-lg text-slate-600">Preparing the secure area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#fff7ed_100%)] text-slate-800">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/yrlogo.png" alt="Yehia Rashdan" className="h-10 w-10 rounded-2xl object-contain" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Yehia Rashdan</p>
              <p className="text-xs text-slate-500">Private collection</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {publicNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${isActive ? "bg-amber-100 text-amber-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button type="button" onClick={toggleLanguage} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <Languages className="h-4 w-4" />
              {lang === "ar" ? "EN" : "AR"}
            </button>
            {session.authenticated ? (
              <button type="button" onClick={signOut} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <Link href="/login" className="flex items-center gap-2 rounded-full bg-amber-500 px-3 py-2 text-sm font-semibold text-white">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button type="button" onClick={toggleLanguage} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700">
              <Languages className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setMobileNavOpen((value) => !value)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {mobileNavOpen ? (
          <div className="border-t border-slate-200 bg-white/90 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {publicNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileNavOpen(false)} className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm ${isActive ? "bg-amber-100 text-amber-700" : "text-slate-600"}`}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {session.authenticated ? (
                <button type="button" onClick={() => { setMobileNavOpen(false); void signOut(); }} className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              ) : (
                <Link href="/login" onClick={() => setMobileNavOpen(false)} className="flex items-center justify-center gap-2 rounded-full bg-amber-500 px-3 py-2 text-sm font-semibold text-white">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {isPublicRoute ? children : children}
      </main>
    </div>
  );
}
