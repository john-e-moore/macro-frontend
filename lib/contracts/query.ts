import { z } from "zod";

import {
  metricAggregationSchema,
  metricCategorySchema,
  metricTransformSchema,
  chartTypeSchema,
  geographyLevelSchema,
  queryAggregateSchema,
  queryColumnSchema,
  queryRowSchema,
  querySeriesSchema,
  timeRangeSchema,
} from "@/lib/contracts/common";

export const queryRequestSchema = z.object({
  metricIds: z.array(z.string().trim().min(1)).min(1).max(5),
  geography: z.object({
    level: geographyLevelSchema,
    values: z.array(z.string().trim().min(1)).max(60).default([]),
  }),
  timeRange: timeRangeSchema,
  view: z.union([chartTypeSchema, z.literal("auto")]).default("auto"),
  options: z
    .object({
      category: metricCategorySchema.default("all"),
      transform: metricTransformSchema.optional(),
      aggregation: metricAggregationSchema.default("selected_plus_us"),
      includeUsAggregate: z.boolean().default(true),
      includeSelectedAggregate: z.boolean().default(false),
      excludedGeographies: z.array(z.string().trim().min(1)).max(60).default([]),
    })
    .default({
      category: "all",
      aggregation: "selected_plus_us",
      includeUsAggregate: true,
      includeSelectedAggregate: false,
      excludedGeographies: [],
    }),
});

export const queryRecoveryPatchSchema = z.object({
  view: z.union([chartTypeSchema, z.literal("auto")]).optional(),
  category: metricCategorySchema.optional(),
  aggregation: metricAggregationSchema.optional(),
  includeUsAggregate: z.boolean().optional(),
  includeSelectedAggregate: z.boolean().optional(),
  startYear: z.number().int().min(1900).max(2100).optional(),
  endYear: z.number().int().min(1900).max(2100).optional(),
  states: z.array(z.string().trim().min(1)).max(60).optional(),
  excludedStates: z.array(z.string().trim().min(1)).max(60).optional(),
});

export const queryRecoveryActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  patch: queryRecoveryPatchSchema,
});

export const queryEmptyStateSchema = z.object({
  kind: z.enum(["no_results", "sparse", "unsupported"]),
  title: z.string(),
  description: z.string(),
  suggestedActions: z.array(queryRecoveryActionSchema),
});

export const queryResponseSchema = z.object({
  requestEcho: queryRequestSchema,
  columns: z.array(queryColumnSchema),
  rows: z.array(queryRowSchema),
  series: z.array(querySeriesSchema),
  aggregates: z.array(queryAggregateSchema),
  display: z.object({
    title: z.string(),
    subtitle: z.string(),
    recommendedChart: chartTypeSchema,
    recommendedChartReason: z.string(),
    supportedCharts: z.array(chartTypeSchema),
    unitLabel: z.string(),
    metricFamily: z.string(),
    notes: z.array(z.string()),
  }),
  warnings: z.array(z.string()),
  emptyStateReason: z.string().nullable(),
  emptyState: queryEmptyStateSchema.nullable(),
});

export type QueryRequest = z.infer<typeof queryRequestSchema>;
export type QueryRecoveryPatch = z.infer<typeof queryRecoveryPatchSchema>;
export type QueryResponse = z.infer<typeof queryResponseSchema>;
