import { z } from "zod";

import { chartTypeSchema } from "@/lib/contracts/common";
import { queryRequestSchema } from "@/lib/contracts/query";

export const chartRecommendationRequestSchema = queryRequestSchema.pick({
  metricIds: true,
  geography: true,
  timeRange: true,
  view: true,
  options: true,
});

export const chartRecommendationResponseSchema = z.object({
  recommendedView: chartTypeSchema,
  supportedViews: z.array(chartTypeSchema),
  reason: z.string(),
  details: z.object({
    selectedGeographyCount: z.number().int().nonnegative(),
    yearCount: z.number().int().positive(),
  }),
});

export type ChartRecommendationRequest = z.infer<
  typeof chartRecommendationRequestSchema
>;
export type ChartRecommendationResponse = z.infer<
  typeof chartRecommendationResponseSchema
>;
