"use client";

interface Props {
  summary: any;
}

export default function TreeSummaryCard({ summary }: Props) {
  const planted =
    summary?.trees_planted ?? summary?.total_trees ?? 0;
  const survived =
    summary?.trees_survived ?? summary?.alive_trees ?? 0;
  const dead = summary?.trees_dead ?? summary?.dead_trees ?? 0;
  const rate = summary?.survival_rate ?? 0;

  const cards = [
    { title: "Trees Planted", value: planted },
    { title: "Survived", value: survived },
    { title: "Dead", value: dead },
    {
      title: "Survival Rate",
      value: `${typeof rate === "number" ? rate.toFixed(1) : rate}%`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {cards.map((item) => (
        <div key={item.title} className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">{item.title}</p>
          <h3 className="mt-2 text-3xl font-bold text-emerald-900">
            {item.value}
          </h3>
        </div>
      ))}
    </div>
  );
}
