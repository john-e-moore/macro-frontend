import { getMetricsByIds } from "@/lib/catalog";
import type {
  ChartRecommendationRequest,
  ChartRecommendationResponse,
} from "@/lib/contracts/chart-recommendation";
import type { ChartType } from "@/lib/catalog/types";
import { RequestValidationError } from "@/lib/validation/request";

function recommendChart(request: ChartRecommendationRequest): ChartType {
  const yearSpan = request.timeRange.endYear - request.timeRange.startYear;
  const metricIds = new Set(request.metricIds);

  if (request.view !== "auto") {
    return request.view;
  }

  if (metricIds.has("pce-total") || metricIds.has("pce-per-capita")) {
    return "map";
  }

  if (metricIds.has("pce-inflation-yoy") || metricIds.has("pce-growth-yoy")) {
    return "multi_line";
  }

  if (
    metricIds.has("federal-direct-transfers") ||
    metricIds.has("federal-program-funding") ||
    metricIds.has("federal-total-inflows") ||
    metricIds.has("state-gdp")
  ) {
    return "bar";
  }

  if (request.geography.level === "state" && yearSpan > 0) {
    return "multi_line";
  }

  return "table";
}

export function getChartRecommendation(
  request: ChartRecommendationRequest,
): ChartRecommendationResponse {
  const metrics = getMetricsByIds(request.metricIds);

  if (metrics.length !== request.metricIds.length) {
    throw new RequestValidationError("One or more metrics are invalid.", {
      metricIds: request.metricIds,
    });
  }

  const supportedViews = Array.from(
    new Set(metrics.flatMap((metric) => metric.allowedChartTypes)),
  );
  const recommendedView = recommendChart(request);

  return {
    recommendedView: supportedViews.includes(recommendedView)
      ? recommendedView
      : supportedViews[0] ?? "table",
    supportedViews,
    reason:
      "Phase 1 recommends charts from the selected metric family, geography coverage, and time span.",
  };
}
