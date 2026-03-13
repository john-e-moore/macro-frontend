import { afterEach, describe, expect, it, vi } from "vitest";

import { getCachedRouteValue } from "@/lib/route-cache";

describe("route cache", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reuses a cached value within the ttl window", async () => {
    vi.useFakeTimers();
    const loader = vi.fn(() => "value");

    const first = await getCachedRouteValue({
      scope: "test",
      key: "alpha",
      ttlSeconds: 60,
      loader,
    });
    const second = await getCachedRouteValue({
      scope: "test",
      key: "alpha",
      ttlSeconds: 60,
      loader,
    });

    expect(first.cacheStatus).toBe("MISS");
    expect(second.cacheStatus).toBe("HIT");
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("expires cached values after the ttl window", async () => {
    vi.useFakeTimers();
    const loader = vi.fn(() => "value");

    await getCachedRouteValue({
      scope: "test-expiry",
      key: "beta",
      ttlSeconds: 1,
      loader,
    });
    vi.advanceTimersByTime(1100);
    const second = await getCachedRouteValue({
      scope: "test-expiry",
      key: "beta",
      ttlSeconds: 1,
      loader,
    });

    expect(second.cacheStatus).toBe("MISS");
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
