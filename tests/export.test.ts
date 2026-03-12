import { describe, expect, it, vi } from "vitest";

import { buildExportFile, buildExportManifest } from "@/lib/services/export";

vi.mock("@/lib/services/query", () => ({
  runQuery: vi.fn(async () => ({
    requestEcho: {
      metricIds: ["pce-total"],
      geography: {
        level: "state",
        values: ["CA", "NY"],
      },
      timeRange: {
        startYear: 2023,
        endYear: 2024,
      },
      view: "map",
      options: {
        category: "food",
        aggregation: "selected_plus_us",
        includeUsAggregate: true,
        includeSelectedAggregate: true,
        excludedGeographies: [],
      },
    },
    columns: [
      { key: "stateAbbrev", label: "State", type: "string" },
      { key: "year", label: "Year", type: "number" },
      { key: "value", label: "PCE Total", type: "number" },
    ],
    rows: [
      { stateAbbrev: "CA", year: 2024, value: 1_000_000 },
      { stateAbbrev: "NY", year: 2024, value: 900_000 },
    ],
    series: [],
    aggregates: [],
    display: {
      title: "PCE Total map",
      subtitle: "Test export",
      recommendedChart: "map",
      supportedCharts: ["table", "map"],
      unitLabel: "Dollars",
      metricFamily: "pce-levels",
      notes: [],
    },
    warnings: [],
    emptyStateReason: null,
  })),
}));

const request = {
  metricIds: ["pce-total"],
  geography: {
    level: "state" as const,
    values: ["CA", "NY"],
  },
  timeRange: {
    startYear: 2024,
    endYear: 2024,
  },
  view: "map" as const,
  options: {
    category: "food" as const,
    aggregation: "selected_plus_us" as const,
    includeUsAggregate: true,
    includeSelectedAggregate: true,
    excludedGeographies: [],
  },
  format: "csv" as const,
};

describe("export service", () => {
  it("builds an export manifest", async () => {
    const manifest = await buildExportManifest(request);

    expect(manifest.fileName.endsWith(".csv")).toBe(true);
    expect(manifest.rowCount).toBeGreaterThan(0);
  });

  it("builds csv output", async () => {
    const { body } = await buildExportFile(request);

    expect(typeof body).toBe("string");
    expect(body).toContain("stateAbbrev,year,value");
  });
});
