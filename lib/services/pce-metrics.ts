import { getMetricById } from "@/lib/catalog";
import type { MetricCatalogEntry } from "@/lib/catalog/types";
import { getChartSupport } from "@/lib/chart-support";
import type { QueryRequest, QueryResponse } from "@/lib/contracts/query";
import { queryReadOnly } from "@/lib/db/server";
import {
  formatCompactCurrency,
  formatCurrencyPerPerson,
  formatPercent,
} from "@/lib/services/formatting";
import { RequestValidationError } from "@/lib/validation/request";

type PceLevelRow = {
  state_fips: string;
  state_abbrev: string;
  geo_name: string;
  year: number;
  pce_value_scaled: number;
};

type PopulationRow = {
  state_fips: string;
  state_abbrev: string;
  geo_name: string;
  year: number;
  population: number;
};

type RealPceRow = {
  state_fips: string;
  state_abbrev: string;
  geo_name: string;
  year: number;
  real_pce_scaled: number;
};

type YearValue = {
  year: number;
  value: number | null;
};

function getCategoryLabel(metric: MetricCatalogEntry, categoryId: string): string {
  return (
    metric.dimensions
      ?.find((dimension: NonNullable<MetricCatalogEntry["dimensions"]>[number]) => dimension.key === "category")
      ?.options.find(
        (option: NonNullable<NonNullable<MetricCatalogEntry["dimensions"]>[number]["options"]>[number]) =>
          option.id === categoryId,
      )?.label ?? "All PCE"
  );
}

function getLineCode(metric: MetricCatalogEntry, categoryId: string): string {
  const lineCode =
    metric.backing?.lineCodeByDimensionOptionId?.[categoryId] ??
    metric.backing?.lineCodeByDimensionOptionId?.all;

  if (!lineCode) {
    throw new RequestValidationError("The requested PCE category is unavailable.", {
      metricId: metric.id,
      categoryId,
    });
  }

  return lineCode;
}

function toSelectionSet(values: string[], fallbackRows: { state_abbrev: string }[]): Set<string> {
  if (values.length > 0) {
    return new Set(values);
  }

  return new Set(fallbackRows.map((row) => row.state_abbrev));
}

function indexByStateYear<T extends { state_abbrev: string; year: number }>(
  rows: T[],
): Map<string, T> {
  return new Map(rows.map((row) => [`${row.state_abbrev}:${row.year}`, row]));
}

function groupRowsByState<T extends { state_abbrev: string; year: number }>(
  rows: T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const row of rows) {
    const existing = grouped.get(row.state_abbrev) ?? [];
    existing.push(row);
    grouped.set(row.state_abbrev, existing);
  }

  for (const seriesRows of grouped.values()) {
    seriesRows.sort((left, right) => left.year - right.year);
  }

  return grouped;
}

function buildYoySeries(rows: YearValue[]): YearValue[] {
  return rows.map((row, index) => {
    const previous = rows[index - 1];

    if (!previous || previous.value === null || previous.value === 0 || row.value === null) {
      return {
        year: row.year,
        value: null,
      };
    }

    return {
      year: row.year,
      value: ((row.value - previous.value) / previous.value) * 100,
    };
  });
}

function sumValues(values: Array<number | null>): number | null {
  const present = values.filter((value): value is number => value !== null);
  if (present.length === 0) {
    return null;
  }

  return present.reduce((total, value) => total + value, 0);
}

function averageValues(values: Array<number | null>): number | null {
  const present = values.filter((value): value is number => value !== null);
  if (present.length === 0) {
    return null;
  }

  return present.reduce((total, value) => total + value, 0) / present.length;
}

function buildNoResultsEmptyState(
  metric: MetricCatalogEntry,
  _request: QueryRequest,
  description: string,
) {
  const fallbackStartYear = Math.max(
    metric.timeCoverage.startYear,
    metric.timeCoverage.endYear - 3,
  );

  return {
    kind: "no_results" as const,
    title: "No rows matched these filters",
    description,
    suggestedActions: [
      {
        id: "latest-year",
        label: "Jump to the latest year",
        description: `Use ${metric.timeCoverage.endYear}, the latest covered year for this metric.`,
        patch: {
          startYear: metric.timeCoverage.endYear,
          endYear: metric.timeCoverage.endYear,
          view: "auto" as const,
        },
      },
      {
        id: "broaden-range",
        label: "Broaden the time range",
        description: "Expand to a short recent window to increase the chance of finding coverage.",
        patch: {
          startYear: fallbackStartYear,
          endYear: metric.timeCoverage.endYear,
          view: "auto" as const,
        },
      },
      {
        id: "all-category",
        label: "Try all categories",
        description: "Reset the category filter to the broadest option.",
        patch: {
          category: "all" as const,
          view: "auto" as const,
        },
      },
    ],
  };
}

async function fetchPceLevels(lineCode: string, startYear: number, endYear: number) {
  return queryReadOnly<PceLevelRow>(
    `
      select
        state_fips,
        state_abbrev,
        geo_name,
        year,
        pce_value_scaled
      from obt_state_macro_annual_latest
      where bea_table_name = 'SAPCE1'
        and line_code = $1
        and year between $2 and $3
      order by year, state_abbrev
    `,
    [lineCode, startYear, endYear],
  );
}

async function fetchPopulation(startYear: number, endYear: number) {
  return queryReadOnly<PopulationRow>(
    `
      select
        state_fips,
        state_abbrev,
        geo_name,
        year,
        pce_value_scaled as population
      from obt_state_macro_annual_latest
      where source_name = 'CENSUS'
        and dataset_id = 'census_state_population'
        and line_code = 'B01003_001E'
        and year between $1 and $2
      order by year, state_abbrev
    `,
    [startYear, endYear],
  );
}

async function fetchRealPce(startYear: number, endYear: number) {
  return queryReadOnly<RealPceRow>(
    `
      select
        state_fips,
        state_abbrev,
        geo_name,
        year,
        pce_value_scaled as real_pce_scaled
      from obt_state_macro_annual_latest
      where dataset_id = 'state_real_income_and_pce_sarpi'
        and line_code = '3'
        and year between $1 and $2
      order by year, state_abbrev
    `,
    [startYear, endYear],
  );
}

function buildStateDisplayRows(
  levelRows: PceLevelRow[],
  metricId: string,
  populationRows: PopulationRow[] = [],
) {
  const levelIndex = indexByStateYear(levelRows);
  const populationIndex = indexByStateYear(populationRows);

  return levelRows.map((row) => {
    const population = populationIndex.get(`${row.state_abbrev}:${row.year}`)?.population ?? null;
    const value =
      metricId === "pce-per-capita"
        ? population
          ? row.pce_value_scaled / population
          : null
        : row.pce_value_scaled;

    return {
      stateAbbrev: row.state_abbrev,
      stateName: row.geo_name,
      year: row.year,
      population,
      value,
      levelValue: levelIndex.get(`${row.state_abbrev}:${row.year}`)?.pce_value_scaled ?? null,
    };
  });
}

function buildAggregateValue(
  metricId: string,
  rows: Array<{ value: number; state_abbrev: string; year: number }>,
  populationRows: PopulationRow[],
): number | null {
  if (rows.length === 0) {
    return null;
  }

  if (metricId === "pce-total") {
    return rows.reduce((total, row) => total + row.value, 0);
  }

  const populationIndex = indexByStateYear(populationRows);
  let totalPopulation = 0;
  let totalValue = 0;

  for (const row of rows) {
    const population = populationIndex.get(`${row.state_abbrev}:${row.year}`)?.population;
    if (!population) {
      continue;
    }

    totalPopulation += population;
    totalValue += row.value;
  }

  if (totalPopulation === 0) {
    return null;
  }

  return totalValue / totalPopulation;
}

function formatMetricValue(metricId: string, value: number | null): string {
  if (metricId === "pce-per-capita") {
    return formatCurrencyPerPerson(value);
  }

  return formatCompactCurrency(value);
}

export async function buildPceLevelResponse(
  metric: MetricCatalogEntry,
  request: QueryRequest,
): Promise<QueryResponse> {
  const categoryId = request.options.category;
  const lineCode = getLineCode(metric, categoryId);
  const [levelRows, populationRows] = await Promise.all([
    fetchPceLevels(lineCode, request.timeRange.startYear, request.timeRange.endYear),
    fetchPopulation(request.timeRange.startYear, request.timeRange.endYear),
  ]);

  const displayRows = buildStateDisplayRows(levelRows, metric.id, populationRows);
  const selectedStates = toSelectionSet(request.geography.values, levelRows);
  const selectedYearRows = levelRows.filter((row) => row.year === request.timeRange.endYear);
  const selectedYearDisplayRows = displayRows.filter(
    (row) => row.year === request.timeRange.endYear,
  );
  const usOverallValue = buildAggregateValue(
    metric.id,
    selectedYearRows.map((row) => ({
      state_abbrev: row.state_abbrev,
      year: row.year,
      value: row.pce_value_scaled,
    })),
    populationRows,
  );
  const selectedAggregateValue = buildAggregateValue(
    metric.id,
    selectedYearRows
      .filter((row) => selectedStates.has(row.state_abbrev))
      .map((row) => ({
        state_abbrev: row.state_abbrev,
        year: row.year,
        value: row.pce_value_scaled,
      })),
    populationRows,
  );
  const categoryLabel = getCategoryLabel(metric, categoryId);
  const hasMultipleYears = request.timeRange.startYear !== request.timeRange.endYear;
  const supportedCharts = hasMultipleYears
    ? (["table", "line", "multi_line"] as const)
    : (["table", "bar", "map"] as const);
  const outputRows = hasMultipleYears
    ? displayRows
        .filter((row) => selectedStates.has(row.stateAbbrev))
        .map((row) => ({
          stateAbbrev: row.stateAbbrev,
          stateName: row.stateName,
          year: row.year,
          value: row.value,
          population: row.population,
        }))
    : selectedYearDisplayRows.map((row) => ({
        stateAbbrev: row.stateAbbrev,
        stateName: row.stateName,
        year: row.year,
        value: row.value,
        population: row.population,
      }));
  const groupedRows = new Map<string, typeof outputRows>();

  for (const row of outputRows) {
    const existing = groupedRows.get(row.stateAbbrev) ?? [];
    existing.push(row);
    groupedRows.set(row.stateAbbrev, existing);
  }

  for (const seriesRows of groupedRows.values()) {
    seriesRows.sort((left, right) => left.year - right.year);
  }

  const outputSeries = hasMultipleYears
    ? Array.from(groupedRows.entries()).map(([stateAbbrev, rows]) => ({
        key: stateAbbrev,
        label: rows[0]?.stateName ?? stateAbbrev,
        unit: metric.unit,
        geography: stateAbbrev,
        points: rows.map((row) => ({
          x: row.year,
          y: row.value,
        })),
      }))
    : [
        {
          key: metric.id,
          label: `${metric.displayName} (${categoryLabel})`,
          unit: metric.unit,
          points: selectedYearDisplayRows.map((row) => ({
            x: row.stateAbbrev,
            y: row.value,
          })),
        },
      ];
  const aggregates = [];

  if (request.options.includeUsAggregate && request.options.aggregation !== "selected_only") {
    aggregates.push({
      id: "us-overall",
      label: "US overall",
      value: usOverallValue,
      formattedValue: formatMetricValue(metric.id, usOverallValue),
      unit: metric.unit,
      context: `Derived from all available states for ${request.timeRange.endYear}.`,
    });
  }

  if (
    request.options.includeSelectedAggregate &&
    request.options.aggregation !== "us_only"
  ) {
    aggregates.push({
      id: "selected-states",
      label: "Selected states aggregate",
      value: selectedAggregateValue,
      formattedValue: formatMetricValue(metric.id, selectedAggregateValue),
      unit: metric.unit,
      context:
        selectedStates.size > 0
          ? `${selectedStates.size} selected geographies.`
          : "No states selected.",
    });
  }

  const chartSupport = getChartSupport({
    metricEntries: [metric],
    selectedGeographyCount: hasMultipleYears
      ? Math.max(selectedStates.size, 1)
      : Math.max(outputRows.length, 1),
    geographyLevel: "state",
    startYear: request.timeRange.startYear,
    endYear: request.timeRange.endYear,
    requestedView: request.view,
  });
  const emptyState =
    outputRows.length === 0
      ? buildNoResultsEmptyState(
          metric,
          request,
          "Try the latest year, broaden the time range, or reset back to all PCE.",
        )
      : null;

  return {
    requestEcho: request,
    columns: [
      { key: "stateAbbrev", label: "State", type: "string" },
      { key: "stateName", label: "State name", type: "string" },
      { key: "year", label: "Year", type: "number" },
      { key: "value", label: metric.displayName, type: "number" },
      { key: "population", label: "Population", type: "number" },
    ],
    rows: outputRows,
    series: outputSeries,
    aggregates,
    display: {
      title: hasMultipleYears
        ? `${metric.displayName} over time`
        : `${metric.displayName} map`,
      subtitle: hasMultipleYears
        ? `${categoryLabel} from ${request.timeRange.startYear} to ${request.timeRange.endYear}.`
        : `${categoryLabel} for ${request.timeRange.endYear}. Click states to update the selected aggregate.`,
      recommendedChart: chartSupport.recommendedView,
      recommendedChartReason: chartSupport.reason,
      supportedCharts: chartSupport.supportedViews.length > 0
        ? chartSupport.supportedViews
        : [...supportedCharts],
      unitLabel: metric.unit,
      metricFamily: metric.family,
      notes: metric.caveats,
    },
    warnings: [],
    emptyStateReason: emptyState?.description ?? null,
    emptyState,
  };
}

function buildGroupedYearSeries(
  rows: PceLevelRow[],
  selectedStates: Set<string>,
  buildValue: (row: PceLevelRow) => number,
  startYear: number,
) {
  const grouped = groupRowsByState(rows);
  const series = [];

  for (const [stateAbbrev, stateRows] of grouped.entries()) {
    if (!selectedStates.has(stateAbbrev)) {
      continue;
    }

    series.push({
      key: stateAbbrev,
      label: stateRows[0]?.geo_name ?? stateAbbrev,
      unit: "Percent",
      geography: stateAbbrev,
      points: buildYoySeries(
        stateRows.map((row) => ({
          year: row.year,
          value: buildValue(row),
        })),
      )
        .filter((point) => point.year >= startYear)
        .map((point) => ({
          x: point.year,
          y: point.value,
        })),
    });
  }

  return series;
}

function buildAggregateSeries(
  label: string,
  key: string,
  years: number[],
  rows: PceLevelRow[],
  buildValue: (row: PceLevelRow) => number,
  startYear: number,
): {
  key: string;
  label: string;
  unit: string;
  geography: string;
  points: Array<{ x: number; y: number | null }>;
} {
  const valuesByYear = years.map((year) => ({
    year,
    value: sumValues(
      rows
        .filter((row) => row.year === year)
        .map((row) => buildValue(row)),
    ),
  }));

  return {
    key,
    label,
    unit: "Percent",
    geography: key,
    points: buildYoySeries(valuesByYear)
      .filter((point) => point.year >= startYear)
      .map((point) => ({
        x: point.year,
        y: point.value,
      })),
  };
}

export async function buildPceGrowthResponse(
  metric: MetricCatalogEntry,
  request: QueryRequest,
): Promise<QueryResponse> {
  const categoryId = request.options.category;
  const lineCode = getLineCode(metric, categoryId);
  const levelRows = await fetchPceLevels(lineCode, request.timeRange.startYear - 1, request.timeRange.endYear);
  const selectedStates = toSelectionSet(request.geography.values, levelRows);
  const excludedStates = new Set(request.options.excludedGeographies);
  const allYears = Array.from(new Set(levelRows.map((row) => row.year))).sort(
    (left, right) => left - right,
  );
  const allSeries = buildGroupedYearSeries(
    levelRows,
    selectedStates,
    (row) => row.pce_value_scaled,
    request.timeRange.startYear,
  );
  const usSeries = buildAggregateSeries(
    "US overall",
    "US",
    allYears,
    levelRows,
    (row) => row.pce_value_scaled,
      request.timeRange.startYear,
  );
  const excludedSeries =
    excludedStates.size > 0
      ? buildAggregateSeries(
          `US excluding ${Array.from(excludedStates).join(", ")}`,
          "US_EXCLUDING",
          allYears,
          levelRows.filter((row) => !excludedStates.has(row.state_abbrev)),
          (row) => row.pce_value_scaled,
          request.timeRange.startYear,
        )
      : null;
  const categoryLabel = getCategoryLabel(metric, categoryId);
  const allOutputSeries = [usSeries, ...allSeries];
  if (excludedSeries) {
    allOutputSeries.push(excludedSeries);
  }

  const chartSupport = getChartSupport({
    metricEntries: [metric],
    selectedGeographyCount: Math.max(allOutputSeries.length, 1),
    geographyLevel: "state",
    startYear: request.timeRange.startYear,
    endYear: request.timeRange.endYear,
    requestedView: request.view,
  });
  const responseRows = allOutputSeries.flatMap((series) =>
    series.points.map((point) => ({
      geography: series.label,
      year: Number(point.x),
      value: point.y,
    })),
  );
  const emptyState =
    responseRows.length === 0
      ? buildNoResultsEmptyState(
          metric,
          request,
          "Try a broader time window or reset to all categories to recover a trend series.",
        )
      : null;

  return {
    requestEcho: request,
    columns: [
      { key: "geography", label: "Geography", type: "string" },
      { key: "year", label: "Year", type: "number" },
      { key: "value", label: metric.displayName, type: "number" },
    ],
    rows: responseRows,
    series: allOutputSeries,
    aggregates: [
      {
        id: "us-period-average",
        label: "US average since start year",
        value: averageValues(usSeries.points.map((point) => point.y)),
        formattedValue: formatPercent(
          averageValues(usSeries.points.map((point) => point.y)),
        ),
        unit: metric.unit,
        context: `${request.timeRange.startYear}-${request.timeRange.endYear}`,
      },
      {
        id: "excluded-period-average",
        label:
          excludedSeries?.label ?? "US excluding selected states average",
        value: excludedSeries
          ? averageValues(excludedSeries.points.map((point) => point.y))
          : null,
        formattedValue: excludedSeries
          ? formatPercent(averageValues(excludedSeries.points.map((point) => point.y)))
          : "N/A",
        unit: metric.unit,
        context: excludedSeries ? `${request.timeRange.startYear}-${request.timeRange.endYear}` : null,
      },
      {
        id: "latest-us",
        label: "Latest US value",
        value: usSeries.points.at(-1)?.y ?? null,
        formattedValue: formatPercent(usSeries.points.at(-1)?.y ?? null),
        unit: metric.unit,
        context: String(request.timeRange.endYear),
      },
    ],
    display: {
      title: `${categoryLabel} PCE growth`,
      subtitle:
        "Year-over-year growth in nominal PCE. Use this for category storytelling when a true state-category price index is unavailable.",
      recommendedChart: chartSupport.recommendedView,
      recommendedChartReason: chartSupport.reason,
      supportedCharts: chartSupport.supportedViews,
      unitLabel: metric.unit,
      metricFamily: metric.family,
      notes: metric.caveats,
    },
    warnings: [
      "This series reflects nominal spending growth rather than a pure price inflation index.",
    ],
    emptyStateReason: emptyState?.description ?? null,
    emptyState,
  };
}

export async function buildPceInflationResponse(
  metric: MetricCatalogEntry,
  request: QueryRequest,
): Promise<QueryResponse> {
  const [nominalRows, realRows] = await Promise.all([
    fetchPceLevels("1", request.timeRange.startYear - 1, request.timeRange.endYear),
    fetchRealPce(request.timeRange.startYear - 1, request.timeRange.endYear),
  ]);
  const realIndex = indexByStateYear(realRows);
  const selectedStates = toSelectionSet(request.geography.values, nominalRows);
  const allYears = Array.from(new Set(nominalRows.map((row) => row.year))).sort(
    (left, right) => left - right,
  );

  const nominalByState = groupRowsByState(nominalRows);
  const stateSeries = Array.from(nominalByState.entries())
    .filter(([stateAbbrev]) => selectedStates.has(stateAbbrev))
    .map(([stateAbbrev, rows]) => ({
      key: stateAbbrev,
      label: rows[0]?.geo_name ?? stateAbbrev,
      geography: stateAbbrev,
      unit: metric.unit,
      points: buildYoySeries(
        rows.map((row) => {
          const realRow = realIndex.get(`${row.state_abbrev}:${row.year}`);
          return {
            year: row.year,
            value: realRow && realRow.real_pce_scaled !== 0
              ? (row.pce_value_scaled / realRow.real_pce_scaled) * 100
              : null,
          };
        }),
      )
        .filter((point) => point.year >= request.timeRange.startYear)
        .map((point) => ({
          x: point.year,
          y: point.value,
        })),
    }));

  const usSeries = {
    key: "US",
    label: "US overall",
    geography: "US",
    unit: metric.unit,
    points: buildYoySeries(
      allYears.map((year) => {
        const nominal = sumValues(
          nominalRows.filter((row) => row.year === year).map((row) => row.pce_value_scaled),
        );
        const real = sumValues(
          realRows.filter((row) => row.year === year).map((row) => row.real_pce_scaled),
        );

        return {
          year,
          value: nominal !== null && real !== null && real !== 0 ? (nominal / real) * 100 : null,
        };
      }),
    )
      .filter((point) => point.year >= request.timeRange.startYear)
      .map((point) => ({
        x: point.year,
        y: point.value,
      })),
  };

  const rows = [usSeries, ...stateSeries].flatMap((series) =>
    series.points.map((point) => ({
      geography: series.label,
      year: Number(point.x),
      value: point.y,
    })),
  );
  const chartSupport = getChartSupport({
    metricEntries: [metric],
    selectedGeographyCount: Math.max(stateSeries.length + 1, 1),
    geographyLevel: "state",
    startYear: request.timeRange.startYear,
    endYear: request.timeRange.endYear,
    requestedView: request.view,
  });
  const emptyState =
    rows.length === 0
      ? buildNoResultsEmptyState(
          metric,
          request,
          "Try a broader year range or reset to the all-items series to restore coverage.",
        )
      : null;

  return {
    requestEcho: request,
    columns: [
      { key: "geography", label: "Geography", type: "string" },
      { key: "year", label: "Year", type: "number" },
      { key: "value", label: metric.displayName, type: "number" },
    ],
    rows,
    series: [usSeries, ...stateSeries],
    aggregates: [
      {
        id: "us-period-average",
        label: "US average since start year",
        value: averageValues(usSeries.points.map((point) => point.y)),
        formattedValue: formatPercent(
          averageValues(usSeries.points.map((point) => point.y)),
        ),
        unit: metric.unit,
        context: `${request.timeRange.startYear}-${request.timeRange.endYear}`,
      },
      {
        id: "latest-us",
        label: "Latest US inflation",
        value: usSeries.points.at(-1)?.y ?? null,
        formattedValue: formatPercent(usSeries.points.at(-1)?.y ?? null),
        unit: metric.unit,
        context: String(request.timeRange.endYear),
      },
    ],
    display: {
      title: "All-items PCE inflation",
      subtitle:
        "Year-over-year change in an implicit all-items PCE price index built from nominal and real state PCE.",
      recommendedChart: chartSupport.recommendedView,
      recommendedChartReason: chartSupport.reason,
      supportedCharts: chartSupport.supportedViews,
      unitLabel: metric.unit,
      metricFamily: metric.family,
      notes: metric.caveats,
    },
    warnings: [],
    emptyStateReason: emptyState?.description ?? null,
    emptyState,
  };
}

export function isPceMetric(metricId: string): boolean {
  return (
    getMetricById(metricId)?.family === "pce-levels" ||
    getMetricById(metricId)?.family === "pce-inflation" ||
    getMetricById(metricId)?.family === "pce-growth"
  );
}
