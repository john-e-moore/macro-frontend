import {
  metricMetadataRequestSchema,
  metricMetadataResponseSchema,
} from "@/lib/contracts/metric-metadata";
import { buildRouteCacheHeaders, getCachedRouteValue } from "@/lib/route-cache";
import { getMetricMetadata } from "@/lib/services/metric-metadata";
import { validationErrorResponse } from "@/lib/validation/request";

interface RouteContext {
  params: Promise<{
    metricId: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  try {
    const { metricId } = await context.params;
    const parsedRequest = metricMetadataRequestSchema.parse({ metricId });
    const ttlSeconds = 600;
    const { value, cacheStatus } = await getCachedRouteValue({
      scope: "metric-metadata",
      key: parsedRequest.metricId,
      ttlSeconds,
      loader: () => getMetricMetadata(parsedRequest),
    });

    return Response.json(metricMetadataResponseSchema.parse(value), {
      headers: buildRouteCacheHeaders({ ttlSeconds, cacheStatus }),
    });
  } catch (error) {
    return validationErrorResponse(error);
  }
}
