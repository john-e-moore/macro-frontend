import type { MetricCatalogEntry } from "@/lib/catalog/types";

export const metricCatalogSeed: MetricCatalogEntry[] = [
  {
    id: "real-gdp",
    displayName: "Real GDP",
    shortDescription: "Inflation-adjusted gross domestic product.",
    definition:
      "Measures the inflation-adjusted value of goods and services produced in an economy over a period of time.",
    unit: "Billions of chained dollars",
    source: {
      id: "bea",
      name: "Bureau of Economic Analysis",
      url: "https://www.bea.gov/",
    },
    caveats: [
      "National aggregate only in the initial Phase 0 seed.",
      "Later phases should map this semantic metric to serving-layer query logic.",
    ],
    aliases: ["gdp", "gross domestic product", "output"],
    allowedGeographies: ["nation"],
    timeCoverage: {
      startYear: 2000,
      endYear: 2024,
    },
    allowedChartTypes: ["table", "line"],
    category: "Growth",
    freshness: "Quarterly source refresh",
  },
  {
    id: "unemployment-rate",
    displayName: "Unemployment Rate",
    shortDescription: "Share of the labor force that is unemployed.",
    definition:
      "Represents the percentage of the civilian labor force that is unemployed and actively seeking work.",
    unit: "Percent",
    source: {
      id: "bls",
      name: "Bureau of Labor Statistics",
      url: "https://www.bls.gov/",
    },
    caveats: [
      "State comparisons can be noisy over short time windows.",
      "Seasonal adjustment details should remain visible in future metadata panels.",
    ],
    aliases: ["jobless rate", "labor market", "unemployment"],
    allowedGeographies: ["nation", "state"],
    timeCoverage: {
      startYear: 2005,
      endYear: 2024,
    },
    allowedChartTypes: ["table", "bar", "line", "multi_line", "map"],
    category: "Labor",
    freshness: "Monthly source refresh",
  },
  {
    id: "cpi",
    displayName: "Consumer Price Index",
    shortDescription: "Broad measure of consumer price inflation.",
    definition:
      "Tracks average change over time in the prices paid by urban consumers for a market basket of goods and services.",
    unit: "Index",
    source: {
      id: "bls",
      name: "Bureau of Labor Statistics",
      url: "https://www.bls.gov/cpi/",
    },
    caveats: [
      "Index levels are not directly comparable to growth rates without transformation.",
    ],
    aliases: ["inflation", "prices", "consumer prices"],
    allowedGeographies: ["nation"],
    timeCoverage: {
      startYear: 2000,
      endYear: 2024,
    },
    allowedChartTypes: ["table", "line"],
    category: "Prices",
    freshness: "Monthly source refresh",
  },
];
