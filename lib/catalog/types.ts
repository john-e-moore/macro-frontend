export const chartTypes = ["table", "bar", "line", "multi_line", "map"] as const;

export type ChartType = (typeof chartTypes)[number];

export const geographyLevels = ["nation", "state"] as const;

export type GeographyLevel = (typeof geographyLevels)[number];

export const metricDimensionKeys = [
  "category",
  "transform",
  "aggregation",
  "comparison",
] as const;

export type MetricDimensionKey = (typeof metricDimensionKeys)[number];

export const metricDerivationKinds = [
  "raw",
  "per_capita",
  "yoy",
  "ratio",
  "sum",
  "implicit_price_index",
] as const;

export type MetricDerivationKind = (typeof metricDerivationKinds)[number];

export interface MetricTimeCoverage {
  startYear: number;
  endYear: number;
}

export interface MetricSource {
  id: string;
  name: string;
  url?: string;
}

export interface MetricDimensionOption {
  id: string;
  label: string;
  description?: string;
}

export interface MetricDimension {
  key: MetricDimensionKey;
  label: string;
  defaultOptionId?: string;
  options: MetricDimensionOption[];
}

export interface MetricDerivation {
  kind: MetricDerivationKind;
  description: string;
  dependsOnMetricIds?: string[];
}

export interface MetricBacking {
  datasetId?: string;
  beaTableName?: string;
  viewName?: string;
  lineCodeByDimensionOptionId?: Record<string, string>;
  notes?: string[];
}

export interface MetricCatalogEntry {
  id: string;
  family: string;
  displayName: string;
  shortDescription: string;
  definition: string;
  unit: string;
  source: MetricSource;
  caveats: string[];
  aliases: string[];
  allowedGeographies: GeographyLevel[];
  timeCoverage: MetricTimeCoverage;
  allowedChartTypes: ChartType[];
  category: string;
  freshness: string;
  status: "live" | "partial";
  dimensions?: MetricDimension[];
  derivation?: MetricDerivation;
  backing?: MetricBacking;
}

export interface MetricCatalogSummary {
  id: string;
  family: string;
  displayName: string;
  shortDescription: string;
  category: string;
  allowedChartTypes: ChartType[];
  unit: string;
  status: MetricCatalogEntry["status"];
}
