import {
  getMetricById,
  listMetricCategories,
  listMetrics,
  searchMetrics,
} from "@/lib/catalog";

import { MetricCatalog } from "@/components/metric-catalog";

function getSearchParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = getSearchParam(resolvedSearchParams.q).trim();
  const selectedCategory = getSearchParam(resolvedSearchParams.category).trim() || "all";
  const selectedMetricId = getSearchParam(resolvedSearchParams.metric).trim();
  const categories = listMetricCategories();
  const metrics = (query ? searchMetrics(query) : listMetrics()).filter((metric) =>
    selectedCategory === "all" ? true : metric.category === selectedCategory,
  );
  const featuredMetric =
    getMetricById(selectedMetricId) ??
    (metrics[0] ? getMetricById(metrics[0].id) : null);

  return (
    <MetricCatalog
      metrics={metrics}
      categories={categories}
      selectedCategory={selectedCategory}
      query={query}
      featuredMetric={featuredMetric}
    />
  );
}
