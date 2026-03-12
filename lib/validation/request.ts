import { type ZodSchema } from "zod";

export class RequestValidationError extends Error {
  details: unknown;
  status: number;

  constructor(message: string, details: unknown, status = 400) {
    super(message);
    this.name = "RequestValidationError";
    this.details = details;
    this.status = status;
  }
}

export function parseSearchParams<T>(
  schema: ZodSchema<T>,
  params: URLSearchParams,
): T {
  const candidate = Object.fromEntries(params.entries());
  const result = schema.safeParse(candidate);

  if (!result.success) {
    throw new RequestValidationError(
      "Invalid query string parameters.",
      result.error.flatten(),
    );
  }

  return result.data;
}

export async function parseJsonRequest<T>(
  schema: ZodSchema<T>,
  request: Request,
): Promise<T> {
  const payload = await request.json();
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new RequestValidationError(
      "Invalid request body.",
      result.error.flatten(),
    );
  }

  return result.data;
}

export function validationErrorResponse(error: unknown): Response {
  if (error instanceof RequestValidationError) {
    return Response.json(
      {
        error: error.message,
        details: error.details,
      },
      { status: error.status },
    );
  }

  console.error(error);

  return Response.json(
    {
      error: "Unexpected server error.",
    },
    { status: 500 },
  );
}
