import { z } from "zod";

import {
  chartTypeSchema,
  geographyLevelSchema,
  queryColumnSchema,
  queryRowSchema,
  timeRangeSchema,
} from "@/lib/contracts/common";

export const queryRequestSchema = z.object({
  metricIds: z.array(z.string().trim().min(1)).min(1).max(5),
  geography: z.object({
    level: geographyLevelSchema,
    values: z.array(z.string().trim().min(1)).max(20).default([]),
  }),
  timeRange: timeRangeSchema,
  view: z.union([chartTypeSchema, z.literal("auto")]).default("auto"),
});

export const queryResponseSchema = z.object({
  requestEcho: queryRequestSchema,
  columns: z.array(queryColumnSchema),
  rows: z.array(queryRowSchema),
  display: z.object({
    title: z.string(),
    subtitle: z.string(),
    recommendedChart: chartTypeSchema,
    supportedCharts: z.array(chartTypeSchema),
  }),
  warnings: z.array(z.string()),
  emptyStateReason: z.string().nullable(),
});

export type QueryRequest = z.infer<typeof queryRequestSchema>;
export type QueryResponse = z.infer<typeof queryResponseSchema>;
