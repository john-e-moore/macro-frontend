import { describe, expect, it } from "vitest";

import { getMetricById } from "@/lib/catalog";
import { getChartSupport } from "@/lib/chart-support";

describe("chart support", () => {
  it("recommends a map for one-year state comparisons", () => {
    const metric = getMetricById("pce-total");

    expect(metric).not.toBeNull();
    expect(
      getChartSupport({
        metricEntries: metric ? [metric] : [],
        selectedGeographyCount: 5,
        geographyLevel: "state",
        startYear: 2024,
        endYear: 2024,
        requestedView: "auto",
      }).recommendedView,
    ).toBe("map");
  });

  it("recommends a line for a single geography trend", () => {
    const metric = getMetricById("pce-growth-yoy");

    expect(metric).not.toBeNull();
    expect(
      getChartSupport({
        metricEntries: metric ? [metric] : [],
        selectedGeographyCount: 1,
        geographyLevel: "state",
        startYear: 2021,
        endYear: 2024,
        requestedView: "auto",
      }).recommendedView,
    ).toBe("line");
  });

  it("recommends multi-line for multi-state trends", () => {
    const metric = getMetricById("pce-growth-yoy");

    expect(metric).not.toBeNull();
    expect(
      getChartSupport({
        metricEntries: metric ? [metric] : [],
        selectedGeographyCount: 3,
        geographyLevel: "state",
        startYear: 2021,
        endYear: 2024,
        requestedView: "auto",
      }).recommendedView,
    ).toBe("multi_line");
  });

  it("preserves an explicitly requested supported view", () => {
    const metric = getMetricById("federal-total-inflows");

    expect(metric).not.toBeNull();
    expect(
      getChartSupport({
        metricEntries: metric ? [metric] : [],
        selectedGeographyCount: 1,
        geographyLevel: "state",
        startYear: 2023,
        endYear: 2023,
        requestedView: "table",
      }).recommendedView,
    ).toBe("table");
  });
});
