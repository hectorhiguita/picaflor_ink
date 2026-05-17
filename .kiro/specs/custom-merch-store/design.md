# Documento de Diseño — Picaflor Ink

## Overview

Picaflor Ink será una tienda ecommerce print-on-demand para productos personalizados con impresión DTF, construida con Next.js, TypeScript, PostgreSQL y despliegue en AWS. El sistema debe cubrir navegación pública, personalización visual de productos, carrito, checkout con Wompi, cuentas de cliente, panel administrativo, SEO y presencia de marca.

La primera versión se diseñará como una aplicación web full-stack con renderizado híbrido:

- Páginas públicas de catálogo, categorías y producto con SSG/ISR para SEO y rendimiento.
- Flujo de personalización y carrito como experiencia interactiva client-side.
- Checkout, pagos, órdenes y administración mediante endpoints server-side.
- Persistencia principal en PostgreSQL.
- Almacenamiento de imágenes y artefactos generados en S3 o almacenamiento compatible.

## Goals

- Vender camisetas de algodón, camisetas de tela fría y mugs personalizados en COP.
- Permitir diseños predefinidos y carga de PNG sin fondo.
- Generar previsualizaciones confiables del producto personalizado.
- Completar pagos seguros con Wompi.
- Dar al admin control sobre productos, variantes, diseños, órdenes, clientes, cupones, envío y CTA de WhatsApp.
- Reflejar la identidad visual de Picaflor Ink con dark mode vibrante, logo y acentos neón.
- Mantener buena indexación SEO y rendimiento móvil.

## Non-Goals Iniciales

- Integración automática con proveedores de producción DTF.
- Cálculo logístico avanzado por mapas o geocoding.
- Marketplace multi-vendedor.
- Editor gráfico profesional completo tipo Photoshop.
- Aplicación móvil nativa.

## Architecture

### Stack

- Framework: Next.js con App Router.
- Lenguaje: TypeScript.
- UI: React, CSS Modules/Tailwind o sistema equivalente definido al iniciar el proyecto.
- Base de datos: PostgreSQL.
- ORM recomendado: Prisma o Drizzle, con migraciones versionadas.
- Autenticación: Auth.js/NextAuth o solución compatible con email/password, Google OAuth y roles.
- Pagos: Wompi API y webhooks.
- Email: Amazon SES, Resend o proveedor SMTP transaccional.
- Storage: AWS S3 para imágenes de productos, diseños, mockups base y previews finales.
- CDN: CloudFront o CDN del proveedor de hosting.
- Observabilidad: logs estructurados server-side y tracking básico de errores.

### High-Level Components

- Public Storefront: home, galería, categorías, detalle de producto, personalizador, carrito y checkout.
- Mockup Generator: editor interactivo para capas de imagen/texto sobre áreas imprimibles.
- Cart Module: estado persistente de sesión y sincronización con cuenta autenticada.
- Order Module: creación de pedidos, estados, historial y correos.
- Payment Module: integración Wompi, redirección/checkout, verificación de transacciones y webhooks.
- Admin Panel: gestión de catálogo, diseños, pedidos, clientes, cupones, envío y configuración.
- SEO Module: metadata, sitemap.xml, robots.txt, OG images y datos estructurados.
- Social Feed Module: caché de publicaciones recientes o fallback administrable.
- Brand System: tokens visuales, logo, layouts, componentes y assets de marca.

## Routing

### Public Routes

- `/`: home con hero, productos destacados, diseños destacados, social feed y CTAs.
- `/productos`: galería con filtros, ordenamiento y paginación/carga incremental.
- `/productos/[slug]`: detalle de producto, variantes y entrada al personalizador.
- `/personalizar/[productSlug]`: Mockup_Generator.
- `/carrito`: resumen editable del carrito.
- `/checkout`: datos de contacto, envío, cupón y pago.
- `/checkout/confirmacion/[orderNumber]`: confirmación de compra.
- `/cuenta`: login/registro.
- `/cuenta/pedidos`: historial del cliente autenticado.
- `/categorias/[slug]`: página indexable de categoría.

### Admin Routes

- `/admin`: dashboard.
- `/admin/productos`: CRUD de productos y variantes.
- `/admin/disenos`: CRUD del Design_Catalog.
- `/admin/pedidos`: gestión y filtros de órdenes.
- `/admin/clientes`: clientes e historial.
- `/admin/cupones`: reglas de descuento.
- `/admin/envios`: tarifas fijas o por zona.
- `/admin/configuracion`: WhatsApp, redes, SEO base y ajustes globales.

### API Routes

- `GET /api/products`
- `GET /api/products/[slug]`
- `GET /api/designs`
- `POST /api/uploads/design`
- `POST /api/mockups/preview`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/[id]`
- `DELETE /api/cart/items/[id]`
- `POST /api/coupons/validate`
- `POST /api/checkout`
- `POST /api/payments/wompi/session`
- `POST /api/payments/wompi/webhook`
- `GET /api/orders/[orderNumber]`
- `PATCH /api/admin/orders/[id]/status`

## Data Model

### User

- `id`
- `email`
- `passwordHash` nullable for OAuth-only users
- `name`
- `phone`
- `role`: `CUSTOMER` | `ADMIN`
- `emailVerifiedAt`
- `createdAt`
- `updatedAt`

### CustomerProfile

- `id`
- `userId`
- `defaultAddressId`
- `marketingOptIn`

### Address

- `id`
- `userId` nullable for guest checkout snapshots
- `fullName`
- `phone`
- `email`
- `line1`
- `line2`
- `city`
- `zone`
- `notes`

### Product

- `id`
- `slug`
- `name`
- `description`
- `categoryId`
- `basePriceCop`
- `printTechnique`: default `DTF`
- `active`
- `featured`
- `createdAt`
- `updatedAt`

### ProductVariant

- `id`
- `productId`
- `colorName`
- `colorHex`
- `size`
- `sku`
- `priceOverrideCop` nullable
- `stockStatus`: `AVAILABLE` | `LIMITED` | `UNAVAILABLE`
- `mockupImageId`
- `active`

### Category

- `id`
- `slug`
- `name`
- `description`
- `sortOrder`
- `active`

### MediaAsset

- `id`
- `storageKey`
- `url`
- `mimeType`
- `width`
- `height`
- `sizeBytes`
- `altText`
- `createdAt`

### DesignCatalogItem

- `id`
- `slug`
- `name`
- `category`
- `imageAssetId`
- `active`
- `createdAt`
- `updatedAt`

### PrintableArea

- `id`
- `productId`
- `position`: `FRONT_CHEST` | `BACK` | `SLEEVE` | `MUG_FRONT`
- `x`
- `y`
- `width`
- `height`
- `rotation`
- `active`

### Cart

- `id`
- `userId` nullable
- `sessionId`
- `currency`: `COP`
- `couponId` nullable
- `createdAt`
- `updatedAt`

### CartItem

- `id`
- `cartId`
- `productId`
- `variantId`
- `quantity`
- `unitPriceCop`
- `previewAssetId`
- `customizationJson`
- `createdAt`

### Order

- `id`
- `orderNumber`
- `userId` nullable
- `customerEmail`
- `customerName`
- `customerPhone`
- `shippingAddressJson`
- `status`: `PENDING_PAYMENT` | `CONFIRMED` | `IN_PRODUCTION` | `SHIPPED` | `DELIVERED` | `CANCELED`
- `subtotalCop`
- `discountCop`
- `shippingCop` nullable
- `totalCop`
- `paymentProvider`: `WOMPI`
- `paymentReference`
- `paidAt`
- `createdAt`
- `updatedAt`

### OrderItem

- `id`
- `orderId`
- `productName`
- `variantLabel`
- `quantity`
- `unitPriceCop`
- `previewAssetId`
- `customizationJson`

### Coupon

- `id`
- `code`
- `type`: `PERCENTAGE` | `FIXED_COP`
- `value`
- `active`
- `expiresAt`
- `usageLimit`
- `usageCount`

### ShippingRate

- `id`
- `name`
- `zone`
- `priceCop` nullable
- `active`
- `sortOrder`

### SiteSetting

- `key`
- `valueJson`
- `updatedAt`

## Mockup Generator Design

El Mockup_Generator será un editor visual sobre canvas o una capa HTML/SVG exportable. Para la primera versión se recomienda Fabric.js o Konva para manejar selección, drag, resize, límites de área imprimible y exportación de preview.

### Layer Model

Cada personalización se serializa en `customizationJson`:

```json
{
  "productId": "product_id",
  "variantId": "variant_id",
  "position": "FRONT_CHEST",
  "layers": [
    {
      "type": "image",
      "source": "catalog|upload",
      "assetId": "asset_id",
      "x": 120,
      "y": 90,
      "scale": 1,
      "rotation": 0
    },
    {
      "type": "text",
      "text": "Mi texto",
      "fontFamily": "Montserrat",
      "color": "#FFD600",
      "x": 140,
      "y": 220,
      "scale": 1
    }
  ]
}
```

### Validation

- Solo aceptar PNG para cargas de cliente.
- Rechazar archivos mayores a 10 MB.
- Validar tipo MIME y extensión.
- Guardar uploads en storage privado o semipúblico con nombres no adivinables.
- Limitar capas al área imprimible.
- Exportar preview final como imagen WebP o PNG optimizada.

### UX

- Selector de producto/variante visible junto al preview.
- Controles con iconos para mover, escalar, eliminar capa, deshacer y rehacer.
- Selector de posición de impresión según producto.
- Catálogo de diseños con búsqueda y filtros.
- Upload claro para PNG sin fondo.
- Texto personalizado con mínimo 8 fuentes, selector de color y controles de tamaño.
- Botón primario para agregar al carrito solo cuando la configuración sea válida.

## Checkout And Payments

El checkout crea una intención de orden antes de redirigir o abrir el flujo Wompi. La orden inicia en `PENDING_PAYMENT`; solo pasa a `CONFIRMED` cuando Wompi confirma el pago por retorno verificado o webhook.

### Wompi Flow

1. Customer confirma carrito y datos de envío.
2. Store valida campos, cupón, envío y totales.
3. Store crea `Order` en `PENDING_PAYMENT`.
4. Store crea referencia o sesión de pago Wompi por HTTPS.
5. Customer completa pago.
6. Webhook Wompi verifica firma/evento.
7. Store actualiza `Order` a `CONFIRMED` y registra `paidAt`.
8. Store envía email de confirmación.
9. Página de confirmación muestra número de orden y resumen.

### Security

- Nunca confiar en totales enviados desde cliente.
- Recalcular precios, cupones y envío server-side.
- Verificar firmas de webhooks Wompi.
- Guardar secrets solo en variables de entorno.
- Proteger endpoints admin con role `ADMIN`.

## Admin Panel

El panel debe usar layouts densos, tablas filtrables y formularios claros. Debe evitar estética de landing page; es una herramienta operativa.

### Permissions

- `ADMIN`: acceso completo.
- `CUSTOMER`: sin acceso a `/admin`.
- Usuario no autenticado: redirección a login.

### Core Screens

- Dashboard: ventas del período, órdenes por estado, productos más vendidos.
- Productos: tabla, crear/editar, variantes, mockups base y áreas imprimibles.
- Diseños: tabla, carga PNG, categoría, activar/desactivar.
- Pedidos: filtros por estado, detalle, cambio de estado y notificación.
- Clientes: datos de contacto e historial.
- Cupones: porcentaje o valor fijo, expiración y límite.
- Envíos: tarifas fijas o por zona; precio nullable para “Por confirmar”.
- Configuración: WhatsApp, mensaje CTA, redes sociales y SEO base.

## Brand And UI System

### Tokens

- Background primary: `#050505`
- Surface: `#111111`
- Surface elevated: `#181818`
- Text primary: `#FFFFFF`
- Text secondary: `#C9C9C9`
- Magenta: `#FF0090`
- Cyan: `#00CFFF`
- Green: `#00E676`
- Yellow: `#FFD600`
- Error: `#FF4D4D`
- Border: `rgba(255,255,255,0.14)`

### Visual Rules

- Dark mode por defecto.
- Logo sobre fondo negro en header.
- Splashes de pintura como acentos controlados en hero, categorías y banners, sin afectar legibilidad.
- Componentes interactivos con estados hover/focus visibles.
- Layout responsive desde 320px hasta 2560px.
- CTA de WhatsApp flotante siempre visible sin cubrir acciones críticas.

## SEO And Performance

- Metadata única por producto y categoría.
- Sitemap dinámico con productos/categorías activos.
- `robots.txt` permite páginas públicas y bloquea `/admin`.
- Imágenes lazy-loaded y servidas en WebP cuando sea posible.
- Páginas de producto con SSG/ISR.
- Datos estructurados `Product`, `Offer` y `Organization`.
- Objetivo Lighthouse móvil: 85+ en páginas de producto.
- Evitar que el editor de mockups cargue librerías pesadas en páginas que no lo usan.

## Social Feed

El módulo de redes debe funcionar con caché. Si la API de Instagram no está disponible, se muestran los últimos posts cacheados o un bloque administrable sin errores visibles para el customer.

### Refresh

- Job programado cada 24 horas.
- Cache persistido en DB o storage.
- Fallback manual desde admin si la API no está configurada.

## Error Handling

- Errores de formulario junto al campo afectado.
- Errores de pago recuperables sin vaciar carrito.
- Errores de carga de PNG con mensaje específico.
- Errores admin con feedback claro y logs server-side.
- Páginas públicas nunca deben exponer stack traces.

## Accessibility

- Contraste AA en texto y controles.
- Navegación por teclado en formularios, menús, carrito y admin.
- Labels explícitos en inputs.
- Texto alternativo en imágenes de producto y diseños.
- Estados focus visibles.
- El editor debe ofrecer controles numéricos alternativos a drag-and-drop.

## Testing Strategy

- Unit tests: validadores, cupones, cálculos de totales, serialización de customización.
- Integration tests: APIs de productos, carrito, checkout, admin y Wompi webhook.
- E2E tests: navegación de catálogo, personalización, carrito, checkout simulado y admin.
- Visual checks: responsive, dark mode, mockup generator y páginas principales.
- Performance checks: Lighthouse o herramienta equivalente para producto y home.

## Environment Variables

- `DATABASE_URL`
- `NEXTAUTH_SECRET` o equivalente
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `WOMPI_PUBLIC_KEY`
- `WOMPI_PRIVATE_KEY`
- `WOMPI_EVENTS_SECRET`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `EMAIL_FROM`
- `EMAIL_PROVIDER_API_KEY`
- `INSTAGRAM_ACCESS_TOKEN`

## Deployment

- Ambientes: local, staging y production.
- Migraciones DB antes de despliegue production.
- Assets en S3 con CDN.
- Secrets por ambiente.
- Dominio production: `picaflorink.shop`.
- Monitoreo de errores y logs de webhooks.

## Traceability

- Requisito 1: Public Storefront, Product/Variant/Category, SEO.
- Requisito 2: DesignCatalogItem, Admin Diseños, Mockup Generator.
- Requisito 3: Mockup Generator, Layer Model, Validation.
- Requisito 4: Cart, CartItem, session persistence.
- Requisito 5: Checkout, Order, Payment Module, Wompi Flow.
- Requisito 6: User, CustomerProfile, auth routes, order history.
- Requisito 7: SiteSetting, WhatsApp CTA.
- Requisito 8: Admin Panel and permissions.
- Requisito 9: Brand and UI System.
- Requisito 10: SEO and Performance.
- Requisito 11: Social Feed.
- Requisito 12: ShippingRate and checkout shipping calculation.
