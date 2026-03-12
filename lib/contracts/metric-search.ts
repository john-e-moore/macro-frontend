import { z } from "zod";

import { metricSummarySchema } from "@/lib/contracts/common";

export const metricSearchRequestSchema = z.object({
  q: z.string().trim().max(100).default(""),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const metricSearchResponseSchema = z.object({
  metrics: z.array(metricSummarySchema),
  total: z.number().int().min(0),
});

export type MetricSearchRequest = z.infer<typeof metricSearchRequestSchema>;
export type MetricSearchResponse = z.infer<typeof metricSearchResponseSchema>;
