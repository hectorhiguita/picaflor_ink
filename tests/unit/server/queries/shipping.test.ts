/**
 * Unit tests for server/queries/shipping.ts
 *
 * The `db` singleton is mocked so these tests run without a real database.
 * Tests cover getActiveShippingRates and calculateShipping with all branches
 * (Req 12.1, 12.2, 12.4).
 */

import {
  getActiveShippingRates,
  calculateShipping,
} from "@/server/queries/shipping";

// ─── Mock the db singleton ────────────────────────────────────────────────────

jest.mock("@/server/db", () => ({
  db: {
    shippingRate: {
      findMany: jest.fn(),
    },
  },
}));

import { db as mockDbRaw } from "@/server/db";
const mockDb = mockDbRaw as unknown as {
  shippingRate: {
    findMany: jest.Mock;
  };
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const medellínRate = {
  id: "rate-1",
  name: "Medellín Centro",
  zone: "Medellín",
  priceCop: 5000,
  active: true,
};

const areaMetroRate = {
  id: "rate-2",
  name: "Área Metropolitana",
  zone: "Área Metropolitana",
  priceCop: 8000,
  active: true,
};

const pendingRate = {
  id: "rate-3",
  name: "Zona especial",
  zone: "Envigado",
  priceCop: null,
  active: true,
};

// ─── getActiveShippingRates ───────────────────────────────────────────────────

describe("getActiveShippingRates", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns all active shipping rates", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([
      medellínRate,
      areaMetroRate,
    ]);

    const result = await getActiveShippingRates();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(medellínRate);
    expect(result[1]).toEqual(areaMetroRate);
  });

  it("queries only active rates ordered by sortOrder ascending", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([]);

    await getActiveShippingRates();

    expect(mockDb.shippingRate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      })
    );
  });

  it("returns an empty array when no active rates exist", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([]);

    const result = await getActiveShippingRates();

    expect(result).toEqual([]);
  });

  it("includes rates with null priceCop (pending confirmation)", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([pendingRate]);

    const result = await getActiveShippingRates();

    expect(result).toHaveLength(1);
    expect(result[0].priceCop).toBeNull();
  });
});

// ─── calculateShipping ────────────────────────────────────────────────────────

describe("calculateShipping", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the matching zone rate when zone is provided and matches", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([
      medellínRate,
      areaMetroRate,
    ]);

    const result = await calculateShipping("Medellín");

    expect(result.rate).toEqual(medellínRate);
    expect(result.priceCop).toBe(5000);
    expect(result.isPendingConfirmation).toBe(false);
  });

  it("matches zone case-insensitively", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([
      medellínRate,
      areaMetroRate,
    ]);

    const result = await calculateShipping("medellín");

    expect(result.rate).toEqual(medellínRate);
    expect(result.priceCop).toBe(5000);
    expect(result.isPendingConfirmation).toBe(false);
  });

  it("trims whitespace from zone before matching", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([
      medellínRate,
      areaMetroRate,
    ]);

    const result = await calculateShipping("  Medellín  ");

    expect(result.rate).toEqual(medellínRate);
    expect(result.priceCop).toBe(5000);
  });

  it("falls back to the first active rate when zone does not match any rate", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([
      medellínRate,
      areaMetroRate,
    ]);

    const result = await calculateShipping("Zona desconocida");

    // Falls back to first rate (lowest sortOrder)
    expect(result.rate).toEqual(medellínRate);
    expect(result.priceCop).toBe(5000);
    expect(result.isPendingConfirmation).toBe(false);
  });

  it("falls back to the first active rate when no zone is provided", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([
      medellínRate,
      areaMetroRate,
    ]);

    const result = await calculateShipping();

    expect(result.rate).toEqual(medellínRate);
    expect(result.priceCop).toBe(5000);
    expect(result.isPendingConfirmation).toBe(false);
  });

  it("returns isPendingConfirmation=true when matched rate has null priceCop", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([pendingRate]);

    const result = await calculateShipping("Envigado");

    expect(result.rate).toEqual(pendingRate);
    expect(result.priceCop).toBeNull();
    expect(result.isPendingConfirmation).toBe(true);
  });

  it("returns isPendingConfirmation=true when no active rates are configured", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([]);

    const result = await calculateShipping("Medellín");

    expect(result.rate).toBeNull();
    expect(result.priceCop).toBeNull();
    expect(result.isPendingConfirmation).toBe(true);
  });

  it("returns isPendingConfirmation=true when called without zone and no rates exist", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([]);

    const result = await calculateShipping();

    expect(result.rate).toBeNull();
    expect(result.priceCop).toBeNull();
    expect(result.isPendingConfirmation).toBe(true);
  });

  it("returns the Área Metropolitana rate when that zone is requested", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([
      medellínRate,
      areaMetroRate,
    ]);

    const result = await calculateShipping("Área Metropolitana");

    expect(result.rate).toEqual(areaMetroRate);
    expect(result.priceCop).toBe(8000);
    expect(result.isPendingConfirmation).toBe(false);
  });

  it("falls back to first rate when zone is an empty string", async () => {
    mockDb.shippingRate.findMany.mockResolvedValue([
      medellínRate,
      areaMetroRate,
    ]);

    // Empty string zone — no zone match, falls back to first rate
    const result = await calculateShipping("");

    expect(result.rate).toEqual(medellínRate);
    expect(result.priceCop).toBe(5000);
  });
});
