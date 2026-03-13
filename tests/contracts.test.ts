import { describe, expect, it } from "vitest";

import { chartRecommendationRequestSchema } from "@/lib/contracts/chart-recommendation";
import { exportRequestSchema } from "@/lib/contracts/export";
import { metricSearchRequestSchema } from "@/lib/contracts/metric-search";
import { queryRequestSchema, queryResponseSchema } from "@/lib/contracts/query";

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
        metricIds: ["pce-total"],
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
        metricIds: ["pce-growth-yoy"],
        geography: {
          level: "state",
          values: ["CA"],
        },
        timeRange: {
          startYear: 2022,
          endYear: 2024,
        },
        view: "auto",
        options: {
          category: "food",
          excludedGeographies: ["CA"],
        },
      }).geography.level,
    ).toBe("state");
  });

  it("accepts export requests for csv and xlsx", () => {
    expect(
      exportRequestSchema.parse({
        metricIds: ["federal-total-inflows", "state-gdp"],
        geography: {
          level: "state",
          values: ["CA"],
        },
        timeRange: {
          startYear: 2023,
          endYear: 2023,
        },
        view: "bar",
        format: "xlsx",
      }).format,
    ).toBe("xlsx");
  });

  it("accepts structured query empty states", () => {
    expect(
      queryResponseSchema.parse({
        requestEcho: queryRequestSchema.parse({
          metricIds: ["pce-total"],
          geography: {
            level: "state",
            values: ["CA"],
          },
          timeRange: {
            startYear: 2024,
            endYear: 2024,
          },
          view: "auto",
        }),
        columns: [],
        rows: [],
        series: [],
        aggregates: [],
        display: {
          title: "Unsupported query",
          subtitle: "No live query exists.",
          recommendedChart: "table",
          recommendedChartReason: "A table is the safest fallback.",
          supportedCharts: ["table"],
          unitLabel: "N/A",
          metricFamily: "unsupported",
          notes: [],
        },
        warnings: [],
        emptyStateReason: "No rows matched.",
        emptyState: {
          kind: "unsupported",
          title: "This combination is not available yet",
          description: "Try a supported view instead.",
          suggestedActions: [
            {
              id: "auto-view",
              label: "Use auto view",
              patch: {
                view: "auto",
              },
            },
          ],
        },
      }).emptyState?.kind,
    ).toBe("unsupported");
  });
});
