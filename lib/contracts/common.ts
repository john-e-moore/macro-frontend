import { z } from "zod";

export const chartTypeSchema = z.enum([
  "table",
  "bar",
  "line",
  "multi_line",
  "map",
]);

export const geographyLevelSchema = z.enum(["nation", "state"]);

export const metricStatusSchema = z.enum(["live", "partial"]);

export const metricDimensionKeySchema = z.enum([
  "category",
  "transform",
  "aggregation",
  "comparison",
]);

export const metricDerivationKindSchema = z.enum([
  "raw",
  "per_capita",
  "yoy",
  "ratio",
  "sum",
  "implicit_price_index",
]);

export const metricCategorySchema = z.enum([
  "all",
  "food",
  "gas",
  "housing",
  "health",
  "food_services",
]);

export const metricTransformSchema = z.enum([
  "level",
  "per_capita",
  "yoy",
  "ratio_to_gdp",
  "combined_total",
  "implicit_price_index",
]);

export const metricAggregationSchema = z.enum([
  "selected_only",
  "selected_plus_us",
  "us_only",
]);

export const timeRangeSchema = z
  .object({
    startYear: z.number().int().min(1900).max(2100),
    endYear: z.number().int().min(1900).max(2100),
  })
  .refine((value) => value.startYear <= value.endYear, {
    message: "startYear must be less than or equal to endYear",
    path: ["endYear"],
  });

export const metricSummarySchema = z.object({
  id: z.string(),
  family: z.string(),
  displayName: z.string(),
  shortDescription: z.string(),
  category: z.string(),
  allowedChartTypes: z.array(chartTypeSchema),
  unit: z.string(),
  status: metricStatusSchema,
});

export const metricDimensionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export const metricDimensionSchema = z.object({
  key: metricDimensionKeySchema,
  label: z.string(),
  defaultOptionId: z.string().optional(),
  options: z.array(metricDimensionOptionSchema),
});

export const metricDerivationSchema = z.object({
  kind: metricDerivationKindSchema,
  description: z.string(),
  dependsOnMetricIds: z.array(z.string()).optional(),
});

export const metricBackingSchema = z.object({
  datasetId: z.string().optional(),
  beaTableName: z.string().optional(),
  viewName: z.string().optional(),
  lineCodeByDimensionOptionId: z.record(z.string(), z.string()).optional(),
  notes: z.array(z.string()).optional(),
});

export const metricCatalogEntrySchema = z.object({
  id: z.string(),
  family: z.string(),
  displayName: z.string(),
  shortDescription: z.string(),
  definition: z.string(),
  unit: z.string(),
  source: z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url().optional(),
  }),
  caveats: z.array(z.string()),
  aliases: z.array(z.string()),
  allowedGeographies: z.array(geographyLevelSchema),
  timeCoverage: timeRangeSchema,
  allowedChartTypes: z.array(chartTypeSchema),
  category: z.string(),
  freshness: z.string(),
  status: metricStatusSchema,
  dimensions: z.array(metricDimensionSchema).optional(),
  derivation: metricDerivationSchema.optional(),
  backing: metricBackingSchema.optional(),
});

export const queryColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(["string", "number"]),
});

export const queryRowSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.null()]),
);

export const queryPointSchema = z.object({
  x: z.union([z.string(), z.number()]),
  y: z.number().nullable(),
});

export const querySeriesSchema = z.object({
  key: z.string(),
  label: z.string(),
  geography: z.string().nullable().optional(),
  unit: z.string(),
  points: z.array(queryPointSchema),
});

export const queryAggregateSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number().nullable(),
  formattedValue: z.string(),
  unit: z.string(),
  context: z.string().nullable().optional(),
});
