/**
 * Unit tests for server/queries/designs.ts
 *
 * The `db` singleton is mocked so these tests run without a real database.
 */

import {
  getActiveDesigns,
  getDesignCount,
  getDesignCategories,
} from "@/server/queries/designs";

// ─── Mock the db singleton ────────────────────────────────────────────────────

jest.mock("@/server/db", () => ({
  db: {
    designCatalogItem: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Import the mocked db so we can configure return values in each test
import { db as mockDbRaw } from "@/server/db";
const mockDb = mockDbRaw as unknown as {
  designCatalogItem: {
    findMany: jest.Mock;
    count: jest.Mock;
  };
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const imageAssetFixture = {
  url: "https://cdn.example.com/designs/guns-n-roses.webp",
};

const designFixture = {
  id: "design-1",
  slug: "guns-n-roses",
  name: "Guns N' Roses",
  category: "música",
  imageAsset: imageAssetFixture,
  createdAt: new Date("2024-03-10T12:00:00Z"),
  active: true,
};

const designFixture2 = {
  id: "design-2",
  slug: "mafalda",
  name: "Mafalda",
  category: "caricaturas",
  imageAsset: null,
  createdAt: new Date("2024-03-11T12:00:00Z"),
  active: true,
};

const designFixture3 = {
  id: "design-3",
  slug: "soda-stereo",
  name: "Soda Stereo",
  category: "música",
  imageAsset: { url: "https://cdn.example.com/designs/soda-stereo.webp" },
  createdAt: new Date("2024-03-12T12:00:00Z"),
  active: true,
};

// ─── getActiveDesigns ─────────────────────────────────────────────────────────

describe("getActiveDesigns", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns designs with default params (page 1, pageSize 24, newest first)", async () => {
    mockDb.designCatalogItem.findMany.mockResolvedValue([designFixture]);

    const result = await getActiveDesigns();

    expect(mockDb.designCatalogItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 24,
      })
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "design-1",
      slug: "guns-n-roses",
      name: "Guns N' Roses",
      category: "música",
      imageUrl: "https://cdn.example.com/designs/guns-n-roses.webp",
      createdAt: "2024-03-10T12:00:00.000Z",
    });
  });

  it("returns empty array when no designs exist", async () => {
    mockDb.designCatalogItem.findMany.mockResolvedValue([]);

    const result = await getActiveDesigns();

    expect(result).toEqual([]);
  });

  it("filters by name search (case-insensitive contains)", async () => {
    mockDb.designCatalogItem.findMany.mockResolvedValue([designFixture]);

    await getActiveDesigns({ search: "guns" });

    expect(mockDb.designCatalogItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          active: true,
          name: { contains: "guns", mode: "insensitive" },
        },
      })
    );
  });

  it("filters by category", async () => {
    mockDb.designCatalogItem.findMany.mockResolvedValue([
      designFixture,
      designFixture3,
    ]);

    await getActiveDesigns({ category: "música" });

    expect(mockDb.designCatalogItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true, category: "música" },
      })
    );
  });

  it("filters by both search and category", async () => {
    mockDb.designCatalogItem.findMany.mockResolvedValue([designFixture]);

    await getActiveDesigns({ search: "guns", category: "música" });

    expect(mockDb.designCatalogItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          active: true,
          name: { contains: "guns", mode: "insensitive" },
          category: "música",
        },
      })
    );
  });

  it("applies pagination: page 2 with pageSize 10 skips 10 items", async () => {
    mockDb.designCatalogItem.findMany.mockResolvedValue([]);

    await getActiveDesigns({ page: 2, pageSize: 10 });

    expect(mockDb.designCatalogItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it("applies pagination: page 3 with pageSize 100 skips 200 items", async () => {
    mockDb.designCatalogItem.findMany.mockResolvedValue([]);

    await getActiveDesigns({ page: 3, pageSize: 100 });

    expect(mockDb.designCatalogItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 200, take: 100 })
    );
  });

  it("sets imageUrl to null when design has no imageAsset", async () => {
    mockDb.designCatalogItem.findMany.mockResolvedValue([designFixture2]);

    const result = await getActiveDesigns();

    expect(result[0].imageUrl).toBeNull();
  });

  it("serializes createdAt as ISO string", async () => {
    mockDb.designCatalogItem.findMany.mockResolvedValue([designFixture]);

    const result = await getActiveDesigns();

    expect(result[0].createdAt).toBe("2024-03-10T12:00:00.000Z");
  });
});

// ─── getDesignCount ───────────────────────────────────────────────────────────

describe("getDesignCount", () => {
  beforeEach(() => jest.clearAllMocks());

  it("counts all active designs when no filters provided", async () => {
    mockDb.designCatalogItem.count.mockResolvedValue(42);

    const result = await getDesignCount({});

    expect(mockDb.designCatalogItem.count).toHaveBeenCalledWith({
      where: { active: true },
    });
    expect(result).toBe(42);
  });

  it("filters by search when provided", async () => {
    mockDb.designCatalogItem.count.mockResolvedValue(3);

    const result = await getDesignCount({ search: "soda" });

    expect(mockDb.designCatalogItem.count).toHaveBeenCalledWith({
      where: {
        active: true,
        name: { contains: "soda", mode: "insensitive" },
      },
    });
    expect(result).toBe(3);
  });

  it("filters by category when provided", async () => {
    mockDb.designCatalogItem.count.mockResolvedValue(10);

    const result = await getDesignCount({ category: "caricaturas" });

    expect(mockDb.designCatalogItem.count).toHaveBeenCalledWith({
      where: { active: true, category: "caricaturas" },
    });
    expect(result).toBe(10);
  });

  it("filters by both search and category", async () => {
    mockDb.designCatalogItem.count.mockResolvedValue(1);

    const result = await getDesignCount({
      search: "mafalda",
      category: "caricaturas",
    });

    expect(mockDb.designCatalogItem.count).toHaveBeenCalledWith({
      where: {
        active: true,
        name: { contains: "mafalda", mode: "insensitive" },
        category: "caricaturas",
      },
    });
    expect(result).toBe(1);
  });

  it("returns 0 when no designs match", async () => {
    mockDb.designCatalogItem.count.mockResolvedValue(0);

    const result = await getDesignCount({ category: "nonexistent" });

    expect(result).toBe(0);
  });
});

// ─── getDesignCategories ──────────────────────────────────────────────────────

describe("getDesignCategories", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns distinct categories from active designs sorted alphabetically", async () => {
    mockDb.designCatalogItem.findMany.mockResolvedValue([
      { category: "caricaturas" },
      { category: "cultura pop" },
      { category: "música" },
    ]);

    const result = await getDesignCategories();

    expect(mockDb.designCatalogItem.findMany).toHaveBeenCalledWith({
      where: { active: true },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    expect(result).toEqual(["caricaturas", "cultura pop", "música"]);
  });

  it("returns empty array when no active designs exist", async () => {
    mockDb.designCatalogItem.findMany.mockResolvedValue([]);

    const result = await getDesignCategories();

    expect(result).toEqual([]);
  });

  it("returns a single category when all designs share the same category", async () => {
    mockDb.designCatalogItem.findMany.mockResolvedValue([
      { category: "música" },
    ]);

    const result = await getDesignCategories();

    expect(result).toEqual(["música"]);
  });
});
