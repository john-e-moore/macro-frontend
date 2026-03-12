import { getMetricsByIds } from "@/lib/catalog";
import type { QueryRequest, QueryResponse } from "@/lib/contracts/query";
import { queryReadOnly } from "@/lib/db/server";
import { formatCompactCurrency, formatPercent } from "@/lib/services/formatting";

type FederalComparisonRow = {
  state_fips: string;
  state_abbrev: string;
  geo_name: string;
  year: number;
  federal_to_persons_receipts_dollars: number | null;
  federal_stategov_receipts_dollars: number | null;
  gdp_current_dollars: number | null;
};

async function fetchFederalComparisonRows(year: number) {
  return queryReadOnly<FederalComparisonRow>(
    `
      with persons as (
        select
          state_fips,
          state_abbrev,
          geo_name,
          year,
          federal_to_persons_receipts_dollars,
          gdp_current_dollars
        from v_state_federal_to_persons_gdp_annual
        where year = $1
      ),
      stategov as (
        select
          state_fips,
          state_abbrev,
          geo_name,
          year,
          federal_stategov_receipts_dollars
        from v_state_federal_to_stategov_gdp_annual
        where year = $1
      )
      select
        coalesce(persons.state_fips, stategov.state_fips) as state_fips,
        coalesce(persons.state_abbrev, stategov.state_abbrev) as state_abbrev,
        coalesce(persons.geo_name, stategov.geo_name) as geo_name,
        coalesce(persons.year, stategov.year) as year,
        persons.federal_to_persons_receipts_dollars,
        stategov.federal_stategov_receipts_dollars,
        persons.gdp_current_dollars
      from persons
      full outer join stategov
        on persons.state_fips = stategov.state_fips
       and persons.year = stategov.year
      order by state_abbrev
    `,
    [year],
  );
}

function toSelectedState(request: QueryRequest, rows: FederalComparisonRow[]) {
  const selected = request.geography.values[0];
  if (selected) {
    return selected;
  }

  return rows[0]?.state_abbrev ?? "CA";
}

export function isFederalMetricSet(metricIds: string[]): boolean {
  const metrics = getMetricsByIds(metricIds);

  return (
    metrics.length > 0 &&
    metrics.every((metric) => metric.family === "federal-inflows" || metric.family === "gdp")
  );
}

export async function buildFederalComparisonResponse(
  request: QueryRequest,
): Promise<QueryResponse> {
  const year = request.timeRange.endYear;
  const rows = await fetchFederalComparisonRows(year);
  const selectedStateAbbrev = toSelectedState(request, rows);
  const selectedStateRow = rows.find((row) => row.state_abbrev === selectedStateAbbrev) ?? null;

  const dataRows = rows.map((row) => {
    const directTransfers = row.federal_to_persons_receipts_dollars;
    const programFunding = row.federal_stategov_receipts_dollars;
    const totalInflows =
      (directTransfers ?? 0) + (programFunding ?? 0) > 0
        ? (directTransfers ?? 0) + (programFunding ?? 0)
        : null;
    const inflowsToGdpRatio =
      totalInflows !== null && row.gdp_current_dollars
        ? totalInflows / row.gdp_current_dollars
        : null;

    return {
      stateAbbrev: row.state_abbrev,
      stateName: row.geo_name,
      year: row.year,
      federalDirectTransfers: directTransfers,
      federalProgramFunding: programFunding,
      federalTotalInflows: totalInflows,
      gdp: row.gdp_current_dollars,
      inflowsToGdpRatio,
    };
  });

  const selectedRow = dataRows.find((row) => row.stateAbbrev === selectedStateAbbrev) ?? null;

  return {
    requestEcho: request,
    columns: [
      { key: "stateAbbrev", label: "State", type: "string" },
      { key: "stateName", label: "State name", type: "string" },
      { key: "year", label: "Year", type: "number" },
      {
        key: "federalDirectTransfers",
        label: "Federal direct transfers",
        type: "number",
      },
      {
        key: "federalProgramFunding",
        label: "Federal program funding",
        type: "number",
      },
      { key: "federalTotalInflows", label: "Federal total inflows", type: "number" },
      { key: "gdp", label: "GDP", type: "number" },
      { key: "inflowsToGdpRatio", label: "Inflows to GDP ratio", type: "number" },
    ],
    rows: dataRows,
    series: selectedRow
      ? [
          {
            key: "federal-direct-transfers",
            label: "Direct transfers",
            unit: "Dollars",
            geography: selectedRow.stateAbbrev,
            points: [{ x: "Direct transfers", y: selectedRow.federalDirectTransfers }],
          },
          {
            key: "federal-program-funding",
            label: "Program funding",
            unit: "Dollars",
            geography: selectedRow.stateAbbrev,
            points: [{ x: "Program funding", y: selectedRow.federalProgramFunding }],
          },
          {
            key: "federal-total-inflows",
            label: "Total inflows",
            unit: "Dollars",
            geography: selectedRow.stateAbbrev,
            points: [{ x: "Total inflows", y: selectedRow.federalTotalInflows }],
          },
          {
            key: "state-gdp",
            label: "GDP",
            unit: "Dollars",
            geography: selectedRow.stateAbbrev,
            points: [{ x: "GDP", y: selectedRow.gdp }],
          },
        ]
      : [],
    aggregates: [
      {
        id: "selected-direct-transfers",
        label: `${selectedRow?.stateName ?? selectedStateAbbrev} direct transfers`,
        value: selectedRow?.federalDirectTransfers ?? null,
        formattedValue: formatCompactCurrency(selectedRow?.federalDirectTransfers ?? null),
        unit: "Dollars",
        context: String(year),
      },
      {
        id: "selected-program-funding",
        label: `${selectedRow?.stateName ?? selectedStateAbbrev} program funding`,
        value: selectedRow?.federalProgramFunding ?? null,
        formattedValue: formatCompactCurrency(selectedRow?.federalProgramFunding ?? null),
        unit: "Dollars",
        context: String(year),
      },
      {
        id: "selected-ratio",
        label: `${selectedRow?.stateName ?? selectedStateAbbrev} inflows to GDP`,
        value: selectedRow?.inflowsToGdpRatio ?? null,
        formattedValue: formatPercent(
          selectedRow?.inflowsToGdpRatio !== null && selectedRow?.inflowsToGdpRatio !== undefined
            ? selectedRow.inflowsToGdpRatio * 100
            : null,
          1,
        ),
        unit: "Percent",
        context: String(year),
      },
    ],
    display: {
      title: "Federal money versus GDP",
      subtitle:
        "Compare direct transfers to people, program funding to state governments, combined inflows, and GDP for the selected year.",
      recommendedChart: request.view === "auto" ? "bar" : request.view,
      supportedCharts: ["table", "bar", "map"],
      unitLabel: "Dollars",
      metricFamily: "federal-inflows",
      notes: [
        "Program-funding coverage begins in 2012 and may be missing for DC in the serving layer.",
      ],
    },
    warnings:
      selectedStateRow && selectedStateRow.federal_stategov_receipts_dollars === null
        ? ["Program-funding data is unavailable for the selected geography and year."]
        : [],
    emptyStateReason: rows.length === 0 ? "No federal comparison rows matched the requested year." : null,
  };
}
