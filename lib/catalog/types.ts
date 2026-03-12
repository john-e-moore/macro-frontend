export const chartTypes = ["table", "bar", "line", "multi_line", "map"] as const;

export type ChartType = (typeof chartTypes)[number];

export const geographyLevels = ["nation", "state"] as const;

export type GeographyLevel = (typeof geographyLevels)[number];

export interface MetricTimeCoverage {
  startYear: number;
  endYear: number;
}

export interface MetricSource {
  id: string;
  name: string;
  url?: string;
}

export interface MetricCatalogEntry {
  id: string;
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
}

export interface MetricCatalogSummary {
  id: string;
  displayName: string;
  shortDescription: string;
  category: string;
  allowedChartTypes: ChartType[];
  unit: string;
}
