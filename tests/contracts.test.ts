import { describe, expect, it } from "vitest";

import { chartRecommendationRequestSchema } from "@/lib/contracts/chart-recommendation";
import { exportRequestSchema } from "@/lib/contracts/export";
import { metricSearchRequestSchema } from "@/lib/contracts/metric-search";
import { queryRequestSchema } from "@/lib/contracts/query";

describe("contracts", () => {
  it("coerces search request values", () => {
    expect(
      metricSearchRequestSchema.parse({
        q: "jobs",
        limit: "5",
      }),
    ).toEqual({
      q: "jobs",
      limit: 5,
    });
  });

  it("rejects invalid time ranges", () => {
    expect(() =>
      queryRequestSchema.parse({
        metricIds: ["unemployment-rate"],
        geography: {
          level: "state",
          values: [],
        },
        timeRange: {
          startYear: 2024,
          endYear: 2020,
        },
        view: "auto",
      }),
    ).toThrow();
  });

  it("accepts chart recommendation requests", () => {
    expect(
      chartRecommendationRequestSchema.parse({
        metricIds: ["unemployment-rate"],
        geography: {
          level: "state",
          values: ["CA"],
        },
        timeRange: {
          startYear: 2022,
          endYear: 2024,
        },
        view: "auto",
      }).geography.level,
    ).toBe("state");
  });

  it("accepts export requests for csv and xlsx", () => {
    expect(
      exportRequestSchema.parse({
        metricIds: ["unemployment-rate"],
        geography: {
          level: "nation",
          values: [],
        },
        timeRange: {
          startYear: 2024,
          endYear: 2024,
        },
        view: "table",
        format: "xlsx",
      }).format,
    ).toBe("xlsx");
  });
});
