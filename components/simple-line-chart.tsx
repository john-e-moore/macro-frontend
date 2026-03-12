"use client";

type LineSeries = {
  key: string;
  label: string;
  points: Array<{ x: number | string; y: number | null }>;
};

const palette = [
  "#06b6d4",
  "#8b5cf6",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#eab308",
];

export function SimpleLineChart({
  series,
  height = 260,
}: {
  series: LineSeries[];
  height?: number;
}) {
  const numericPoints = series.flatMap((item) =>
    item.points
      .filter((point): point is { x: number | string; y: number } => point.y !== null)
      .map((point) => ({
        x: Number(point.x),
        y: point.y,
      })),
  );

  if (numericPoints.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        No line data available for the current filters.
      </div>
    );
  }

  const width = 720;
  const padding = 40;
  const minX = Math.min(...numericPoints.map((point) => point.x));
  const maxX = Math.max(...numericPoints.map((point) => point.x));
  const minY = Math.min(...numericPoints.map((point) => point.y));
  const maxY = Math.max(...numericPoints.map((point) => point.y));
  const xSpan = Math.max(maxX - minX, 1);
  const ySpan = Math.max(maxY - minY, 1);

  const toX = (value: number) =>
    padding + ((value - minX) / xSpan) * (width - padding * 2);
  const toY = (value: number) =>
    height - padding - ((value - minY) / ySpan) * (height - padding * 2);

  const yTicks = Array.from({ length: 4 }, (_, index) => minY + (ySpan / 3) * index);
  const xTicks = Array.from(new Set(numericPoints.map((point) => point.x))).sort(
    (left, right) => left - right,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <svg className="h-auto w-full" viewBox={`0 0 ${width} ${height}`} role="img">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding}
              x2={width - padding}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text
              x={8}
              y={toY(tick) + 4}
              fill="#64748b"
              fontSize="12"
            >
              {tick.toFixed(1)}%
            </text>
          </g>
        ))}

        {xTicks.map((tick) => (
          <text
            key={tick}
            x={toX(tick)}
            y={height - 10}
            textAnchor="middle"
            fill="#64748b"
            fontSize="12"
          >
            {tick}
          </text>
        ))}

        {series.map((item, index) => {
          const points = item.points.filter(
            (point): point is { x: number | string; y: number } => point.y !== null,
          );
          const path = points
            .map((point, pointIndex) => {
              const command = pointIndex === 0 ? "M" : "L";
              return `${command} ${toX(Number(point.x))} ${toY(point.y)}`;
            })
            .join(" ");

          return (
            <g key={item.key}>
              <path
                d={path}
                fill="none"
                stroke={palette[index % palette.length]}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((point) => (
                <circle
                  key={`${item.key}-${point.x}`}
                  cx={toX(Number(point.x))}
                  cy={toY(point.y)}
                  r="4"
                  fill={palette[index % palette.length]}
                />
              ))}
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
        {series.map((item, index) => (
          <div key={item.key} className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: palette[index % palette.length] }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
