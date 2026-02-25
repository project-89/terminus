/* @vitest-environment jsdom */
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { PointsTracker } from "@/app/components/PointsTracker";
import { toolEvents } from "@/app/lib/terminal/tools/registry";

function mockJsonResponse(ok: boolean, data: any) {
  return Promise.resolve({
    ok,
    json: async () => data,
  } as Response);
}

describe("PointsTracker", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("prefers canonical userId lookup over handle", async () => {
    localStorage.setItem("p89_userId", "user-123");
    localStorage.setItem("p89_handle", "agent-legacy");
    fetchMock.mockImplementation(() =>
      mockJsonResponse(true, { points: 85, recentRewards: [] })
    );

    render(createElement(PointsTracker));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const firstUrl = String(fetchMock.mock.calls[0][0]);
    expect(firstUrl).toContain("/api/points?userId=user-123");
    expect(screen.getByText("85")).toBeTruthy();
  });

  it("falls back to handle lookup if userId lookup fails", async () => {
    localStorage.setItem("p89_userId", "stale-user");
    localStorage.setItem("p89_handle", "agent-live");
    fetchMock
      .mockImplementationOnce(() =>
        mockJsonResponse(false, { error: "User not found" })
      )
      .mockImplementationOnce(() =>
        mockJsonResponse(true, { points: 15, recentRewards: [] })
      );

    render(createElement(PointsTracker));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/api/points?userId=stale-user"
    );
    expect(String(fetchMock.mock.calls[1][0])).toContain(
      "/api/points?handle=agent-live"
    );
    expect(screen.getByText("15")).toBeTruthy();
  });

  it("reconciles from server after silent point awards", async () => {
    localStorage.setItem("p89_userId", "user-999");
    fetchMock
      .mockImplementationOnce(() =>
        mockJsonResponse(true, { points: 0, recentRewards: [] })
      )
      .mockImplementationOnce(() =>
        mockJsonResponse(true, { points: 10, recentRewards: [] })
      );

    render(createElement(PointsTracker));

    await waitFor(() => expect(screen.getByText("0")).toBeTruthy());

    toolEvents.emit("tool:award_points", {
      amount: 10,
      reason: "silent reward",
      silent: true,
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByText("10")).toBeTruthy());
  });

  it("accepts direct points sync events from status/award flows", async () => {
    localStorage.setItem("p89_userId", "user-sync");
    fetchMock.mockImplementation(() =>
      mockJsonResponse(true, { points: 15, recentRewards: [] })
    );

    render(createElement(PointsTracker));
    await waitFor(() => expect(screen.getByText("15")).toBeTruthy());

    await act(async () => {
      toolEvents.emit("tool:points_sync", { points: 85 });
    });
    await waitFor(() => expect(screen.getByText("85")).toBeTruthy());
  });
});
