import { z } from "zod";

import { metricCatalogEntrySchema } from "@/lib/contracts/common";

export const metricMetadataRequestSchema = z.object({
  metricId: z.string().trim().min(1),
});

export const metricMetadataResponseSchema = z.object({
  metric: metricCatalogEntrySchema,
});

export type MetricMetadataRequest = z.infer<typeof metricMetadataRequestSchema>;
export type MetricMetadataResponse = z.infer<typeof metricMetadataResponseSchema>;
