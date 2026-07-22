import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AnimatedAuroraBackground from "@/components/animated-aurora-background";
import { AppShell } from "@/components/app-shell";
import I18nProvider from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yehia Rashdan",
  description: "Personal collection workspace for Yehia Rashdan.",
  icons: {
    icon: "/yrlogo.png",
    apple: "/yrlogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-800">
        <I18nProvider>
          <AnimatedAuroraBackground>
            <AppShell>{children}</AppShell>
          </AnimatedAuroraBackground>
        </I18nProvider>
      </body>
    </html>
  );
}
