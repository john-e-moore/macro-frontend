import { describe, expect, it } from "vitest";

import { getMetricById } from "@/lib/catalog";
import type { QueryRequest } from "@/lib/contracts/query";
import { buildRppResponseFromRows } from "@/lib/services/rpp-metric-utils";

describe("rpp metrics", () => {
  it("recomputes the national series when states are excluded", () => {
    const metric = getMetricById("rpp-national-price-level");

    expect(metric).not.toBeNull();

    const request: QueryRequest = {
      metricIds: ["rpp-national-price-level"],
      geography: {
        level: "state",
        values: ["CA"],
      },
      timeRange: {
        startYear: 2023,
        endYear: 2024,
      },
      view: "auto",
      options: {
        category: "housing_rents",
        aggregation: "selected_plus_us",
        includeUsAggregate: true,
        includeSelectedAggregate: false,
        excludedGeographies: ["CA"],
      },
    };

    const response = buildRppResponseFromRows(metric!, request, [
      {
        year: 2023,
        state_abbrev: "CA",
        geo_name: "California",
        category: "Housing rents",
        rpp_function_name: "Rents",
        pce_function_name: "Housing",
        mapping_method: "approximation_housing_proxy_for_rents",
        rpp: 110,
        pce_share: 0.4,
        weighted_rpp: 44,
      },
      {
        year: 2023,
        state_abbrev: "TX",
        geo_name: "Texas",
        category: "Housing rents",
        rpp_function_name: "Rents",
        pce_function_name: "Housing",
        mapping_method: "approximation_housing_proxy_for_rents",
        rpp: 90,
        pce_share: 0.6,
        weighted_rpp: 54,
      },
      {
        year: 2024,
        state_abbrev: "CA",
        geo_name: "California",
        category: "Housing rents",
        rpp_function_name: "Rents",
        pce_function_name: "Housing",
        mapping_method: "approximation_housing_proxy_for_rents",
        rpp: 120,
        pce_share: 0.25,
        weighted_rpp: 30,
      },
      {
        year: 2024,
        state_abbrev: "TX",
        geo_name: "Texas",
        category: "Housing rents",
        rpp_function_name: "Rents",
        pce_function_name: "Housing",
        mapping_method: "approximation_housing_proxy_for_rents",
        rpp: 100,
        pce_share: 0.75,
        weighted_rpp: 75,
      },
    ]);

    expect(response.series.map((series) => series.label)).toEqual([
      "US overall",
      "US excluding CA",
      "California",
    ]);
    expect(
      response.aggregates.find((aggregate) => aggregate.id === "latest-us-overall")?.value,
    ).toBe(105);
    expect(
      response.aggregates.find((aggregate) => aggregate.id === "latest-us-excluding")?.value,
    ).toBe(100);
    expect(
      response.aggregates.find((aggregate) => aggregate.id === "excluded-gap")?.value,
    ).toBe(-5);
  });
});
