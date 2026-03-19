import { getMetricById } from "@/lib/catalog";

export function isFederalMetric(metricId: string): boolean {
  const metric = getMetricById(metricId);

  return metric?.family === "federal-inflows" || metric?.family === "gdp";
}

export function isTrendMetric(metricId: string): boolean {
  return metricId === "pce-growth-yoy" || metricId === "pce-inflation-yoy";
}

export function isRppMetric(metricId: string): boolean {
  return getMetricById(metricId)?.family === "rpp-price-levels";
}

export function supportsExcludedStates(metricId: string): boolean {
  return isTrendMetric(metricId) || isRppMetric(metricId);
}

export function supportsSelectedAggregate(metricId: string): boolean {
  return !isFederalMetric(metricId) && !isTrendMetric(metricId) && !isRppMetric(metricId);
}
