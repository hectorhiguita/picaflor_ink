/**
 * Unit tests for server/queries/coupons.ts
 *
 * The `db` singleton is mocked so these tests run without a real database.
 * Tests cover validateCoupon with all validation branches (Req 8.11).
 */

import { validateCoupon } from "@/server/queries/coupons";

// ─── Mock the db singleton ────────────────────────────────────────────────────

jest.mock("@/server/db", () => ({
  db: {
    coupon: {
      findUnique: jest.fn(),
    },
  },
}));

import { db as mockDbRaw } from "@/server/db";
const mockDb = mockDbRaw as unknown as {
  coupon: {
    findUnique: jest.Mock;
  };
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

const validCouponFixture = {
  id: "coupon-1",
  code: "DESCUENTO10",
  type: "PERCENTAGE",
  value: 10,
  active: true,
  expiresAt: tomorrow,
  usageLimit: 100,
  usageCount: 5,
};

const validFixedCouponFixture = {
  id: "coupon-2",
  code: "FIJO5000",
  type: "FIXED_COP",
  value: 5000,
  active: true,
  expiresAt: null,
  usageLimit: null,
  usageCount: 0,
};

// ─── validateCoupon ───────────────────────────────────────────────────────────

describe("validateCoupon", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns valid=true with coupon data for a valid active coupon", async () => {
    mockDb.coupon.findUnique.mockResolvedValue(validCouponFixture);

    const result = await validateCoupon("DESCUENTO10");

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.coupon).toEqual({
        id: "coupon-1",
        code: "DESCUENTO10",
        type: "PERCENTAGE",
        value: 10,
      });
    }
  });

  it("normalizes the code to uppercase before querying", async () => {
    mockDb.coupon.findUnique.mockResolvedValue(validCouponFixture);

    await validateCoupon("descuento10");

    expect(mockDb.coupon.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { code: "DESCUENTO10" },
      })
    );
  });

  it("trims whitespace from the code before querying", async () => {
    mockDb.coupon.findUnique.mockResolvedValue(validCouponFixture);

    await validateCoupon("  DESCUENTO10  ");

    expect(mockDb.coupon.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { code: "DESCUENTO10" },
      })
    );
  });

  it("returns valid=false with error when coupon does not exist", async () => {
    mockDb.coupon.findUnique.mockResolvedValue(null);

    const result = await validateCoupon("NONEXISTENT");

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("El cupón no existe");
    }
  });

  it("returns valid=false with error when coupon is inactive", async () => {
    mockDb.coupon.findUnique.mockResolvedValue({
      ...validCouponFixture,
      active: false,
    });

    const result = await validateCoupon("DESCUENTO10");

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("El cupón no está activo");
    }
  });

  it("returns valid=false with error when coupon has expired", async () => {
    mockDb.coupon.findUnique.mockResolvedValue({
      ...validCouponFixture,
      expiresAt: yesterday,
    });

    const result = await validateCoupon("DESCUENTO10");

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("El cupón ha expirado");
    }
  });

  it("returns valid=true when coupon has no expiration date", async () => {
    mockDb.coupon.findUnique.mockResolvedValue(validFixedCouponFixture);

    const result = await validateCoupon("FIJO5000");

    expect(result.valid).toBe(true);
  });

  it("returns valid=false with error when coupon has exceeded its usage limit", async () => {
    mockDb.coupon.findUnique.mockResolvedValue({
      ...validCouponFixture,
      usageLimit: 10,
      usageCount: 10,
    });

    const result = await validateCoupon("DESCUENTO10");

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("El cupón ha alcanzado su límite de usos");
    }
  });

  it("returns valid=false when usageCount exceeds usageLimit", async () => {
    mockDb.coupon.findUnique.mockResolvedValue({
      ...validCouponFixture,
      usageLimit: 5,
      usageCount: 7,
    });

    const result = await validateCoupon("DESCUENTO10");

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("El cupón ha alcanzado su límite de usos");
    }
  });

  it("returns valid=true when coupon has no usage limit (unlimited)", async () => {
    mockDb.coupon.findUnique.mockResolvedValue({
      ...validCouponFixture,
      usageLimit: null,
      usageCount: 9999,
    });

    const result = await validateCoupon("DESCUENTO10");

    expect(result.valid).toBe(true);
  });

  it("returns valid=true when coupon is at exactly one use below the limit", async () => {
    mockDb.coupon.findUnique.mockResolvedValue({
      ...validCouponFixture,
      usageLimit: 10,
      usageCount: 9,
    });

    const result = await validateCoupon("DESCUENTO10");

    expect(result.valid).toBe(true);
  });

  it("returns valid=true for a FIXED_COP coupon with no expiry and no limit", async () => {
    mockDb.coupon.findUnique.mockResolvedValue(validFixedCouponFixture);

    const result = await validateCoupon("FIJO5000");

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.coupon.type).toBe("FIXED_COP");
      expect(result.coupon.value).toBe(5000);
    }
  });

  it("does not expose usageCount or usageLimit in the returned coupon data", async () => {
    mockDb.coupon.findUnique.mockResolvedValue(validCouponFixture);

    const result = await validateCoupon("DESCUENTO10");

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.coupon).not.toHaveProperty("usageCount");
      expect(result.coupon).not.toHaveProperty("usageLimit");
      expect(result.coupon).not.toHaveProperty("active");
      expect(result.coupon).not.toHaveProperty("expiresAt");
    }
  });
});
