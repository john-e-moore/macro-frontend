import { getMetricById } from "@/lib/catalog";
import type { ChartType } from "@/lib/catalog/types";
import type { QueryRequest } from "@/lib/contracts/query";
import { isStateCode } from "@/lib/geography";

export type ExplorerView = ChartType | "auto";

export type ExplorerState = {
  metricId: string;
  view: ExplorerView;
  category: QueryRequest["options"]["category"];
  aggregation: QueryRequest["options"]["aggregation"];
  includeUsAggregate: boolean;
  includeSelectedAggregate: boolean;
  startYear: number;
  endYear: number;
  states: string[];
  excludedStates: string[];
};

export const federalComparisonMetricIds = [
  "federal-direct-transfers",
  "federal-program-funding",
  "federal-total-inflows",
  "state-gdp",
] as const;

const validCategories: QueryRequest["options"]["category"][] = [
  "all",
  "food",
  "gas",
  "housing",
  "health",
  "food_services",
];

const validAggregations: QueryRequest["options"]["aggregation"][] = [
  "selected_only",
  "selected_plus_us",
  "us_only",
];

const validViews: ExplorerView[] = [
  "auto",
  "table",
  "bar",
  "line",
  "multi_line",
  "map",
] as const;

export const defaultExplorerState: ExplorerState = {
  metricId: "pce-total",
  view: "auto",
  category: "all",
  aggregation: "selected_plus_us",
  includeUsAggregate: true,
  includeSelectedAggregate: true,
  startYear: 2024,
  endYear: 2024,
  states: ["CA", "TX", "NY"],
  excludedStates: [],
};

function getSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseStateList(value: string | string[] | undefined): string[] {
  const source = Array.isArray(value) ? value.join(",") : value ?? "";

  return Array.from(
    new Set(
      source
        .split(",")
        .map((part) => part.trim().toUpperCase())
        .filter((part) => part.length > 0 && isStateCode(part)),
    ),
  );
}

function parseNumber(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const parsed = Number(getSingleValue(value));

  return Number.isInteger(parsed) ? parsed : fallback;
}

function isFederalMetric(metricId: string): boolean {
  const metric = getMetricById(metricId);

  return metric?.family === "federal-inflows" || metric?.family === "gdp";
}

export function getMetricCategoryOptions(metricId: string) {
  const metric = getMetricById(metricId);

  return (
    metric?.dimensions?.find((dimension) => dimension.key === "category")
      ?.options ?? [{ id: "all", label: "All data" }]
  );
}

export function getAvailableViews(state: ExplorerState): ChartType[] {
  if (isFederalMetric(state.metricId)) {
    return ["table", "bar", "map"];
  }

  if (
    state.metricId === "pce-growth-yoy" ||
    state.metricId === "pce-inflation-yoy"
  ) {
    return ["table", "line", "multi_line"];
  }

  if (state.startYear === state.endYear) {
    return ["table", "bar", "map"];
  }

  return ["table", "line", "multi_line"];
}

export function normalizeExplorerState(
  state: ExplorerState,
): ExplorerState {
  const metric = getMetricById(state.metricId) ?? getMetricById(defaultExplorerState.metricId);
  const metricId = metric?.id ?? defaultExplorerState.metricId;
  const categoryOptions = getMetricCategoryOptions(metricId).map((option) => option.id);
  const category = categoryOptions.includes(state.category) ? state.category : "all";
  const startYear = Math.max(metric?.timeCoverage.startYear ?? 2000, state.startYear);
  const endYear = Math.min(metric?.timeCoverage.endYear ?? 2024, state.endYear);
  const normalizedRange =
    startYear <= endYear
      ? { startYear, endYear }
      : { startYear: endYear, endYear };
  const availableViews = getAvailableViews({
    ...state,
    metricId,
    category,
    ...normalizedRange,
  });
  const view =
    state.view === "auto" || availableViews.includes(state.view)
      ? state.view
      : availableViews[0];

  return {
    ...state,
    metricId,
    category,
    view,
    ...normalizedRange,
    states: state.states.length > 0 ? state.states : defaultExplorerState.states,
    excludedStates: state.excludedStates,
  };
}

export function parseExplorerState(
  searchParams: Record<string, string | string[] | undefined>,
): ExplorerState {
  const rawMetricId = getSingleValue(searchParams.metric);
  const metricId =
    rawMetricId && getMetricById(rawMetricId) ? rawMetricId : defaultExplorerState.metricId;
  const rawView = getSingleValue(searchParams.view);
  const rawCategory = getSingleValue(searchParams.category);
  const rawAggregation = getSingleValue(searchParams.aggregation);

  return normalizeExplorerState({
    metricId,
    view: validViews.includes(rawView as ExplorerView)
      ? (rawView as ExplorerView)
      : defaultExplorerState.view,
    category: validCategories.includes(rawCategory as QueryRequest["options"]["category"])
      ? (rawCategory as QueryRequest["options"]["category"])
      : defaultExplorerState.category,
    aggregation: validAggregations.includes(rawAggregation as QueryRequest["options"]["aggregation"])
      ? (rawAggregation as QueryRequest["options"]["aggregation"])
      : defaultExplorerState.aggregation,
    includeUsAggregate: getSingleValue(searchParams.includeUsAggregate) !== "false",
    includeSelectedAggregate:
      getSingleValue(searchParams.includeSelectedAggregate) !== "false",
    startYear: parseNumber(searchParams.startYear, defaultExplorerState.startYear),
    endYear: parseNumber(searchParams.endYear, defaultExplorerState.endYear),
    states: parseStateList(searchParams.states),
    excludedStates: parseStateList(searchParams.excludedStates),
  });
}

export function serializeExplorerState(state: ExplorerState): URLSearchParams {
  const params = new URLSearchParams();

  params.set("metric", state.metricId);
  params.set("view", state.view);
  params.set("category", state.category);
  params.set("aggregation", state.aggregation);
  params.set("startYear", String(state.startYear));
  params.set("endYear", String(state.endYear));
  params.set("includeUsAggregate", String(state.includeUsAggregate));
  params.set("includeSelectedAggregate", String(state.includeSelectedAggregate));

  if (state.states.length > 0) {
    params.set("states", state.states.join(","));
  }

  if (state.excludedStates.length > 0) {
    params.set("excludedStates", state.excludedStates.join(","));
  }

  return params;
}

export function buildQueryRequestFromState(
  state: ExplorerState,
): QueryRequest {
  const metricIds = isFederalMetric(state.metricId)
    ? [...federalComparisonMetricIds]
    : [state.metricId];

  return {
    metricIds,
    geography: {
      level: "state",
      values: state.states,
    },
    timeRange: {
      startYear: state.startYear,
      endYear: state.endYear,
    },
    view: state.view,
    options: {
      category: state.category,
      aggregation: state.aggregation,
      includeUsAggregate: isFederalMetric(state.metricId)
        ? false
        : state.includeUsAggregate,
      includeSelectedAggregate: isFederalMetric(state.metricId)
        ? false
        : state.includeSelectedAggregate,
      excludedGeographies:
        state.metricId === "pce-growth-yoy" || state.metricId === "pce-inflation-yoy"
          ? state.excludedStates
          : [],
    },
  };
}
