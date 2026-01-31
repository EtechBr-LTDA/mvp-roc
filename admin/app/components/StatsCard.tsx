import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  subtitle?: string;
  progress?: {
    value: number;
    max: number;
  };
}

export function StatsCard({
  label,
  value,
  icon,
  color,
  subtitle,
  progress,
}: StatsCardProps) {
  const progressPercent = progress
    ? Math.round((progress.value / Math.max(progress.max, 1)) * 100)
    : null;

  return (
    <div
      className="bg-white rounded-xl shadow-soft p-5 border-l-4 flex flex-col gap-3"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--color-text-medium)] truncate">
            {label}
          </p>
          <p className="text-2xl font-bold text-[var(--color-text-dark)] mt-1 leading-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-light)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>

      {progress && progressPercent !== null && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[var(--color-text-medium)]">
              {progress.value} de {progress.max}
            </span>
            <span className="font-semibold" style={{ color }}>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: color }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
