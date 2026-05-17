/**
 * Picaflor INK — Seed
 *
 * Crea categorías de productos, productos con variantes y áreas imprimibles,
 * además de un catálogo de diseños organizado por subcategorías.
 *
 * Uso: npx prisma db seed
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://picaflor:picaflor@localhost:5433/picaflor_ink?schema=public",
});
const prisma = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Color configs ────────────────────────────────────────────────────────────

const SHIRT_COLORS = [
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Negro", hex: "#1A1A1A" },
  { name: "Gris", hex: "#808080" },
  { name: "Azul Marino", hex: "#1A237E" },
];

const SHIRT_SIZES = ["S", "M", "L", "XL", "XXL"];

// ─── Design catalog data ──────────────────────────────────────────────────────

const DESIGN_CATALOG: Array<{ name: string; category: string; slug: string }> = [
  // ── Anime ──
  { name: "Akira Explosion", category: "Anime", slug: "akira-explosion" },
  { name: "Cosmic Eye", category: "Anime", slug: "cosmic-eye" },
  { name: "Dragon Spirit", category: "Anime", slug: "dragon-spirit" },
  { name: "Samurai Code", category: "Anime", slug: "samurai-code" },
  { name: "Neo Tokyo", category: "Anime", slug: "neo-tokyo" },
  { name: "Sakura Rain", category: "Anime", slug: "sakura-rain" },
  // ── Programación ──
  { name: "Hello World", category: "Programación", slug: "hello-world" },
  { name: "Binary Code", category: "Programación", slug: "binary-code" },
  { name: "Debug Mode", category: "Programación", slug: "debug-mode" },
  { name: "404 Not Found", category: "Programación", slug: "404-not-found" },
  { name: "Git Push Master", category: "Programación", slug: "git-push-master" },
  { name: "Stack Overflow", category: "Programación", slug: "stack-overflow" },
  // ── Bandas de Rock ──
  { name: "Electric Thunder", category: "Bandas de Rock", slug: "electric-thunder" },
  { name: "Skull Riff", category: "Bandas de Rock", slug: "skull-riff" },
  { name: "Vintage Amp", category: "Bandas de Rock", slug: "vintage-amp" },
  { name: "Rock Forever", category: "Bandas de Rock", slug: "rock-forever" },
  { name: "Distortion", category: "Bandas de Rock", slug: "distortion" },
  { name: "Metal Wings", category: "Bandas de Rock", slug: "metal-wings" },
  // ── Deportes ──
  { name: "Speed Lines", category: "Deportes", slug: "speed-lines" },
  { name: "Champion Rise", category: "Deportes", slug: "champion-rise" },
  { name: "Energy Burst", category: "Deportes", slug: "energy-burst" },
  { name: "Game On", category: "Deportes", slug: "game-on" },
  { name: "Victory Lap", category: "Deportes", slug: "victory-lap" },
  // ── Arte Abstracto ──
  { name: "Geometric Chaos", category: "Arte Abstracto", slug: "geometric-chaos" },
  { name: "Neon Flux", category: "Arte Abstracto", slug: "neon-flux" },
  { name: "Color Waves", category: "Arte Abstracto", slug: "color-waves" },
  { name: "Prisma Break", category: "Arte Abstracto", slug: "prisma-break" },
  { name: "Void Pattern", category: "Arte Abstracto", slug: "void-pattern" },
  // ── Naturaleza ──
  { name: "Tropical Bloom", category: "Naturaleza", slug: "tropical-bloom" },
  { name: "Mountain Spirit", category: "Naturaleza", slug: "mountain-spirit" },
  { name: "Ocean Wave", category: "Naturaleza", slug: "ocean-wave" },
  { name: "Jungle Beat", category: "Naturaleza", slug: "jungle-beat" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Iniciando seed de Picaflor INK…");

  // ── Categorías de productos ────────────────────────────────────────────────

  const catAlgodon = await prisma.category.upsert({
    where: { slug: "camisetas-algodon" },
    update: {},
    create: {
      slug: "camisetas-algodon",
      name: "Camisetas Algodón",
      description: "Camisetas 100% algodón personalizadas con impresión DTF.",
      sortOrder: 1,
      active: true,
    },
  });

  const catTelaFria = await prisma.category.upsert({
    where: { slug: "camisetas-tela-fria" },
    update: {},
    create: {
      slug: "camisetas-tela-fria",
      name: "Camisetas Tela Fría",
      description: "Camisetas de tela fría (poliéster) personalizadas con impresión DTF.",
      sortOrder: 2,
      active: true,
    },
  });

  const catHoodies = await prisma.category.upsert({
    where: { slug: "hoodies" },
    update: {},
    create: {
      slug: "hoodies",
      name: "Hoodies",
      description: "Hoodies de algodón personalizados con impresión DTF.",
      sortOrder: 3,
      active: true,
    },
  });

  const catJerseys = await prisma.category.upsert({
    where: { slug: "jerseys" },
    update: {},
    create: {
      slug: "jerseys",
      name: "Jerseys",
      description: "Jerseys deportivos personalizados con impresión DTF.",
      sortOrder: 4,
      active: true,
    },
  });

  const catMugs = await prisma.category.upsert({
    where: { slug: "mugs" },
    update: {},
    create: {
      slug: "mugs",
      name: "Mugs",
      description: "Mugs personalizados con impresión DTF.",
      sortOrder: 5,
      active: true,
    },
  });

  console.log("✅ Categorías de productos creadas.");

  // ── Producto: Camiseta de Algodón ──────────────────────────────────────────

  const prodAlgodon = await prisma.product.upsert({
    where: { slug: "camiseta-de-algodon" },
    update: {},
    create: {
      slug: "camiseta-de-algodon",
      name: "Camiseta de Algodón",
      description: "Camiseta 100% algodón de alta calidad, ideal para personalizar con tu diseño favorito usando impresión DTF.",
      categoryId: catAlgodon.id,
      basePriceCop: 40000,
      printTechnique: "DTF",
      active: true,
      featured: true,
    },
  });

  for (const color of SHIRT_COLORS) {
    for (const size of SHIRT_SIZES) {
      const sku = `ALG-${slugify(color.name)}-${size}`.toUpperCase();
      await prisma.productVariant.upsert({
        where: { sku },
        update: {},
        create: { productId: prodAlgodon.id, colorName: color.name, colorHex: color.hex, size, sku, stockStatus: "AVAILABLE", active: true },
      });
    }
  }

  await prisma.printableArea.upsert({
    where: { id: "pa-algodon-front" },
    update: {},
    create: { id: "pa-algodon-front", productId: prodAlgodon.id, position: "FRONT_CHEST", x: 120, y: 110, width: 260, height: 300, rotation: 0, active: true },
  });

  await prisma.printableArea.upsert({
    where: { id: "pa-algodon-back" },
    update: {},
    create: { id: "pa-algodon-back", productId: prodAlgodon.id, position: "BACK", x: 120, y: 110, width: 260, height: 300, rotation: 0, active: true },
  });

  console.log(`✅ "${prodAlgodon.name}" creada con ${SHIRT_COLORS.length * SHIRT_SIZES.length} variantes.`);

  // ── Producto: Camiseta de Tela Fría ────────────────────────────────────────

  const prodTelaFria = await prisma.product.upsert({
    where: { slug: "camiseta-de-tela-fria" },
    update: {},
    create: {
      slug: "camiseta-de-tela-fria",
      name: "Camiseta de Tela Fría",
      description: "Camiseta de tela fría (poliéster) ligera y transpirable, perfecta para personalizar con impresión DTF.",
      categoryId: catTelaFria.id,
      basePriceCop: 45000,
      printTechnique: "DTF",
      active: true,
      featured: true,
    },
  });

  for (const color of SHIRT_COLORS) {
    for (const size of SHIRT_SIZES) {
      const sku = `TF-${slugify(color.name)}-${size}`.toUpperCase();
      await prisma.productVariant.upsert({
        where: { sku },
        update: {},
        create: { productId: prodTelaFria.id, colorName: color.name, colorHex: color.hex, size, sku, stockStatus: "AVAILABLE", active: true },
      });
    }
  }

  await prisma.printableArea.upsert({
    where: { id: "pa-telafria-front" },
    update: {},
    create: { id: "pa-telafria-front", productId: prodTelaFria.id, position: "FRONT_CHEST", x: 125, y: 114, width: 254, height: 290, rotation: 0, active: true },
  });

  await prisma.printableArea.upsert({
    where: { id: "pa-telafria-back" },
    update: {},
    create: { id: "pa-telafria-back", productId: prodTelaFria.id, position: "BACK", x: 125, y: 114, width: 254, height: 290, rotation: 0, active: true },
  });

  console.log(`✅ "${prodTelaFria.name}" creada con ${SHIRT_COLORS.length * SHIRT_SIZES.length} variantes.`);

  // ── Producto: Hoodie ────────────────────────────────────────────────────────

  const prodHoodie = await prisma.product.upsert({
    where: { slug: "hoodie" },
    update: {},
    create: {
      slug: "hoodie",
      name: "Hoodie",
      description: "Hoodie de algodón con capucha y bolsillo canguro, ideal para personalizar con impresión DTF.",
      categoryId: catHoodies.id,
      basePriceCop: 75000,
      printTechnique: "DTF",
      active: true,
      featured: true,
    },
  });

  for (const color of SHIRT_COLORS) {
    for (const size of SHIRT_SIZES) {
      const sku = `HOO-${slugify(color.name)}-${size}`.toUpperCase();
      await prisma.productVariant.upsert({
        where: { sku },
        update: {},
        create: { productId: prodHoodie.id, colorName: color.name, colorHex: color.hex, size, sku, stockStatus: "AVAILABLE", active: true },
      });
    }
  }

  await prisma.printableArea.upsert({
    where: { id: "pa-hoodie-front" },
    update: {},
    create: { id: "pa-hoodie-front", productId: prodHoodie.id, position: "FRONT_CHEST", x: 198, y: 192, width: 204, height: 170, rotation: 0, active: true },
  });

  console.log(`✅ "${prodHoodie.name}" creado con ${SHIRT_COLORS.length * SHIRT_SIZES.length} variantes.`);

  // ── Producto: Jersey Deportivo ─────────────────────────────────────────────

  const prodJersey = await prisma.product.upsert({
    where: { slug: "jersey" },
    update: {},
    create: {
      slug: "jersey",
      name: "Jersey Deportivo",
      description: "Jersey deportivo de tela técnica con cuello en V, perfecto para personalizar con impresión DTF.",
      categoryId: catJerseys.id,
      basePriceCop: 55000,
      printTechnique: "DTF",
      active: true,
      featured: false,
    },
  });

  for (const color of SHIRT_COLORS) {
    for (const size of SHIRT_SIZES) {
      const sku = `JRS-${slugify(color.name)}-${size}`.toUpperCase();
      await prisma.productVariant.upsert({
        where: { sku },
        update: {},
        create: { productId: prodJersey.id, colorName: color.name, colorHex: color.hex, size, sku, stockStatus: "AVAILABLE", active: true },
      });
    }
  }

  await prisma.printableArea.upsert({
    where: { id: "pa-jersey-front" },
    update: {},
    create: { id: "pa-jersey-front", productId: prodJersey.id, position: "FRONT_CHEST", x: 180, y: 150, width: 240, height: 260, rotation: 0, active: true },
  });

  console.log(`✅ "${prodJersey.name}" creado con ${SHIRT_COLORS.length * SHIRT_SIZES.length} variantes.`);

  // ── Producto: Mug Blanco 11oz ──────────────────────────────────────────────

  const prodMug = await prisma.product.upsert({
    where: { slug: "mug-blanco-11oz" },
    update: {},
    create: {
      slug: "mug-blanco-11oz",
      name: "Mug Blanco 11oz",
      description: "Mug cerámico blanco de 11oz, ideal para personalizar con tu diseño favorito usando impresión DTF.",
      categoryId: catMugs.id,
      basePriceCop: 15000,
      printTechnique: "DTF",
      active: true,
      featured: true,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: "MUG-BLANCO-ONE-SIZE" },
    update: {},
    create: { productId: prodMug.id, colorName: "Blanco", colorHex: "#FFFFFF", size: "ONE-SIZE", sku: "MUG-BLANCO-ONE-SIZE", stockStatus: "AVAILABLE", active: true },
  });

  await prisma.printableArea.upsert({
    where: { id: "pa-mug-front" },
    update: {},
    create: { id: "pa-mug-front", productId: prodMug.id, position: "MUG_FRONT", x: 60, y: 40, width: 200, height: 150, rotation: 0, active: true },
  });

  console.log(`✅ "${prodMug.name}" creado.`);

  // ── Catálogo de diseños ────────────────────────────────────────────────────

  console.log("🎨 Creando catálogo de diseños…");

  for (const design of DESIGN_CATALOG) {
    await prisma.designCatalogItem.upsert({
      where: { slug: design.slug },
      update: { name: design.name, category: design.category },
      create: {
        slug: design.slug,
        name: design.name,
        category: design.category,
        imageAssetId: null,
        active: true,
      },
    });
  }

  console.log(`✅ ${DESIGN_CATALOG.length} diseños del catálogo creados.`);

  // ── Site Settings ─────────────────────────────────────────────────────────

  await prisma.siteSetting.upsert({
    where: { key: "whatsapp_number" },
    update: {},
    create: { key: "whatsapp_number", valueJson: "573223684981" },
  });

  await prisma.siteSetting.upsert({
    where: { key: "whatsapp_message" },
    update: {},
    create: { key: "whatsapp_message", valueJson: "Hola Picaflor INK, tengo una consulta sobre un producto." },
  });

  console.log("✅ Site settings configurados.");
  console.log("\n🎉 Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
