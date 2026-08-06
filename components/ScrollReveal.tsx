"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  baseClass?: string;
  visibleClass?: string;
  delay?: string;
}

export default function ScrollReveal({
  children,
  className = "",
  baseClass = "opacity-0 translate-y-8 scale-[0.98]",
  visibleClass = "opacity-100 translate-y-0 scale-100",
  delay = "delay-0",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${delay} ${
        isVisible ? visibleClass : baseClass
      } ${className}`}
    >
      {children}
    </div>
  );
}