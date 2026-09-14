import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const fetchMock = vi.fn();

describe("recovery log upstream authentication", () => {
  beforeEach(() => {
    process.env.RECOVERY_LOG_TOKEN = "capture-secret";
    process.env.TOMOS_TRAINING_READ_TOKEN = "training-secret";
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    delete process.env.RECOVERY_LOG_TOKEN;
    delete process.env.TOMOS_TRAINING_READ_TOKEN;
    vi.unstubAllGlobals();
  });

  function request(scores = "3 4 3 4") {
    return new Request("https://example.com/api/recovery-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "capture-secret", scores }),
    });
  }

  it("fails closed when backend training auth is unavailable", async () => {
    delete process.env.TOMOS_TRAINING_READ_TOKEN;

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      ok: false,
      error: "training_api_auth_not_configured",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards validated scores with the server-side bearer token", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: {
        id: "recovery-1",
        date: "2026-08-19T01:00:00.000Z",
        readinessScore: 3.5,
      },
    }), { status: 201, headers: { "Content-Type": "application/json" } }));

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://tomos-task-api.vercel.app/api/gym/recovery",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer training-secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sleepQuality: 3,
          soreness: 4,
          energy: 3,
          motivation: 4,
        }),
      })
    );
  });

  it("surfaces an upstream authentication failure without reporting success", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      success: false,
      error: "training_data_unauthorized",
    }), { status: 401, headers: { "Content-Type": "application/json" } }));

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: "training_data_unauthorized",
    });
  });
});
