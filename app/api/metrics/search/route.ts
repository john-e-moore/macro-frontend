import {
  metricSearchRequestSchema,
  metricSearchResponseSchema,
} from "@/lib/contracts/metric-search";
import { runMetricSearch } from "@/lib/services/metric-search";
import {
  parseSearchParams,
  validationErrorResponse,
} from "@/lib/validation/request";
import { buildRouteCacheHeaders, getCachedRouteValue } from "@/lib/route-cache";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const parsedRequest = parseSearchParams(
      metricSearchRequestSchema,
      searchParams,
    );
    const ttlSeconds = 300;
    const { value, cacheStatus } = await getCachedRouteValue({
      scope: "metric-search",
      key: JSON.stringify(parsedRequest),
      ttlSeconds,
      loader: () => runMetricSearch(parsedRequest),
    });

    return Response.json(metricSearchResponseSchema.parse(value), {
      headers: buildRouteCacheHeaders({ ttlSeconds, cacheStatus }),
    });
  } catch (error) {
    return validationErrorResponse(error);
  }
}
