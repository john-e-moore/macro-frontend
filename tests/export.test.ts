import { describe, expect, it } from "vitest";

import { buildExportFile, buildExportManifest } from "@/lib/services/export";

const request = {
  metricIds: ["unemployment-rate"],
  geography: {
    level: "state" as const,
    values: ["CA", "NY"],
  },
  timeRange: {
    startYear: 2023,
    endYear: 2024,
  },
  view: "auto" as const,
  format: "csv" as const,
};

describe("export service", () => {
  it("builds an export manifest", () => {
    const manifest = buildExportManifest(request);

    expect(manifest.fileName.endsWith(".csv")).toBe(true);
    expect(manifest.rowCount).toBeGreaterThan(0);
  });

  it("builds csv output", () => {
    const { body } = buildExportFile(request);

    expect(typeof body).toBe("string");
    expect(body).toContain("geography,year,unemployment-rate");
  });
});
