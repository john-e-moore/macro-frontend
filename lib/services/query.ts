import { getMetricById, getMetricsByIds } from "@/lib/catalog";
import type { QueryRequest, QueryResponse } from "@/lib/contracts/query";
import { getChartRecommendation } from "@/lib/services/chart-recommendation";
import { buildFederalComparisonResponse, isFederalMetricSet } from "@/lib/services/federal-metrics";
import {
  buildPceGrowthResponse,
  buildPceInflationResponse,
  buildPceLevelResponse,
  isPceMetric,
} from "@/lib/services/pce-metrics";
import { RequestValidationError } from "@/lib/validation/request";

export async function runQuery(request: QueryRequest): Promise<QueryResponse> {
  const metrics = getMetricsByIds(request.metricIds);

  if (metrics.length !== request.metricIds.length) {
    throw new RequestValidationError("One or more metrics are invalid.", {
      metricIds: request.metricIds,
    });
  }

  if (request.metricIds.length === 1 && isPceMetric(request.metricIds[0])) {
    const metric = getMetricById(request.metricIds[0]);

    if (!metric) {
      throw new RequestValidationError("Unknown metric.", {
        metricIds: request.metricIds,
      });
    }

    if (metric.id === "pce-total" || metric.id === "pce-per-capita") {
      return buildPceLevelResponse(metric, request);
    }

    if (metric.id === "pce-growth-yoy") {
      return buildPceGrowthResponse(metric, request);
    }

    if (metric.id === "pce-inflation-yoy") {
      return buildPceInflationResponse(metric, request);
    }
  }

  if (isFederalMetricSet(request.metricIds)) {
    return buildFederalComparisonResponse(request);
  }

  const recommendation = getChartRecommendation(request);
  throw new RequestValidationError(
    "The selected metric combination does not have a live Phase 1 query implementation yet.",
    {
      metricIds: request.metricIds,
      recommendedView: recommendation.recommendedView,
    },
  );
}
