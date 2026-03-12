import {
  metricMetadataRequestSchema,
  metricMetadataResponseSchema,
} from "@/lib/contracts/metric-metadata";
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
    const response = getMetricMetadata(parsedRequest);

    return Response.json(metricMetadataResponseSchema.parse(response));
  } catch (error) {
    return validationErrorResponse(error);
  }
}
