import { describe, expect, it } from "vitest";

import {
  getMetricById,
  listMetrics,
  searchMetrics,
} from "@/lib/catalog";

describe("metric catalog", () => {
  it("lists starter metrics", () => {
    expect(listMetrics().length).toBeGreaterThanOrEqual(3);
  });

  it("finds a metric by id", () => {
    expect(getMetricById("unemployment-rate")?.displayName).toBe(
      "Unemployment Rate",
    );
  });

  it("searches aliases and descriptions", () => {
    const results = searchMetrics("inflation");

    expect(results.map((metric) => metric.id)).toContain("cpi");
  });
});
