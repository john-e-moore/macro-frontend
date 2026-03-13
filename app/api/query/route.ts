import { queryRequestSchema, queryResponseSchema } from "@/lib/contracts/query";
import { buildRouteCacheHeaders, getCachedRouteValue } from "@/lib/route-cache";
import { runQuery } from "@/lib/services/query";
import {
  parseJsonRequest,
  validationErrorResponse,
} from "@/lib/validation/request";

export async function POST(request: Request): Promise<Response> {
  try {
    const parsedRequest = await parseJsonRequest(queryRequestSchema, request);
    const ttlSeconds = 60;
    const { value, cacheStatus } = await getCachedRouteValue({
      scope: "query",
      key: JSON.stringify(parsedRequest),
      ttlSeconds,
      loader: () => runQuery(parsedRequest),
    });

    return Response.json(queryResponseSchema.parse(value), {
      headers: buildRouteCacheHeaders({ ttlSeconds, cacheStatus }),
    });
  } catch (error) {
    return validationErrorResponse(error);
  }
}
