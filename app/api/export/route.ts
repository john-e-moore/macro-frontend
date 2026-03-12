import {
  exportRequestSchema,
  exportResponseSchema,
} from "@/lib/contracts/export";
import { buildExportFile, buildExportManifest } from "@/lib/services/export";
import {
  parseJsonRequest,
  validationErrorResponse,
} from "@/lib/validation/request";

export async function POST(request: Request): Promise<Response> {
  try {
    const parsedRequest = await parseJsonRequest(exportRequestSchema, request);

    if (request.headers.get("x-export-manifest-only") === "true") {
      return Response.json(
        exportResponseSchema.parse(await buildExportManifest(parsedRequest)),
      );
    }

    const { manifest, body } = await buildExportFile(parsedRequest);
    const responseBody =
      typeof body === "string"
        ? body
        : new Blob([new Uint8Array(body)], { type: manifest.contentType });

    return new Response(responseBody, {
      headers: {
        "Content-Type": manifest.contentType,
        "Content-Disposition": `attachment; filename="${manifest.fileName}"`,
        "X-Export-Row-Count": manifest.rowCount.toString(),
      },
    });
  } catch (error) {
    return validationErrorResponse(error);
  }
}
