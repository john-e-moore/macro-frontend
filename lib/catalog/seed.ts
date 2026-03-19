import type { MetricCatalogEntry } from "@/lib/catalog/types";

const pceCategoryDimension = {
  key: "category" as const,
  label: "PCE category",
  defaultOptionId: "all",
  options: [
    { id: "all", label: "All PCE" },
    {
      id: "food",
      label: "Food",
      description: "Food and beverages purchased for off-premises consumption.",
    },
    { id: "gas", label: "Gas", description: "Gasoline and other energy goods." },
    { id: "housing", label: "Housing", description: "Housing and utilities." },
    { id: "health", label: "Health", description: "Health care." },
    {
      id: "food_services",
      label: "Food services",
      description: "Food services and accommodations.",
    },
  ],
};

const rppCategoryDimension = {
  key: "category" as const,
  label: "RPP category",
  defaultOptionId: "all_items",
  options: [
    { id: "all_items", label: "All items" },
    { id: "goods", label: "Goods" },
    { id: "housing_rents", label: "Housing rents" },
    { id: "other_services", label: "Other services" },
    { id: "utilities", label: "Utilities" },
  ],
};

export const metricCatalogSeed: MetricCatalogEntry[] = [
  {
    id: "pce-total",
    family: "pce-levels",
    displayName: "PCE Total",
    shortDescription:
      "Annual personal consumption expenditures for a selected state and category.",
    definition:
      "Measures nominal personal consumption expenditures from BEA state PCE tables. The app can aggregate selected states into a live combined total.",
    unit: "Dollars",
    source: {
      id: "bea",
      name: "Bureau of Economic Analysis",
      url: "https://www.bea.gov/data/consumer-spending/main",
    },
    caveats: [
      "The current serving layer exposes annual state data only.",
      "US overall is derived by summing the available state series because the serving layer does not expose a separate national row here.",
    ],
    aliases: ["pce", "personal consumption expenditures", "consumer spending"],
    allowedGeographies: ["state"],
    timeCoverage: {
      startYear: 2000,
      endYear: 2024,
    },
    allowedChartTypes: ["table", "bar", "line", "multi_line", "map"],
    category: "Spending",
    freshness: "Annual BEA refresh",
    status: "live",
    dimensions: [pceCategoryDimension],
    derivation: {
      kind: "raw",
      description: "Direct nominal annual PCE levels from BEA SAPCE1 state rows.",
    },
    backing: {
      datasetId: "pce_state_sapce1",
      beaTableName: "SAPCE1",
      lineCodeByDimensionOptionId: {
        all: "1",
        food: "9",
        gas: "11",
        housing: "15",
        health: "16",
        food_services: "19",
      },
    },
  },
  {
    id: "pce-per-capita",
    family: "pce-levels",
    displayName: "PCE Per Capita",
    shortDescription:
      "Annual personal consumption expenditures per resident for a selected state and category.",
    definition:
      "Divides nominal state PCE by resident population from Census. Selected-state aggregates use summed spending divided by summed population.",
    unit: "Dollars per person",
    source: {
      id: "bea-census",
      name: "BEA and Census",
      url: "https://www.bea.gov/data/consumer-spending/main",
    },
    caveats: [
      "Per-capita values are derived in the app from raw PCE and resident population to avoid duplicate rows in the current serving-layer convenience view.",
    ],
    aliases: ["pce per capita", "spending per person", "consumer spending per resident"],
    allowedGeographies: ["state"],
    timeCoverage: {
      startYear: 2000,
      endYear: 2024,
    },
    allowedChartTypes: ["table", "bar", "line", "multi_line", "map"],
    category: "Spending",
    freshness: "Annual BEA and Census refresh",
    status: "live",
    dimensions: [pceCategoryDimension],
    derivation: {
      kind: "per_capita",
      description: "Nominal PCE divided by resident population.",
      dependsOnMetricIds: ["pce-total"],
    },
    backing: {
      datasetId: "pce_state_sapce1",
      beaTableName: "SAPCE1",
      lineCodeByDimensionOptionId: {
        all: "1",
        food: "9",
        gas: "11",
        housing: "15",
        health: "16",
        food_services: "19",
      },
      notes: ["Population is sourced from census_state_population resident population rows."],
    },
  },
  {
    id: "pce-inflation-yoy",
    family: "pce-inflation",
    displayName: "PCE Inflation",
    shortDescription:
      "Year-over-year change in an implicit state PCE price index built from nominal and real PCE.",
    definition:
      "Builds an implicit PCE price index from nominal total PCE and real total PCE, then computes year-over-year change. This is available only for all-items PCE in the current serving layer.",
    unit: "Percent",
    source: {
      id: "bea",
      name: "Bureau of Economic Analysis",
      url: "https://www.bea.gov/data/consumer-spending/main",
    },
    caveats: [
      "Category-specific state PCE price indexes are not currently available in the serving layer.",
      "The current implementation therefore exposes true inflation only for all-items PCE.",
    ],
    aliases: ["pce inflation", "implicit pce inflation", "price growth"],
    allowedGeographies: ["state"],
    timeCoverage: {
      startYear: 2001,
      endYear: 2024,
    },
    allowedChartTypes: ["table", "line", "multi_line"],
    category: "Prices",
    freshness: "Annual BEA refresh",
    status: "partial",
    dimensions: [
      {
        key: "category",
        label: "PCE category",
        defaultOptionId: "all",
        options: [{ id: "all", label: "All PCE" }],
      },
      {
        key: "transform",
        label: "Transformation",
        defaultOptionId: "yoy",
        options: [{ id: "yoy", label: "Year over year" }],
      },
    ],
    derivation: {
      kind: "implicit_price_index",
      description: "Nominal total PCE divided by real total PCE, then transformed into year-over-year percent change.",
    },
    backing: {
      datasetId: "state_real_income_and_pce_sarpi",
      beaTableName: "SARPI",
      notes: [
        "Uses SARPI line 3 for real PCE and SAPCE1 line 1 for nominal total PCE.",
      ],
    },
  },
  {
    id: "pce-growth-yoy",
    family: "pce-growth",
    displayName: "PCE Growth",
    shortDescription:
      "Year-over-year change in nominal state PCE levels for the selected category.",
    definition:
      "Tracks year-over-year growth in nominal personal consumption expenditures. This is useful for category storytelling when a true state-category price index is unavailable.",
    unit: "Percent",
    source: {
      id: "bea",
      name: "Bureau of Economic Analysis",
      url: "https://www.bea.gov/data/consumer-spending/main",
    },
    caveats: [
      "This is nominal spending growth, not a pure price inflation measure.",
      "Use the all-items PCE inflation metric when you need a state-level price series rather than spending growth.",
    ],
    aliases: ["pce yoy growth", "spending growth", "food price story"],
    allowedGeographies: ["state"],
    timeCoverage: {
      startYear: 2001,
      endYear: 2024,
    },
    allowedChartTypes: ["table", "line", "multi_line"],
    category: "Spending",
    freshness: "Annual BEA refresh",
    status: "live",
    dimensions: [pceCategoryDimension],
    derivation: {
      kind: "yoy",
      description: "Year-over-year percent change in nominal PCE levels from BEA SAPCE1 rows.",
      dependsOnMetricIds: ["pce-total"],
    },
    backing: {
      viewName: "v_macro_yoy",
      beaTableName: "SAPCE1",
      lineCodeByDimensionOptionId: {
        all: "1",
        food: "9",
        gas: "11",
        housing: "15",
        health: "16",
        food_services: "19",
      },
    },
  },
  {
    id: "rpp-national-price-level",
    family: "rpp-price-levels",
    displayName: "National Price Level",
    shortDescription:
      "Annual RPP-based national price level with optional state exclusions and state comparisons.",
    definition:
      "Uses state regional price parities weighted by category PCE shares to recompute a national annual price level. Excluding states recomputes the weighted national average from the remaining state rows.",
    unit: "Index (US=100)",
    source: {
      id: "bea",
      name: "Bureau of Economic Analysis",
      url: "https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area",
    },
    caveats: [
      "This is an annual weighted price-level index, not nominal spending growth.",
      "The serving view exposes category mappings such as housing-rent and utilities proxies; interpretation should follow the mapped RPP/PCE functions shown in metadata.",
    ],
    aliases: [
      "rpp",
      "regional price parity",
      "national price level",
      "rent prices",
      "utilities prices",
    ],
    allowedGeographies: ["state"],
    timeCoverage: {
      startYear: 2008,
      endYear: 2024,
    },
    allowedChartTypes: ["table", "bar", "line", "multi_line"],
    category: "Prices",
    freshness: "Annual BEA refresh",
    status: "live",
    dimensions: [rppCategoryDimension],
    derivation: {
      kind: "ratio",
      description: "Weighted average of state RPP values using category-level PCE shares.",
    },
    backing: {
      viewName: "v_state_rpp_pce_weighted_annual",
      notes: [
        "US overall is derived by summing weighted_rpp across all states for the selected year and category.",
        "US excluding selected states is derived by dividing included weighted_rpp by the included pce_share total.",
      ],
    },
  },
  {
    id: "federal-direct-transfers",
    family: "federal-inflows",
    displayName: "Federal Direct Transfers",
    shortDescription:
      "Annual federal current transfer receipts to persons for each state.",
    definition:
      "Tracks federal transfer receipts flowing to people in a state and supports comparison against state GDP.",
    unit: "Dollars",
    source: {
      id: "bea",
      name: "Bureau of Economic Analysis",
      url: "https://www.bea.gov/data/income-saving/personal-income-by-state",
    },
    caveats: [
      "This metric covers direct transfers to persons, not state-government program funding.",
    ],
    aliases: ["federal transfers", "federal money to persons", "transfers to people"],
    allowedGeographies: ["state"],
    timeCoverage: {
      startYear: 2000,
      endYear: 2024,
    },
    allowedChartTypes: ["table", "bar", "map"],
    category: "Federal flows",
    freshness: "Annual BEA refresh",
    status: "live",
    derivation: {
      kind: "raw",
      description: "Direct receipts from the serving federal-to-persons view.",
    },
    backing: {
      viewName: "v_state_federal_to_persons_gdp_annual",
    },
  },
  {
    id: "federal-program-funding",
    family: "federal-inflows",
    displayName: "Federal Program Funding",
    shortDescription:
      "Annual federal intergovernmental revenue flowing to state governments.",
    definition:
      "Tracks federal funding to state and local public programs using Census state government finance data joined to GDP.",
    unit: "Dollars",
    source: {
      id: "census",
      name: "Census State Government Finance",
      url: "https://www.census.gov/programs-surveys/gov-finances.html",
    },
    caveats: [
      "Coverage currently starts in 2012 and excludes DC in the serving layer.",
    ],
    aliases: ["state program funding", "federal grants", "state government funding"],
    allowedGeographies: ["state"],
    timeCoverage: {
      startYear: 2012,
      endYear: 2023,
    },
    allowedChartTypes: ["table", "bar", "map"],
    category: "Federal flows",
    freshness: "Annual Census refresh",
    status: "live",
    derivation: {
      kind: "raw",
      description: "Direct receipts from the serving federal-to-state-government view.",
    },
    backing: {
      viewName: "v_state_federal_to_stategov_gdp_annual",
    },
  },
  {
    id: "federal-total-inflows",
    family: "federal-inflows",
    displayName: "Federal Total Inflows",
    shortDescription:
      "Combined direct transfers to persons and federal program funding flowing into a state.",
    definition:
      "Adds direct federal transfers to persons and federal intergovernmental program funding to provide a combined federal inflow figure.",
    unit: "Dollars",
    source: {
      id: "bea-census",
      name: "BEA and Census",
    },
    caveats: [
      "Combined inflows inherit the narrower year coverage of the program-funding series.",
    ],
    aliases: ["total federal money", "combined federal inflows", "all federal inflows"],
    allowedGeographies: ["state"],
    timeCoverage: {
      startYear: 2012,
      endYear: 2023,
    },
    allowedChartTypes: ["table", "bar", "map"],
    category: "Federal flows",
    freshness: "Annual combined refresh",
    status: "live",
    derivation: {
      kind: "sum",
      description: "Sum of federal direct transfers and federal program funding.",
      dependsOnMetricIds: [
        "federal-direct-transfers",
        "federal-program-funding",
      ],
    },
  },
  {
    id: "state-gdp",
    family: "gdp",
    displayName: "State GDP",
    shortDescription: "Annual current-dollar gross domestic product by state.",
    definition:
      "Measures the annual current-dollar value of economic output for a state and provides the denominator for inflow-to-GDP comparisons.",
    unit: "Dollars",
    source: {
      id: "bea",
      name: "Bureau of Economic Analysis",
      url: "https://www.bea.gov/data/gdp/gdp-state",
    },
    caveats: [
      "This metric uses current-dollar GDP to keep the comparison aligned with current-dollar federal inflows.",
    ],
    aliases: ["gdp", "state output", "economic contribution"],
    allowedGeographies: ["state"],
    timeCoverage: {
      startYear: 2000,
      endYear: 2024,
    },
    allowedChartTypes: ["table", "bar", "map"],
    category: "Growth",
    freshness: "Annual BEA refresh",
    status: "live",
    derivation: {
      kind: "raw",
      description: "Direct current-dollar GDP rows from BEA state GDP data.",
    },
    backing: {
      datasetId: "state_gdp_sagdp1",
      beaTableName: "SAGDP1",
      lineCodeByDimensionOptionId: {
        all: "3",
      },
    },
  },
];
