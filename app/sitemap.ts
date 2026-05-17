import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getActiveProducts, getCategories } from "@/server/queries/products";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getActiveProducts({ pageSize: 200 }),
    getCategories(),
  ]);

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/productos`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categories.map((category) => ({
      url: `${SITE_URL}/categorias/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/productos/${product.slug}`,
      lastModified: product.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
