import type { ChartType, MetricCatalogEntry } from "@/lib/catalog/types";

type ChartSupportContext = {
  metricEntries: MetricCatalogEntry[];
  selectedGeographyCount: number;
  geographyLevel: "nation" | "state";
  startYear: number;
  endYear: number;
  requestedView: ChartType | "auto";
};

type ChartSupportResult = {
  supportedViews: ChartType[];
  recommendedView: ChartType;
  reason: string;
};

function getTimeFilteredViews(
  metric: MetricCatalogEntry,
  hasMultipleYears: boolean,
): ChartType[] {
  if (metric.family === "federal-inflows" || metric.family === "gdp") {
    return ["table", "bar", "map"];
  }

  if (metric.family === "pce-growth" || metric.family === "pce-inflation") {
    return ["table", "line", "multi_line"];
  }

  return hasMultipleYears
    ? metric.allowedChartTypes.filter(
        (view) => view === "table" || view === "line" || view === "multi_line",
      )
    : metric.allowedChartTypes.filter(
        (view) => view === "table" || view === "bar" || view === "map",
      );
}

function intersectViews(viewSets: ChartType[][]): ChartType[] {
  if (viewSets.length === 0) {
    return ["table"];
  }

  return viewSets.slice(1).reduce<ChartType[]>((shared, current) => {
    return shared.filter((view) => current.includes(view));
  }, [...viewSets[0]]);
}

function recommendAutoView(
  supportedViews: ChartType[],
  context: ChartSupportContext,
): { view: ChartType; reason: string } {
  const hasMultipleYears = context.startYear !== context.endYear;

  if (hasMultipleYears) {
    if (context.selectedGeographyCount <= 1 && supportedViews.includes("line")) {
      return {
        view: "line",
        reason: "A single geography over multiple years is easiest to compare as a line.",
      };
    }

    if (supportedViews.includes("multi_line")) {
      return {
        view: "multi_line",
        reason:
          "Multiple geographies over multiple years are easiest to compare as separate trend lines.",
      };
    }

    if (supportedViews.includes("line")) {
      return {
        view: "line",
        reason: "A time range is selected, so a line view best preserves the trend.",
      };
    }
  }

  if (
    context.geographyLevel === "state" &&
    context.selectedGeographyCount > 1 &&
    supportedViews.includes("map")
  ) {
    return {
      view: "map",
      reason: "A single-year state comparison is easiest to scan on a map.",
    };
  }

  if (supportedViews.includes("bar")) {
    return {
      view: "bar",
      reason: "A one-period comparison is easiest to read as a bar chart.",
    };
  }

  return {
    view: supportedViews[0] ?? "table",
    reason: "A table is the safest fallback when the selected shape does not fit another chart.",
  };
}

export function getChartSupport(context: ChartSupportContext): ChartSupportResult {
  const hasMultipleYears = context.startYear !== context.endYear;
  const supportedViews = intersectViews(
    context.metricEntries.map((metric) => getTimeFilteredViews(metric, hasMultipleYears)),
  );
  const dedupedSupportedViews = Array.from(new Set(supportedViews));

  if (
    context.requestedView !== "auto" &&
    dedupedSupportedViews.includes(context.requestedView)
  ) {
    return {
      supportedViews: dedupedSupportedViews,
      recommendedView: context.requestedView,
      reason: `The selected view is supported for the current metric and time shape.`,
    };
  }

  const recommendation = recommendAutoView(dedupedSupportedViews, context);

  return {
    supportedViews: dedupedSupportedViews,
    recommendedView: recommendation.view,
    reason: recommendation.reason,
  };
}
