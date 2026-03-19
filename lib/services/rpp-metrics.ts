import { getChartSupport } from "@/lib/chart-support";
import type { MetricCatalogEntry } from "@/lib/catalog/types";
import type { QueryRequest, QueryResponse } from "@/lib/contracts/query";
import { queryReadOnly } from "@/lib/db/server";
import {
  buildRppResponseFromRows,
  getCategoryConfig,
  type RppWeightedRow,
} from "@/lib/services/rpp-metric-utils";

async function fetchRppRows(categoryLabel: string, startYear: number, endYear: number) {
  return queryReadOnly<RppWeightedRow>(
    `
      select
        year,
        state_abbrev,
        geo_name,
        category,
        rpp_function_name,
        pce_function_name,
        mapping_method,
        rpp,
        pce_share,
        weighted_rpp
      from v_state_rpp_pce_weighted_annual
      where category = $1
        and year between $2 and $3
      order by year, state_abbrev
    `,
    [categoryLabel, startYear, endYear],
  );
}

export async function buildRppPriceLevelResponse(
  metric: MetricCatalogEntry,
  request: QueryRequest,
): Promise<QueryResponse> {
  const categoryOption = getCategoryConfig(metric, request.options.category);
  const rows = await fetchRppRows(
    categoryOption.label,
    request.timeRange.startYear,
    request.timeRange.endYear,
  );
  const response = buildRppResponseFromRows(metric, request, rows);
  const chartSupport = getChartSupport({
    metricEntries: [metric],
    selectedGeographyCount: Math.max(response.series.length, 1),
    geographyLevel: "state",
    startYear: request.timeRange.startYear,
    endYear: request.timeRange.endYear,
    requestedView: request.view,
  });

  return {
    ...response,
    display: {
      ...response.display,
      recommendedChart: chartSupport.recommendedView,
      recommendedChartReason: chartSupport.reason,
      supportedCharts: chartSupport.supportedViews,
    },
  };
}
