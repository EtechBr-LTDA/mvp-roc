import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  trend?: {
    value: number;
    positive: boolean;
  };
}

export function StatsCard({
  label,
  value,
  icon,
  color,
  trend,
}: StatsCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-soft p-5 flex items-center gap-4 border-l-4"
      style={{ borderLeftColor: color }}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-[var(--color-text-dark)] leading-tight">
          {value}
        </p>
        <p className="text-sm text-[var(--color-text-medium)] mt-0.5 truncate">
          {label}
        </p>
      </div>

      {/* Trend */}
      {trend && (
        <div
          className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trend.positive
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          <span>{trend.positive ? "\u2191" : "\u2193"}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  );
}
