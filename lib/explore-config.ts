import type { ChartType } from "@/lib/catalog/types";
import type { QueryRequest } from "@/lib/contracts/query";

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

export type ExplorerPreset = {
  id: string;
  label: string;
  description: string;
  state: Partial<ExplorerState>;
};

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

export const explorerPresets: ExplorerPreset[] = [
  {
    id: "pce-map",
    label: "PCE map",
    description: "Compare the latest all-items spending levels across states.",
    state: {
      metricId: "pce-total",
      view: "map",
      category: "all",
      aggregation: "selected_plus_us",
      startYear: 2024,
      endYear: 2024,
      states: ["CA", "TX", "NY"],
      excludedStates: [],
    },
  },
  {
    id: "pce-trend",
    label: "PCE trend",
    description: "Compare food spending growth across a short recent window.",
    state: {
      metricId: "pce-growth-yoy",
      view: "multi_line",
      category: "food",
      aggregation: "selected_plus_us",
      startYear: 2021,
      endYear: 2024,
      states: ["CA", "TX", "NY"],
      excludedStates: [],
      includeSelectedAggregate: false,
    },
  },
  {
    id: "federal-comparison",
    label: "Federal comparison",
    description: "Inspect one-year federal inflows against state GDP.",
    state: {
      metricId: "federal-total-inflows",
      view: "bar",
      category: "all",
      aggregation: "selected_only",
      startYear: 2023,
      endYear: 2023,
      states: ["CA"],
      excludedStates: [],
      includeUsAggregate: false,
      includeSelectedAggregate: false,
    },
  },
  {
    id: "rpp-exclusion",
    label: "National price level",
    description: "Estimate the national price level with selected states excluded.",
    state: {
      metricId: "rpp-national-price-level",
      view: "multi_line",
      category: "housing_rents",
      aggregation: "selected_plus_us",
      startYear: 2021,
      endYear: 2024,
      states: ["CA", "NY", "TX"],
      excludedStates: ["CA", "NY"],
      includeUsAggregate: true,
      includeSelectedAggregate: false,
    },
  },
];
