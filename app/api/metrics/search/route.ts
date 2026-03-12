import {
  metricSearchRequestSchema,
  metricSearchResponseSchema,
} from "@/lib/contracts/metric-search";
import { runMetricSearch } from "@/lib/services/metric-search";
import {
  parseSearchParams,
  validationErrorResponse,
} from "@/lib/validation/request";

export function GET(request: Request): Response {
  try {
    const { searchParams } = new URL(request.url);
    const parsedRequest = parseSearchParams(
      metricSearchRequestSchema,
      searchParams,
    );
    const response = runMetricSearch(parsedRequest);

    return Response.json(metricSearchResponseSchema.parse(response));
  } catch (error) {
    return validationErrorResponse(error);
  }
}
