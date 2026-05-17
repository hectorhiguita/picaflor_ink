# Imágenes Picaflor INK

Estructura sugerida para assets públicos del ecommerce:

- `brand/`: logos, isotipo, splashes y assets de identidad.
- `products/<product-slug>/mockups/`: mockups base por color/variante.
- `products/<product-slug>/gallery/`: fotos o renders de galería.
- `designs/catalog/`: diseños predefinidos del catálogo.
- `uploads/.gitkeep`: placeholder; las cargas reales no deben versionarse aquí en producción.
- `social/`: imágenes cacheadas o fallback del feed social.

Los mockups SVG actuales son placeholders locales para que el personalizador funcione sin S3.
Cuando existan mockups reales, reemplaza estos archivos manteniendo nombres estables.

