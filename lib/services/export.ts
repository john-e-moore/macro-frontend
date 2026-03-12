import { utils, write } from "xlsx";

import type {
  ExportRequest,
  ExportResponse,
} from "@/lib/contracts/export";
import { runQuery } from "@/lib/services/query";

async function buildExportRows(request: ExportRequest) {
  const queryResponse = await runQuery(request);

  return {
    rows: queryResponse.rows,
    queryResponse,
  };
}

export async function buildExportManifest(
  request: ExportRequest,
): Promise<ExportResponse> {
  const fileStem = `${request.metricIds.join("-")}-${request.geography.level}-${request.timeRange.startYear}-${request.timeRange.endYear}`;
  const { rows } = await buildExportRows(request);

  return {
    fileName: `${fileStem}.${request.format}`,
    format: request.format,
    contentType:
      request.format === "csv"
        ? "text/csv; charset=utf-8"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    rowCount: rows.length,
  };
}

export async function buildExportFile(
  request: ExportRequest,
): Promise<{ manifest: ExportResponse; body: Uint8Array | string }> {
  const manifest = await buildExportManifest(request);
  const { rows } = await buildExportRows(request);

  if (request.format === "csv") {
    const worksheet = utils.json_to_sheet(rows);
    return {
      manifest,
      body: utils.sheet_to_csv(worksheet),
    };
  }

  const workbook = utils.book_new();
  const worksheet = utils.json_to_sheet(rows);
  utils.book_append_sheet(workbook, worksheet, "Results");

  return {
    manifest,
    body: write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    }),
  };
}
