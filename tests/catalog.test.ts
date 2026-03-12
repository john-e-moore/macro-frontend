import { describe, expect, it } from "vitest";

import {
  getMetricById,
  listMetrics,
  searchMetrics,
} from "@/lib/catalog";

describe("metric catalog", () => {
  it("lists phase one metrics", () => {
    expect(listMetrics().length).toBeGreaterThanOrEqual(7);
  });

  it("finds a metric by id", () => {
    expect(getMetricById("pce-per-capita")?.displayName).toBe("PCE Per Capita");
  });

  it("searches aliases and descriptions", () => {
    const results = searchMetrics("inflation");

    expect(results.map((metric) => metric.id)).toContain("pce-inflation-yoy");
  });
});
