"use client";

import { useEffect, useState } from "react";

type Props = {
  images: string[];
  intervalMs?: number;
  alt?: string;
};

export default function HeroBackground({
  images,
  intervalMs = 6000,
  alt = "Hero background",
}: Props) {
  const list = (images || []).filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (list.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, intervalMs);
    
    return () => clearInterval(timer);
  }, [list.length, intervalMs]);

  if (list.length === 0) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#052e16]">
      {list.map((src, i) => {
        const isActive = i === index;
        return (
          <div
            key={`${src}-${i}`}
            className="absolute inset-0 w-full h-full"
            // Menggunakan inline-style agar transisi 100% jalan tanpa bergantung pada kompilator Tailwind
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 10 : 0,
              transition: "opacity 2s ease-in-out",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover"
              style={{
                transform: isActive ? "scale(1.15)" : "scale(1)",
                transition: "transform 20s ease-out",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}