"use client";

import { Newspaper, BookOpenText } from "lucide-react";

type TabType = "article" | "rulebook";

interface Props {
  activeTab: TabType;
  setActiveTab: (value: TabType) => void;
}

export default function InsightTabs({ activeTab, setActiveTab }: Props) {
  return (
    <div className="inline-flex bg-white/95 backdrop-blur-md border border-stone-200/50 rounded-full p-1.5 shadow-sm">
      <button
        onClick={() => setActiveTab("article")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${
          activeTab === "article"
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
            : "text-stone-500 hover:text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        <Newspaper className="w-4 h-4" />
        Articles
      </button>

      <button
        onClick={() => setActiveTab("rulebook")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${
          activeTab === "rulebook"
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
            : "text-stone-500 hover:text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        <BookOpenText className="w-4 h-4" />
        Rulebooks
      </button>
    </div>
  );
}