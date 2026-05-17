import { formatCOP, slugify, clamp } from "@/lib/utils";

describe("formatCOP", () => {
  it("formats 40000 as Colombian peso", () => {
    expect(formatCOP(40000)).toBe("$\u00a040.000");
  });

  it("formats 0 correctly", () => {
    expect(formatCOP(0)).toBe("$\u00a00");
  });

  it("formats large amounts", () => {
    expect(formatCOP(1000000)).toBe("$\u00a01.000.000");
  });
});

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("Camiseta Algodón")).toBe("camiseta-algodon");
  });

  it("removes accents", () => {
    expect(slugify("tela fría")).toBe("tela-fria");
  });

  it("lowercases the string", () => {
    expect(slugify("PICAFLOR INK")).toBe("picaflor-ink");
  });

  it("collapses multiple spaces/hyphens", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Guns N' Roses")).toBe("guns-n-roses");
  });
});

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 1, 10)).toBe(5);
  });

  it("returns min when value is below range", () => {
    expect(clamp(0, 1, 10)).toBe(1);
  });

  it("returns max when value is above range", () => {
    expect(clamp(15, 1, 10)).toBe(10);
  });

  it("handles boundary values", () => {
    expect(clamp(1, 1, 10)).toBe(1);
    expect(clamp(10, 1, 10)).toBe(10);
  });
});
