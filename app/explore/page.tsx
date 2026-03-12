import { listMetricEntries, listMetrics } from "@/lib/catalog";
import { parseExplorerState } from "@/lib/explore-state";

import { ExplorePage } from "@/components/explore-page";

export default async function ExploreRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <ExplorePage
      initialState={parseExplorerState(resolvedSearchParams)}
      metricOptions={listMetrics()}
      metricEntries={listMetricEntries()}
    />
  );
}
