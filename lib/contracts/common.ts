import { z } from "zod";

export const chartTypeSchema = z.enum([
  "table",
  "bar",
  "line",
  "multi_line",
  "map",
]);

export const geographyLevelSchema = z.enum(["nation", "state"]);

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
  displayName: z.string(),
  shortDescription: z.string(),
  category: z.string(),
  allowedChartTypes: z.array(chartTypeSchema),
  unit: z.string(),
});

export const metricCatalogEntrySchema = z.object({
  id: z.string(),
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
