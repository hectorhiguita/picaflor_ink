const { Client } = require("pg");

const SHIRT_COLORS = [
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Negro", hex: "#000000" },
  { name: "Gris", hex: "#9E9E9E" },
  { name: "Azul Marino", hex: "#1A237E" },
];

const SHIRT_SIZES = ["S", "M", "L", "XL", "XXL"];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function upsertCategory(client, category) {
  await client.query(
    `
      INSERT INTO "Category" ("id", "slug", "name", "description", "sortOrder", "active")
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT ("slug") DO UPDATE SET
        "name" = EXCLUDED."name",
        "description" = EXCLUDED."description",
        "sortOrder" = EXCLUDED."sortOrder",
        "active" = true
    `,
    [
      category.id,
      category.slug,
      category.name,
      category.description,
      category.sortOrder,
    ]
  );
}

async function upsertProduct(client, product) {
  await client.query(
    `
      INSERT INTO "Product" (
        "id", "slug", "name", "description", "categoryId", "basePriceCop",
        "printTechnique", "active", "featured", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'DTF', true, true, NOW(), NOW())
      ON CONFLICT ("slug") DO UPDATE SET
        "name" = EXCLUDED."name",
        "description" = EXCLUDED."description",
        "categoryId" = EXCLUDED."categoryId",
        "basePriceCop" = EXCLUDED."basePriceCop",
        "active" = true,
        "featured" = true,
        "updatedAt" = NOW()
    `,
    [
      product.id,
      product.slug,
      product.name,
      product.description,
      product.categoryId,
      product.basePriceCop,
    ]
  );
}

async function upsertVariant(client, variant) {
  await client.query(
    `
      INSERT INTO "ProductVariant" (
        "id", "productId", "colorName", "colorHex", "size", "sku", "stockStatus", "active"
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'AVAILABLE', true)
      ON CONFLICT ("sku") DO UPDATE SET
        "colorName" = EXCLUDED."colorName",
        "colorHex" = EXCLUDED."colorHex",
        "size" = EXCLUDED."size",
        "stockStatus" = 'AVAILABLE',
        "active" = true
    `,
    [
      variant.id,
      variant.productId,
      variant.colorName,
      variant.colorHex,
      variant.size,
      variant.sku,
    ]
  );
}

async function upsertPrintableArea(client, area) {
  await client.query(
    `
      INSERT INTO "PrintableArea" (
        "id", "productId", "position", "x", "y", "width", "height", "rotation", "active"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, true)
      ON CONFLICT ("id") DO UPDATE SET
        "productId" = EXCLUDED."productId",
        "position" = EXCLUDED."position",
        "x" = EXCLUDED."x",
        "y" = EXCLUDED."y",
        "width" = EXCLUDED."width",
        "height" = EXCLUDED."height",
        "active" = true
    `,
    [
      area.id,
      area.productId,
      area.position,
      area.x,
      area.y,
      area.width,
      area.height,
    ]
  );
}

async function upsertSetting(client, key, value) {
  await client.query(
    `
      INSERT INTO "SiteSetting" ("key", "valueJson", "updatedAt")
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT ("key") DO UPDATE SET
        "valueJson" = EXCLUDED."valueJson",
        "updatedAt" = NOW()
    `,
    [key, JSON.stringify(value)]
  );
}

async function main() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://picaflor:picaflor@localhost:5433/picaflor_ink?schema=public",
  });
  await client.connect();

  try {
    await client.query("BEGIN");

    const categories = [
      {
        id: "cat-camisetas-algodon",
        slug: "camisetas-algodon",
        name: "Camisetas Algodón",
        description: "Camisetas 100% algodón personalizadas con impresión DTF.",
        sortOrder: 1,
      },
      {
        id: "cat-camisetas-tela-fria",
        slug: "camisetas-tela-fria",
        name: "Camisetas Tela Fría",
        description:
          "Camisetas de tela fría (poliéster) personalizadas con impresión DTF.",
        sortOrder: 2,
      },
      {
        id: "cat-mugs",
        slug: "mugs",
        name: "Mugs",
        description: "Mugs personalizados con impresión DTF.",
        sortOrder: 3,
      },
    ];

    for (const category of categories) {
      await upsertCategory(client, category);
    }

    const products = [
      {
        id: "prod-camiseta-algodon",
        slug: "camiseta-de-algodon",
        name: "Camiseta de Algodón",
        description:
          "Camiseta 100% algodón de alta calidad, ideal para personalizar con tu diseño favorito usando impresión DTF.",
        categoryId: "cat-camisetas-algodon",
        basePriceCop: 40000,
      },
      {
        id: "prod-camiseta-tela-fria",
        slug: "camiseta-de-tela-fria",
        name: "Camiseta de Tela Fría",
        description:
          "Camiseta de tela fría ligera y transpirable, perfecta para personalizar con impresión DTF.",
        categoryId: "cat-camisetas-tela-fria",
        basePriceCop: 45000,
      },
      {
        id: "prod-mug-blanco-11oz",
        slug: "mug-blanco-11oz",
        name: "Mug Blanco 11oz",
        description:
          "Mug cerámico blanco de 11oz, ideal para personalizar con tu diseño favorito usando impresión DTF.",
        categoryId: "cat-mugs",
        basePriceCop: 15000,
      },
    ];

    for (const product of products) {
      await upsertProduct(client, product);
    }

    for (const product of products.slice(0, 2)) {
      for (const color of SHIRT_COLORS) {
        for (const size of SHIRT_SIZES) {
          const skuPrefix =
            product.id === "prod-camiseta-algodon" ? "ALG" : "TF";
          const sku = `${skuPrefix}-${slugify(color.name)}-${size}`.toUpperCase();
          await upsertVariant(client, {
            id: `var-${sku.toLowerCase()}`,
            productId: product.id,
            colorName: color.name,
            colorHex: color.hex,
            size,
            sku,
          });
        }
      }
    }

    await upsertVariant(client, {
      id: "var-mug-blanco-one-size",
      productId: "prod-mug-blanco-11oz",
      colorName: "Blanco",
      colorHex: "#FFFFFF",
      size: "ONE-SIZE",
      sku: "MUG-BLANCO-ONE-SIZE",
    });

    await upsertPrintableArea(client, {
      id: "pa-algodon-front",
      productId: "prod-camiseta-algodon",
      position: "FRONT_CHEST",
      x: 120,
      y: 100,
      width: 260,
      height: 300,
    });
    await upsertPrintableArea(client, {
      id: "pa-telafria-front",
      productId: "prod-camiseta-tela-fria",
      position: "FRONT_CHEST",
      x: 120,
      y: 100,
      width: 260,
      height: 300,
    });
    await upsertPrintableArea(client, {
      id: "pa-mug-front",
      productId: "prod-mug-blanco-11oz",
      position: "MUG_FRONT",
      x: 60,
      y: 40,
      width: 200,
      height: 150,
    });

    await upsertSetting(client, "whatsapp_number", "573223684981");
    await upsertSetting(
      client,
      "whatsapp_message",
      "Hola Picaflor INK, tengo una consulta sobre un producto."
    );

    await client.query("COMMIT");
    console.log("Seed completado exitosamente.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Error en seed:", error);
  process.exit(1);
});
