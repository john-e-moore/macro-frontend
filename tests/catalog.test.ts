import { describe, expect, it } from "vitest";

import {
  getMetricById,
  listMetricCategories,
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

  it("exposes the RPP national price-level metric", () => {
    expect(getMetricById("rpp-national-price-level")?.family).toBe("rpp-price-levels");
  });

  it("searches aliases and descriptions", () => {
    const results = searchMetrics("inflation");

    expect(results.map((metric) => metric.id)).toContain("pce-inflation-yoy");
  });

  it("lists unique metric categories", () => {
    expect(listMetricCategories()).toContain("Spending");
    expect(listMetricCategories()).toContain("Federal flows");
  });
});
