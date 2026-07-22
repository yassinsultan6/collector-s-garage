"use client";

import { motion } from "framer-motion";

const glows = [
  { id: 1, className: "left-[-8%] top-[-10%] h-64 w-64 rounded-full bg-amber-400/20 blur-[120px]" },
  { id: 2, className: "right-[-5%] top-[8%] h-72 w-72 rounded-full bg-cyan-400/15 blur-[140px]" },
  { id: 3, className: "bottom-[-8%] left-[20%] h-80 w-80 rounded-full bg-fuchsia-500/15 blur-[140px]" },
];

const particles = [
  { id: 1, top: "12%", left: "12%", size: 8 },
  { id: 2, top: "28%", left: "72%", size: 5 },
  { id: 3, top: "70%", left: "18%", size: 10 },
  { id: 4, top: "58%", left: "84%", size: 6 },
  { id: 5, top: "36%", left: "44%", size: 7 },
];

export default function AnimatedAuroraBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_35%)]">
        {glows.map((glow) => (
          <motion.div
            key={glow.id}
            className={glow.className}
            animate={{ x: [0, 20, -12, 0], y: [0, -18, 10, 0], scale: [1, 1.08, 0.96, 1] }}
            transition={{ duration: 14 + glow.id * 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        ))}

        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/70"
            style={{ top: particle.top, left: particle.left, width: particle.size, height: particle.size }}
            animate={{ y: [0, -18, 0], x: [0, 12, -8, 0], opacity: [0.4, 0.9, 0.45] }}
            transition={{ duration: 8 + particle.id, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
