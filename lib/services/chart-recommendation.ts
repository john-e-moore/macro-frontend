import { getMetricsByIds } from "@/lib/catalog";
import type {
  ChartRecommendationRequest,
  ChartRecommendationResponse,
} from "@/lib/contracts/chart-recommendation";
import { getChartSupport } from "@/lib/chart-support";
import { RequestValidationError } from "@/lib/validation/request";

export function getChartRecommendation(
  request: ChartRecommendationRequest,
): ChartRecommendationResponse {
  const metrics = getMetricsByIds(request.metricIds);

  if (metrics.length !== request.metricIds.length) {
    throw new RequestValidationError("One or more metrics are invalid.", {
      metricIds: request.metricIds,
    });
  }

  const recommendation = getChartSupport({
    metricEntries: metrics,
    selectedGeographyCount: request.geography.values.length,
    geographyLevel: request.geography.level,
    startYear: request.timeRange.startYear,
    endYear: request.timeRange.endYear,
    requestedView: request.view,
  });

  return {
    recommendedView: recommendation.recommendedView,
    supportedViews: recommendation.supportedViews,
    reason: recommendation.reason,
    details: {
      selectedGeographyCount: request.geography.values.length,
      yearCount: request.timeRange.endYear - request.timeRange.startYear + 1,
    },
  };
}
