import { searchMetrics } from "@/lib/catalog";
import type {
  MetricSearchRequest,
  MetricSearchResponse,
} from "@/lib/contracts/metric-search";

export function runMetricSearch(
  request: MetricSearchRequest,
): MetricSearchResponse {
  const metrics = searchMetrics(request.q).slice(0, request.limit);

  return {
    metrics,
    total: metrics.length,
  };
}
