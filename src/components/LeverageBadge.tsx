import type { LeverageResult } from "@/types";

interface Props {
  leverage: LeverageResult;
  showScore?: boolean;
}

const CONFIG = {
  hot: {
    label: "Hot",
    icon: "🔥",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  warm: {
    label: "Warm",
    icon: "✨",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  cold: {
    label: "Cold",
    icon: "❄️",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
};

export default function LeverageBadge({ leverage, showScore = false }: Props) {
  const cfg = CONFIG[leverage.level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
      {showScore && (
        <span className="opacity-70">· {leverage.score}</span>
      )}
    </span>
  );
}
