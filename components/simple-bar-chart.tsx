"use client";

type BarSeries = {
  key: string;
  label: string;
  points: Array<{ x: string | number; y: number | null }>;
};

const palette = ["#06b6d4", "#8b5cf6", "#f97316", "#22c55e"];

export function SimpleBarChart({ series }: { series: BarSeries[] }) {
  const bars = series.map((item) => ({
    key: item.key,
    label: item.label,
    value: item.points[0]?.y ?? null,
  }));
  const numericBars = bars.filter(
    (bar): bar is { key: string; label: string; value: number } => bar.value !== null,
  );

  if (numericBars.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        No bar data available for the current filters.
      </div>
    );
  }

  const maxValue = Math.max(...numericBars.map((bar) => bar.value));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        {bars.map((bar, index) => {
          const width = bar.value !== null && maxValue > 0 ? (bar.value / maxValue) * 100 : 0;

          return (
            <div key={bar.key} className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">{bar.label}</span>
                <span className="font-mono text-slate-500">
                  {bar.value === null ? "N/A" : `$${(bar.value / 1_000_000_000).toFixed(1)}B`}
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${width}%`,
                    backgroundColor: palette[index % palette.length],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
