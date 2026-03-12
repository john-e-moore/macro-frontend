import { describe, expect, it } from "vitest";

import {
  buildQueryRequestFromState,
  parseExplorerState,
  serializeExplorerState,
} from "@/lib/explore-state";

describe("explore state", () => {
  it("parses and normalizes URL search params", () => {
    const state = parseExplorerState({
      metric: "pce-growth-yoy",
      view: "multi_line",
      category: "food",
      startYear: "2021",
      endYear: "2024",
      states: "ca,tx,ny",
      excludedStates: "ca",
    });

    expect(state.metricId).toBe("pce-growth-yoy");
    expect(state.states).toEqual(["CA", "TX", "NY"]);
    expect(state.excludedStates).toEqual(["CA"]);
  });

  it("serializes the current explorer state", () => {
    const serialized = serializeExplorerState(
      parseExplorerState({
        metric: "pce-total",
        states: "CA,TX",
        view: "map",
      }),
    );

    expect(serialized.get("metric")).toBe("pce-total");
    expect(serialized.get("states")).toBe("CA,TX");
  });

  it("builds the federal comparison query shape for federal metrics", () => {
    const request = buildQueryRequestFromState(
      parseExplorerState({
        metric: "federal-total-inflows",
        view: "bar",
        startYear: "2023",
        endYear: "2023",
        states: "CA",
      }),
    );

    expect(request.metricIds).toEqual([
      "federal-direct-transfers",
      "federal-program-funding",
      "federal-total-inflows",
      "state-gdp",
    ]);
    expect(request.options.includeUsAggregate).toBe(false);
  });
});
