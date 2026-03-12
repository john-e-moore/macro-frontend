import { queryRequestSchema, queryResponseSchema } from "@/lib/contracts/query";
import { runQuery } from "@/lib/services/query";
import {
  parseJsonRequest,
  validationErrorResponse,
} from "@/lib/validation/request";

export async function POST(request: Request): Promise<Response> {
  try {
    const parsedRequest = await parseJsonRequest(queryRequestSchema, request);
    const response = runQuery(parsedRequest);

    return Response.json(queryResponseSchema.parse(response));
  } catch (error) {
    return validationErrorResponse(error);
  }
}
