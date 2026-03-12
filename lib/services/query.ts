import { getMetricsByIds } from "@/lib/catalog";
import type { QueryRequest, QueryResponse } from "@/lib/contracts/query";
import { getChartRecommendation } from "@/lib/services/chart-recommendation";
import { RequestValidationError } from "@/lib/validation/request";

function toGeographyValues(request: QueryRequest): string[] {
  if (request.geography.values.length > 0) {
    return request.geography.values;
  }

  return request.geography.level === "state"
    ? ["CA", "TX", "NY"]
    : ["United States"];
}

export function runQuery(request: QueryRequest): QueryResponse {
  const metrics = getMetricsByIds(request.metricIds);

  if (metrics.length !== request.metricIds.length) {
    throw new RequestValidationError("One or more metrics are invalid.", {
      metricIds: request.metricIds,
    });
  }

  const geographyValues = toGeographyValues(request);
  const limitedYears = Array.from(
    { length: Math.min(request.timeRange.endYear - request.timeRange.startYear + 1, 3) },
    (_, index) => request.timeRange.startYear + index,
  );
  const rows = geographyValues.flatMap((geographyValue, geographyIndex) =>
    limitedYears.map((year, yearIndex) => {
      const row: Record<string, string | number | null> = {
        geography: geographyValue,
        year,
      };

      for (const [metricIndex, metric] of metrics.entries()) {
        row[metric.id] = Number(
          (100 + geographyIndex * 7 + yearIndex * 3 + metricIndex * 11).toFixed(
            2,
          ),
        );
      }

      return row;
    }),
  );

  const recommendation = getChartRecommendation(request);

  return {
    requestEcho: request,
    columns: [
      { key: "geography", label: "Geography", type: "string" },
      { key: "year", label: "Year", type: "number" },
      ...metrics.map((metric) => ({
        key: metric.id,
        label: metric.displayName,
        type: "number" as const,
      })),
    ],
    rows,
    display: {
      title: metrics.map((metric) => metric.displayName).join(", "),
      subtitle: `Sample Phase 0 response for ${request.geography.level} coverage from ${request.timeRange.startYear} to ${request.timeRange.endYear}.`,
      recommendedChart: recommendation.recommendedView,
      supportedCharts: recommendation.supportedViews,
    },
    warnings: [
      "Phase 0 responses are contract-first samples until live serving-layer queries are connected.",
    ],
    emptyStateReason: rows.length === 0 ? "No rows matched the requested filters." : null,
  };
}
