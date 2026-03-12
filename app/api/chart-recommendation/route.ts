import {
  chartRecommendationRequestSchema,
  chartRecommendationResponseSchema,
} from "@/lib/contracts/chart-recommendation";
import { getChartRecommendation } from "@/lib/services/chart-recommendation";
import {
  parseJsonRequest,
  validationErrorResponse,
} from "@/lib/validation/request";

export async function POST(request: Request): Promise<Response> {
  try {
    const parsedRequest = await parseJsonRequest(
      chartRecommendationRequestSchema,
      request,
    );
    const response = getChartRecommendation(parsedRequest);

    return Response.json(chartRecommendationResponseSchema.parse(response));
  } catch (error) {
    return validationErrorResponse(error);
  }
}
