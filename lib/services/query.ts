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

function buildUnsupportedQueryResponse(request: QueryRequest): QueryResponse {
  const recommendation = getChartRecommendation(request);

  return {
    requestEcho: request,
    columns: [],
    rows: [],
    series: [],
    aggregates: [],
    display: {
      title: "Unsupported query",
      subtitle:
        "This metric combination is not yet wired to a live explorer query in the current product scope.",
      recommendedChart: recommendation.recommendedView,
      recommendedChartReason: recommendation.reason,
      supportedCharts: recommendation.supportedViews,
      unitLabel: "N/A",
      metricFamily: "unsupported",
      notes: [],
    },
    warnings: [],
    emptyStateReason:
      "The selected metric combination does not have a live query implementation yet.",
    emptyState: {
      kind: "unsupported",
      title: "This combination is not available yet",
      description:
        "Try one metric at a time in the explorer or switch back to a supported preset to keep moving.",
      suggestedActions: [
        {
          id: "reset-view",
          label: "Use auto view",
          description: "Let the explorer pick a supported chart for the current state.",
          patch: { view: "auto" },
        },
      ],
    },
  };
}

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

  return buildUnsupportedQueryResponse(request);
}
