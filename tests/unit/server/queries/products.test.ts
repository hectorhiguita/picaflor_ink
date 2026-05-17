/**
 * Unit tests for server/queries/products.ts
 *
 * The `db` singleton is mocked so these tests run without a real database.
 */

import {
  getCategories,
  getProductCount,
  getActiveProducts,
  getProductBySlug,
} from "@/server/queries/products";

// ─── Mock the db singleton ────────────────────────────────────────────────────

jest.mock("@/server/db", () => ({
  db: {
    category: {
      findMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Import the mocked db so we can configure return values in each test
import { db as mockDbRaw } from "@/server/db";
const mockDb = mockDbRaw as unknown as {
  category: { findMany: jest.Mock };
  product: { findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock };
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const categoryFixture = {
  id: "cat-1",
  slug: "camisetas-algodon",
  name: "Camisetas Algodón",
  description: "Camisetas de algodón 100%",
  sortOrder: 1,
  active: true,
};

const variantFixture = {
  id: "var-1",
  colorName: "Negro",
  colorHex: "#000000",
  size: "M",
  sku: "CAM-ALG-NEG-M",
  priceOverrideCop: null,
  stockStatus: "AVAILABLE",
  mockupImage: { url: "https://cdn.example.com/mockup.webp" },
};

const productFixture = {
  id: "prod-1",
  slug: "camiseta-algodon-negra",
  name: "Camiseta Algodón Negra",
  description: "Camiseta de algodón premium",
  basePriceCop: 40000,
  printTechnique: "DTF",
  featured: false,
  createdAt: new Date("2024-01-15T10:00:00Z"),
  category: categoryFixture,
  variants: [variantFixture],
  printableAreas: [
    {
      id: "area-1",
      position: "FRONT_CHEST",
      x: 100,
      y: 80,
      width: 200,
      height: 200,
      rotation: 0,
    },
  ],
};

// ─── getCategories ────────────────────────────────────────────────────────────

describe("getCategories", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns active categories sorted by sortOrder", async () => {
    mockDb.category.findMany.mockResolvedValue([categoryFixture]);

    const result = await getCategories();

    expect(mockDb.category.findMany).toHaveBeenCalledWith({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: expect.objectContaining({
        id: true,
        slug: true,
        name: true,
        description: true,
        sortOrder: true,
      }),
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "cat-1",
      slug: "camisetas-algodon",
      name: "Camisetas Algodón",
      description: "Camisetas de algodón 100%",
      sortOrder: 1,
    });
  });

  it("returns empty array when no categories exist", async () => {
    mockDb.category.findMany.mockResolvedValue([]);
    const result = await getCategories();
    expect(result).toEqual([]);
  });
});

// ─── getProductCount ──────────────────────────────────────────────────────────

describe("getProductCount", () => {
  beforeEach(() => jest.clearAllMocks());

  it("counts all active products when no category filter", async () => {
    mockDb.product.count.mockResolvedValue(5);

    const result = await getProductCount({});

    expect(mockDb.product.count).toHaveBeenCalledWith({
      where: { active: true },
    });
    expect(result).toBe(5);
  });

  it("filters by category slug when provided", async () => {
    mockDb.product.count.mockResolvedValue(2);

    const result = await getProductCount({ categorySlug: "camisetas-algodon" });

    expect(mockDb.product.count).toHaveBeenCalledWith({
      where: {
        active: true,
        category: { slug: "camisetas-algodon", active: true },
      },
    });
    expect(result).toBe(2);
  });

  it("returns 0 when no products match", async () => {
    mockDb.product.count.mockResolvedValue(0);
    const result = await getProductCount({ categorySlug: "nonexistent" });
    expect(result).toBe(0);
  });
});

// ─── getActiveProducts ────────────────────────────────────────────────────────

describe("getActiveProducts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns products with default params (newest, page 1, pageSize 20)", async () => {
    mockDb.product.findMany.mockResolvedValue([productFixture]);

    const result = await getActiveProducts();

    expect(mockDb.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 20,
      })
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("prod-1");
    expect(result[0].createdAt).toBe("2024-01-15T10:00:00.000Z");
  });

  it("applies price_asc sort", async () => {
    mockDb.product.findMany.mockResolvedValue([]);

    await getActiveProducts({ sort: "price_asc" });

    expect(mockDb.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { basePriceCop: "asc" } })
    );
  });

  it("applies price_desc sort", async () => {
    mockDb.product.findMany.mockResolvedValue([]);

    await getActiveProducts({ sort: "price_desc" });

    expect(mockDb.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { basePriceCop: "desc" } })
    );
  });

  it("applies category slug filter", async () => {
    mockDb.product.findMany.mockResolvedValue([]);

    await getActiveProducts({ categorySlug: "mugs" });

    expect(mockDb.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          active: true,
          category: { slug: "mugs", active: true },
        },
      })
    );
  });

  it("calculates correct skip for page 2 with pageSize 10", async () => {
    mockDb.product.findMany.mockResolvedValue([]);

    await getActiveProducts({ page: 2, pageSize: 10 });

    expect(mockDb.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it("maps firstVariant correctly with priceOverrideCop", async () => {
    const variantWithOverride = {
      ...variantFixture,
      priceOverrideCop: 45000,
    };
    mockDb.product.findMany.mockResolvedValue([
      { ...productFixture, variants: [variantWithOverride] },
    ]);

    const result = await getActiveProducts();

    expect(result[0].firstVariant?.effectivePriceCop).toBe(45000);
  });

  it("maps firstVariant effectivePriceCop to basePriceCop when no override", async () => {
    mockDb.product.findMany.mockResolvedValue([productFixture]);

    const result = await getActiveProducts();

    expect(result[0].firstVariant?.effectivePriceCop).toBe(40000);
  });

  it("sets firstVariant to null when product has no active variants", async () => {
    mockDb.product.findMany.mockResolvedValue([
      { ...productFixture, variants: [] },
    ]);

    const result = await getActiveProducts();

    expect(result[0].firstVariant).toBeNull();
  });

  it("returns empty array when no products found", async () => {
    mockDb.product.findMany.mockResolvedValue([]);
    const result = await getActiveProducts();
    expect(result).toEqual([]);
  });
});

// ─── getProductBySlug ─────────────────────────────────────────────────────────

describe("getProductBySlug", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns full product detail for a valid slug", async () => {
    mockDb.product.findFirst.mockResolvedValue(productFixture);

    const result = await getProductBySlug("camiseta-algodon-negra");

    expect(mockDb.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "camiseta-algodon-negra", active: true },
      })
    );

    expect(result).not.toBeNull();
    expect(result!.id).toBe("prod-1");
    expect(result!.variants).toHaveLength(1);
    expect(result!.printableAreas).toHaveLength(1);
    expect(result!.printableAreas[0].position).toBe("FRONT_CHEST");
  });

  it("returns null when product is not found", async () => {
    mockDb.product.findFirst.mockResolvedValue(null);

    const result = await getProductBySlug("nonexistent-slug");

    expect(result).toBeNull();
  });

  it("maps all variant fields correctly", async () => {
    mockDb.product.findFirst.mockResolvedValue(productFixture);

    const result = await getProductBySlug("camiseta-algodon-negra");

    const variant = result!.variants[0];
    expect(variant.id).toBe("var-1");
    expect(variant.colorName).toBe("Negro");
    expect(variant.colorHex).toBe("#000000");
    expect(variant.size).toBe("M");
    expect(variant.sku).toBe("CAM-ALG-NEG-M");
    expect(variant.effectivePriceCop).toBe(40000);
    expect(variant.stockStatus).toBe("AVAILABLE");
    expect(variant.mockupImageUrl).toBe("https://cdn.example.com/mockup.webp");
  });

  it("uses the public fallback mockup when variant has no mockup image", async () => {
    const variantNoImage = { ...variantFixture, mockupImage: null };
    mockDb.product.findFirst.mockResolvedValue({
      ...productFixture,
      variants: [variantNoImage],
    });

    const result = await getProductBySlug("camiseta-algodon-negra");

    expect(result!.variants[0].mockupImageUrl).toBe(
      "/images/products/camiseta-algodon-negra/mockups/negro.svg"
    );
  });

  it("returns product with empty variants array when none are active", async () => {
    mockDb.product.findFirst.mockResolvedValue({
      ...productFixture,
      variants: [],
    });

    const result = await getProductBySlug("camiseta-algodon-negra");

    expect(result!.variants).toEqual([]);
  });

  it("returns product with empty printableAreas when none are active", async () => {
    mockDb.product.findFirst.mockResolvedValue({
      ...productFixture,
      printableAreas: [],
    });

    const result = await getProductBySlug("camiseta-algodon-negra");

    expect(result!.printableAreas).toEqual([]);
  });

  it("serializes createdAt as ISO string", async () => {
    mockDb.product.findFirst.mockResolvedValue(productFixture);

    const result = await getProductBySlug("camiseta-algodon-negra");

    expect(result!.createdAt).toBe("2024-01-15T10:00:00.000Z");
  });
});
