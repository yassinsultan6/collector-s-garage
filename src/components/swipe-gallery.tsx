"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

interface SwipeGalleryProps {
  items: Array<{ title: string; before: string; after: string }>;
}

export function SwipeGallery({ items }: SwipeGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const activeItem = useMemo(() => items[activeIndex] ?? items[0], [activeIndex, items]);

  const changeSlide = (next: number) => {
    setActiveIndex((current) => (next + items.length) % items.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStart;
    if (delta > 60) changeSlide(activeIndex - 1);
    if (delta < -60) changeSlide(activeIndex + 1);
    setTouchStart(null);
  };

  if (!activeItem) return null;

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/70"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeItem.title}
            src={activeItem.after}
            alt={activeItem.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="h-72 w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/80 to-transparent p-4">
          <div>
            <p className="text-sm font-semibold text-white">{activeItem.title}</p>
            <p className="text-xs text-slate-300">Swipe to browse the collection story</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => changeSlide(activeIndex - 1)} className="rounded-full border border-white/15 bg-slate-950/60 p-2 text-slate-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => changeSlide(activeIndex + 1)} className="rounded-full border border-white/15 bg-slate-950/60 p-2 text-slate-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {items.map((item, index) => (
          <button key={item.title} type="button" onClick={() => setActiveIndex(index)} className={`h-2 flex-1 rounded-full ${index === activeIndex ? "bg-amber-300" : "bg-white/15"}`} />
        ))}
      </div>
    </div>
  );
}
