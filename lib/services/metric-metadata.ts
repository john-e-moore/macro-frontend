import { getMetricById } from "@/lib/catalog";
import type {
  MetricMetadataRequest,
  MetricMetadataResponse,
} from "@/lib/contracts/metric-metadata";
import { RequestValidationError } from "@/lib/validation/request";

export function getMetricMetadata(
  request: MetricMetadataRequest,
): MetricMetadataResponse {
  const metric = getMetricById(request.metricId);

  if (!metric) {
    throw new RequestValidationError("Metric not found.", {
      metricId: request.metricId,
    }, 404);
  }

  return {
    metric,
  };
}
