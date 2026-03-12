import { metricCatalogSeed } from "@/lib/catalog/seed";
import type {
  MetricCatalogEntry,
  MetricCatalogSummary,
} from "@/lib/catalog/types";

const metricCatalogById = new Map(
  metricCatalogSeed.map((metric) => [metric.id, metric]),
);

function toSummary(metric: MetricCatalogEntry): MetricCatalogSummary {
  return {
    id: metric.id,
    displayName: metric.displayName,
    shortDescription: metric.shortDescription,
    category: metric.category,
    allowedChartTypes: metric.allowedChartTypes,
    unit: metric.unit,
  };
}

function normalizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function listMetrics(): MetricCatalogSummary[] {
  return metricCatalogSeed.map(toSummary);
}

export function getMetricById(metricId: string): MetricCatalogEntry | null {
  return metricCatalogById.get(metricId) ?? null;
}

export function searchMetrics(query: string): MetricCatalogSummary[] {
  const tokens = normalizeQuery(query);

  if (tokens.length === 0) {
    return listMetrics();
  }

  return metricCatalogSeed
    .filter((metric) => {
      const haystack = [
        metric.id,
        metric.displayName,
        metric.shortDescription,
        metric.definition,
        metric.category,
        metric.unit,
        ...metric.aliases,
        ...metric.caveats,
      ]
        .join(" ")
        .toLowerCase();

      return tokens.every((token) => haystack.includes(token));
    })
    .map(toSummary);
}

export function getMetricsByIds(metricIds: string[]): MetricCatalogEntry[] {
  return metricIds
    .map((metricId) => getMetricById(metricId))
    .filter((metric): metric is MetricCatalogEntry => metric !== null);
}
