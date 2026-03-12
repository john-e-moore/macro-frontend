import { z } from "zod";

import { queryRequestSchema } from "@/lib/contracts/query";

export const exportFormatSchema = z.enum(["csv", "xlsx"]);

export const exportRequestSchema = queryRequestSchema.extend({
  format: exportFormatSchema,
});

export const exportResponseSchema = z.object({
  fileName: z.string(),
  format: exportFormatSchema,
  contentType: z.string(),
  rowCount: z.number().int().min(0),
});

export type ExportRequest = z.infer<typeof exportRequestSchema>;
export type ExportResponse = z.infer<typeof exportResponseSchema>;
