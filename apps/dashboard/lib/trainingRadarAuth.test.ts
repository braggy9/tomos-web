import { afterEach, describe, expect, it } from "vitest";
import {
  isTrainingRadarAuthConfigured,
  isValidTrainingRadarPassword,
  isValidTrainingRadarReadToken,
} from "./trainingRadarAuth";

afterEach(() => {
  delete process.env.TRAINING_RADAR_PAGE_PASSWORD;
  delete process.env.TRAINING_RADAR_READ_TOKEN;
});

describe("Training Radar credentials", () => {
  it("keeps the page password separate from the machine token", () => {
    process.env.TRAINING_RADAR_READ_TOKEN = "machine-secret";
    expect(isTrainingRadarAuthConfigured()).toBe(false);
    expect(isValidTrainingRadarPassword("machine-secret")).toBe(false);
    expect(isValidTrainingRadarReadToken("machine-secret")).toBe(true);
  });

  it("validates the configured page password", () => {
    process.env.TRAINING_RADAR_PAGE_PASSWORD = "human-secret";
    expect(isTrainingRadarAuthConfigured()).toBe(true);
    expect(isValidTrainingRadarPassword("human-secret")).toBe(true);
    expect(isValidTrainingRadarPassword("wrong")).toBe(false);
  });
});
