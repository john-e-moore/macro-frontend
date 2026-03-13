import {
  chartRecommendationRequestSchema,
  chartRecommendationResponseSchema,
} from "@/lib/contracts/chart-recommendation";
import { getChartRecommendation } from "@/lib/services/chart-recommendation";
import {
  parseJsonRequest,
  validationErrorResponse,
} from "@/lib/validation/request";
import { buildRouteCacheHeaders, getCachedRouteValue } from "@/lib/route-cache";

export async function POST(request: Request): Promise<Response> {
  try {
    const parsedRequest = await parseJsonRequest(
      chartRecommendationRequestSchema,
      request,
    );
    const ttlSeconds = 300;
    const { value, cacheStatus } = await getCachedRouteValue({
      scope: "chart-recommendation",
      key: JSON.stringify(parsedRequest),
      ttlSeconds,
      loader: () => getChartRecommendation(parsedRequest),
    });

    return Response.json(chartRecommendationResponseSchema.parse(value), {
      headers: buildRouteCacheHeaders({ ttlSeconds, cacheStatus }),
    });
  } catch (error) {
    return validationErrorResponse(error);
  }
}
