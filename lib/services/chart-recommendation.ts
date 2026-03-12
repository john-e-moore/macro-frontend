import { getMetricsByIds } from "@/lib/catalog";
import type {
  ChartRecommendationRequest,
  ChartRecommendationResponse,
} from "@/lib/contracts/chart-recommendation";
import type { ChartType } from "@/lib/catalog/types";
import { RequestValidationError } from "@/lib/validation/request";

function recommendChart(request: ChartRecommendationRequest): ChartType {
  const yearSpan = request.timeRange.endYear - request.timeRange.startYear;

  if (request.view !== "auto") {
    return request.view;
  }

  if (request.geography.level === "state" && yearSpan === 0) {
    return "map";
  }

  if (request.geography.level === "state" && yearSpan > 0) {
    return "multi_line";
  }

  if (request.geography.level === "nation" && yearSpan > 0) {
    return "line";
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
      "Phase 0 uses a lightweight heuristic based on geography coverage, time span, and the selected metric set.",
  };
}
