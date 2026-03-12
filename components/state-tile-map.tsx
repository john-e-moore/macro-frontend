"use client";

const stateGrid = [
  { code: "AK", row: 0, col: 0 }, { code: "HI", row: 0, col: 1 },
  { code: "WA", row: 1, col: 0 }, { code: "ID", row: 1, col: 1 }, { code: "MT", row: 1, col: 2 }, { code: "ND", row: 1, col: 3 }, { code: "MN", row: 1, col: 4 }, { code: "WI", row: 1, col: 5 }, { code: "MI", row: 1, col: 6 }, { code: "VT", row: 1, col: 8 }, { code: "NH", row: 1, col: 9 }, { code: "ME", row: 1, col: 10 },
  { code: "OR", row: 2, col: 0 }, { code: "NV", row: 2, col: 1 }, { code: "WY", row: 2, col: 2 }, { code: "SD", row: 2, col: 3 }, { code: "IA", row: 2, col: 4 }, { code: "IL", row: 2, col: 5 }, { code: "IN", row: 2, col: 6 }, { code: "OH", row: 2, col: 7 }, { code: "PA", row: 2, col: 8 }, { code: "NY", row: 2, col: 9 }, { code: "MA", row: 2, col: 10 },
  { code: "CA", row: 3, col: 0 }, { code: "UT", row: 3, col: 1 }, { code: "CO", row: 3, col: 2 }, { code: "NE", row: 3, col: 3 }, { code: "MO", row: 3, col: 4 }, { code: "KY", row: 3, col: 5 }, { code: "WV", row: 3, col: 6 }, { code: "VA", row: 3, col: 7 }, { code: "MD", row: 3, col: 8 }, { code: "NJ", row: 3, col: 9 }, { code: "CT", row: 3, col: 10 }, { code: "RI", row: 3, col: 11 },
  { code: "AZ", row: 4, col: 0 }, { code: "NM", row: 4, col: 1 }, { code: "KS", row: 4, col: 2 }, { code: "AR", row: 4, col: 3 }, { code: "TN", row: 4, col: 4 }, { code: "NC", row: 4, col: 5 }, { code: "SC", row: 4, col: 6 }, { code: "DE", row: 4, col: 7 }, { code: "DC", row: 4, col: 8 },
  { code: "TX", row: 5, col: 1 }, { code: "OK", row: 5, col: 2 }, { code: "LA", row: 5, col: 3 }, { code: "MS", row: 5, col: 4 }, { code: "AL", row: 5, col: 5 }, { code: "GA", row: 5, col: 6 }, { code: "FL", row: 5, col: 7 },
];

type StateTileRow = {
  stateAbbrev: string;
  stateName: string;
  value: number | null;
};

function colorForValue(value: number | null, minValue: number, maxValue: number) {
  if (value === null) {
    return "rgb(226 232 240)";
  }

  if (maxValue === minValue) {
    return "rgb(8 145 178)";
  }

  const ratio = (value - minValue) / (maxValue - minValue);
  const lightness = 88 - ratio * 50;
  return `hsl(190 85% ${lightness}%)`;
}

export function StateTileMap({
  rows,
  selectedStates,
  onToggleState,
}: {
  rows: StateTileRow[];
  selectedStates: string[];
  onToggleState: (stateAbbrev: string) => void;
}) {
  const rowByState = new Map(rows.map((row) => [row.stateAbbrev, row]));
  const values = rows
    .map((row) => row.value)
    .filter((value): value is number => value !== null);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 1;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}
      >
        {stateGrid.map((state) => {
          const row = rowByState.get(state.code);
          const isSelected = selectedStates.includes(state.code);

          return (
            <button
              key={state.code}
              type="button"
              className={`flex h-12 items-center justify-center rounded-xl border text-xs font-semibold transition ${
                isSelected ? "border-slate-950 text-slate-950 shadow-sm" : "border-transparent text-slate-700"
              }`}
              style={{
                gridColumn: state.col + 1,
                gridRow: state.row + 1,
                backgroundColor: colorForValue(row?.value ?? null, minValue, maxValue),
              }}
              onClick={() => onToggleState(state.code)}
              title={
                row
                  ? `${row.stateName}: ${row.value === null ? "N/A" : row.value.toLocaleString()}`
                  : state.code
              }
            >
              {state.code}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Click states to include or exclude them from the selected-state aggregate.
      </p>
    </div>
  );
}
