# Documentación Técnica

## Propósito

Picaflor INK es una tienda web para productos personalizados con impresión DTF. El sistema permite explorar productos, elegir variantes, personalizar mockups con diseños/textos/archivos PNG, gestionar carrito, realizar checkout, iniciar pagos con Wompi y consultar pedidos. También incluye rutas administrativas para productos, diseños, pedidos, cupones, envíos, clientes y configuración.

## Arquitectura

La aplicación usa Next.js App Router. Las páginas públicas, panel admin y API routes viven en `app/`; la lógica de servidor se concentra en `server/`; la lógica compartida, tipos y validaciones viven en `lib/`; los componentes UI y de dominio están en `components/`.

```text
Cliente
  React components
  Zustand cart store
  Fabric.js mockup editor

Next.js App Router
  Server Components
  API routes
  Metadata/SEO

Servidor
  server/queries/*
  server/auth.ts
  server/admin-guard.ts
  server/db.ts

Datos/servicios externos
  PostgreSQL
  Prisma Client
  Wompi
  Email provider
  Instagram/Facebook links
```

## Stack Técnico

- Runtime: Node.js 22 recomendado.
- Framework: Next.js 15.
- UI: React 19, Tailwind CSS 4 y CSS custom properties.
- Tipado: TypeScript.
- ORM: Prisma 7 con `@prisma/adapter-pg`.
- Base de datos: PostgreSQL 16.
- Editor: Fabric.js.
- Estado cliente: Zustand.
- Testing: Jest, Testing Library y entorno `jsdom`.
- Contenedores: Docker y Docker Compose.

## Identidad Visual

La marca se toma de `Picaflor_INK_Manual_Marca (1).pdf`.

Tokens principales en `styles/globals.css`:

```css
--color-cyan: #00c8ff;
--color-green: #64dc14;
--color-magenta: #ff1493;
--color-yellow: #ffb300;
--color-orange: #ff4500;
--color-violet: #9400d3;
--color-turquoise: #00c896;
--color-ink: #111111;
--font-display: Georgia, "Times New Roman", serif;
--font-sans: "Trebuchet MS", "DM Sans", Calibri, ui-sans-serif, system-ui, sans-serif;
```

Reglas de uso:

- Usar `Picaflor INK` como nombre visual.
- Usar `Georgia` para logotipo, títulos display y piezas de marca.
- Usar `Trebuchet MS` para cuerpo, UI, etiquetas y fichas.
- No cambiar colores del isotipo ni distorsionar el logotipo.
- El asset principal extraído del manual está en `public/images/brand/picaflor-ink-logo-lockup.png`.

## Configuración Local

Instalar dependencias:

```bash
npm install
```

Copiar variables:

```bash
cp .env.example .env
```

Levantar PostgreSQL:

```bash
docker compose up -d db
```

Preparar Prisma:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Iniciar desarrollo:

```bash
npm run dev
```

La base local del Compose usa:

```env
DATABASE_URL="postgresql://picaflor:picaflor@localhost:5433/picaflor_ink?schema=public"
```

## Variables de Entorno

| Variable | Uso | Requerida |
| --- | --- | --- |
| `DATABASE_URL` | Conexión PostgreSQL para Prisma | Sí |
| `NEXTAUTH_SECRET` | Firma de sesiones/auth | Sí en producción |
| `NEXTAUTH_URL` | URL base auth | Sí en producción |
| `GOOGLE_CLIENT_ID` | OAuth Google | Si Google login está activo |
| `GOOGLE_CLIENT_SECRET` | OAuth Google | Si Google login está activo |
| `WOMPI_PUBLIC_KEY` | Checkout/pagos Wompi | Sí para pagos reales |
| `WOMPI_PRIVATE_KEY` | Sesiones/validación Wompi | Sí para pagos reales |
| `WOMPI_EVENTS_SECRET` | Webhook Wompi | Sí para pagos reales |
| `AWS_REGION` | Storage S3 | Si se usa S3 |
| `AWS_ACCESS_KEY_ID` | Storage S3 | Si se usa S3 |
| `AWS_SECRET_ACCESS_KEY` | Storage S3 | Si se usa S3 |
| `S3_BUCKET_NAME` | Storage S3 | Si se usa S3 |
| `EMAIL_FROM` | Remitente transaccional | Sí para email |
| `EMAIL_PROVIDER_API_KEY` | Proveedor email | Sí para email real |
| `INSTAGRAM_ACCESS_TOKEN` | Feed social | Opcional |

## Modelo de Datos

El schema principal está en `prisma/schema.prisma`.

Entidades clave:

- `User`: usuario cliente o administrador.
- `CustomerProfile`: preferencias de cliente.
- `Address`: direcciones de entrega.
- `Category`: categorías públicas del catálogo.
- `Product`: producto base.
- `ProductVariant`: variante por color/talla/SKU.
- `MediaAsset`: assets subidos o referenciados.
- `DesignCatalogItem`: diseños disponibles para personalizar.
- `PrintableArea`: zona editable del producto.
- `Cart`: carrito por sesión o usuario.
- `CartItem`: ítems del carrito con JSON de personalización.
- `Order`: pedido generado por checkout.
- `OrderItem`: snapshot de producto en pedido.
- `Coupon`: cupones de descuento.
- `ShippingRate`: tarifas por zona.
- `SiteSetting`: configuración dinámica.

Enums:

- `Role`: `CUSTOMER`, `ADMIN`
- `StockStatus`: `AVAILABLE`, `LIMITED`, `UNAVAILABLE`
- `PrintPosition`: `FRONT_CHEST`, `BACK`, `SLEEVE`, `MUG_FRONT`
- `OrderStatus`: `PENDING_PAYMENT`, `CONFIRMED`, `IN_PRODUCTION`, `SHIPPED`, `DELIVERED`, `CANCELED`
- `PaymentProvider`: `WOMPI`
- `CouponType`: `PERCENTAGE`, `FIXED_COP`

## Seed Inicial

`npm run db:seed` crea:

- Categorías: camisetas algodón, camisetas tela fría y mugs.
- Productos: camiseta de algodón, camiseta de tela fría y mug blanco 11oz.
- Variantes de camisetas por color y talla.
- Área imprimible de cada producto.
- Configuraciones iniciales del sitio.

El seed idempotente vive en `prisma/seed.cjs`; `prisma/seed.ts` queda como versión TypeScript de referencia.

## Rutas Públicas

| Ruta | Propósito |
| --- | --- |
| `/` | Inicio con hero de marca y trabajos recientes |
| `/productos` | Catálogo paginado con filtros |
| `/productos/[slug]` | Detalle de producto |
| `/categorias/[slug]` | Catálogo por categoría |
| `/personalizar/[productSlug]` | Editor de personalización |
| `/carrito` | Carrito actual |
| `/checkout` | Formulario de checkout |
| `/checkout/confirmacion/[orderNumber]` | Confirmación de pedido |
| `/cuenta` | Login/registro |
| `/cuenta/pedidos` | Pedidos del usuario |

## Rutas Admin

| Ruta | Propósito |
| --- | --- |
| `/admin` | Dashboard |
| `/admin/productos` | Gestión de productos |
| `/admin/disenos` | Gestión de diseños |
| `/admin/pedidos` | Gestión de pedidos |
| `/admin/cupones` | Gestión de cupones |
| `/admin/envios` | Tarifas de envío |
| `/admin/clientes` | Clientes |
| `/admin/configuracion` | Ajustes del sitio |

La protección admin se centraliza en `server/admin-guard.ts`.

## API Routes

Catálogo:

- `GET /api/products`
- `GET /api/products/[slug]`
- `GET /api/categories`
- `GET /api/designs`
- `GET /api/designs/categories`

Carrito y cupones:

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/[id]`
- `DELETE /api/cart/items/[id]`
- `POST /api/cart/coupon`
- `DELETE /api/cart/coupon`
- `POST /api/coupons/validate`

Envíos:

- `GET /api/shipping/rates`

Checkout y pagos:

- `POST /api/checkout`
- `POST /api/payments/wompi/session`
- `POST /api/payments/wompi/webhook`

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/google`

Admin:

- `POST /api/admin/products`
- `PATCH /api/admin/products/[id]`
- `DELETE /api/admin/products/[id]`
- `POST /api/admin/designs`
- `PATCH /api/admin/designs/[id]`
- `DELETE /api/admin/designs/[id]`
- `PATCH /api/admin/orders/[id]/status`
- `POST /api/admin/coupons`
- `PATCH /api/admin/coupons/[id]`
- `POST /api/admin/shipping-rates`
- `PATCH /api/admin/shipping-rates/[id]`
- `PATCH /api/admin/settings`

Uploads y mockups:

- `POST /api/uploads/design`
- `POST /api/mockups/preview`

## Flujos Principales

### Catálogo

1. La página `/productos` lee `category`, `sort` y `page`.
2. Ejecuta `getActiveProducts`, `getProductCount` y `getCategories`.
3. Renderiza filtros, grilla y paginación.
4. Si la base de datos no está disponible, se muestra un aviso amigable en vez de un error de runtime.

### Personalización

1. `/personalizar/[productSlug]` carga producto, variantes y áreas imprimibles.
2. `MockupCustomizer` coordina selección de variante, capas y acciones.
3. `MockupEditor` usa Fabric.js para canvas y preview.
4. Paneles de texto, upload y catálogo crean capas serializables.
5. La personalización se guarda como JSON en carrito/pedido.

### Carrito

1. El carrito se identifica por cookie `picaflor_session`.
2. `lib/cart-store.ts` maneja estado cliente.
3. API routes persisten `Cart` y `CartItem`.
4. Los cupones se validan y aplican con `Coupon`.

### Checkout

1. `CheckoutForm` valida datos de cliente y dirección.
2. `POST /api/checkout` crea orden.
3. `POST /api/payments/wompi/session` inicia sesión de pago.
4. `POST /api/payments/wompi/webhook` confirma cambios del proveedor.
5. La confirmación se muestra en `/checkout/confirmacion/[orderNumber]`.

## Componentes

Dominios principales:

- `components/layout`: layout público, header y footer.
- `components/ui`: primitives como `Button`, `Badge`, `WhatsAppCTA`.
- `components/catalog`: filtros, cards, galería y paginación.
- `components/product`: detalle y selector de variantes.
- `components/mockup`: editor Fabric.js y paneles de capas.
- `components/cart`: carrito, resumen, cupón e ítems.
- `components/checkout`: formulario de checkout.
- `components/designs`: selector y catálogo de diseños.
- `components/social`: feed social.
- `components/brand`: elementos visuales de marca.

Convención:

- Server Components por defecto.
- Usar `"use client"` solo para estado, eventos, hooks de navegador o Fabric.js.
- Mantener estilos consumiendo tokens CSS de `styles/globals.css`.

## Validación y Seguridad

Validaciones relevantes:

- `lib/checkout-validation.ts`: checkout.
- `lib/upload-validation.ts`: PNG y límite de 10 MB.
- `lib/customization-serialization.ts`: serialización de capas.
- `lib/wompi.ts`: helpers de Wompi.

Notas:

- Nunca importar `server/*` desde componentes cliente.
- Las rutas admin deben pasar por guardas server-side.
- Las credenciales reales solo van en `.env`, nunca en repositorio.
- El webhook de Wompi debe verificar firma/secreto antes de mutar pedidos.

## Testing

Comandos:

```bash
npm run type-check
npm run test
npm run test -- --runInBand
npm run build
```

Cobertura existente:

- Unit tests para utilidades, validadores y serialización.
- Tests de queries server-side.
- Tests de API de checkout y webhook Wompi.
- Documentos manuales para flujos críticos E2E.

Antes de publicar cambios en lógica de compra, pagos o personalización, ejecutar al menos:

```bash
npm run type-check
npm run test -- --runInBand
npm run build
```

## Build y Despliegue

Build local:

```bash
npm run build
npm run start
```

Docker:

```bash
docker compose up --build
```

El contenedor de app ejecuta:

```bash
npm run db:push && npm run db:seed && npm run start -- -H 0.0.0.0
```

Para producción:

- Configurar `DATABASE_URL` de una base PostgreSQL persistente.
- Ejecutar `npm run db:generate` durante build.
- Aplicar schema/migraciones antes de servir tráfico.
- Configurar llaves Wompi, auth, email y storage.
- Revisar `tests/launch-checklist.md`.

## Troubleshooting

### `PrismaClientKnownRequestError` en `/productos`

Causa común: PostgreSQL no está activo, el schema no fue aplicado o la URL local no coincide.

Solución:

```bash
docker compose up -d db
npm run db:push
npm run db:seed
npm run dev
```

Verificar endpoint:

```bash
curl http://localhost:3000/api/products
```

### `Schema engine error` sin detalle

En entornos con sandbox o permisos restringidos, Prisma puede no conectarse a `localhost:5433`.

Solución:

- Confirmar que Docker está activo.
- Confirmar `docker compose ps`.
- Ejecutar comandos DB con permisos para conectarse a PostgreSQL local.

### Puerto 3000 ocupado

Next.js elegirá otro puerto automáticamente. Usa el puerto mostrado en terminal.

### No aparecen productos

Ejecutar:

```bash
npm run db:seed
```

Luego abrir `/productos` y confirmar que muestra 3 productos iniciales.

### Cliente Prisma no existe

Ejecutar:

```bash
npm run db:generate
```

El cliente generado vive en `lib/generated/prisma` y está ignorado por Git.

## Convenciones de Desarrollo

- Mantener cambios de UI alineados con el manual de marca.
- Preferir tipos compartidos en `lib/types/*`.
- Mantener queries en `server/queries/*`; no consultar Prisma directamente desde componentes.
- Mantener validaciones compartidas en `lib/*-validation.ts`.
- No mezclar lógica de negocio sensible en componentes cliente.
- Usar `formatCOP` para precios en UI.
- Usar rutas API para mutaciones desde cliente.
- No modificar mockups SVG de producto salvo que cambie una variante real.

## Checklist para Cambios Relevantes

Antes de cerrar un cambio:

```bash
npm run type-check
npm run test -- --runInBand
npm run build
```

Para cambios de base de datos:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Para cambios visuales:

- Revisar home, catálogo, detalle de producto, personalizador, carrito y checkout.
- Confirmar que colores y tipografías respetan el manual.
- Confirmar que mobile no rompe navegación ni botones.
