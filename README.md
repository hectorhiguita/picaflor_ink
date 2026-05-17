# Picaflor INK

Sitio web y tienda para Picaflor INK: productos personalizados con impresión DTF, catálogo público, personalizador de mockups, carrito, checkout, pagos con Wompi y panel administrativo.

La identidad visual sigue el manual de marca `Picaflor_INK_Manual_Marca (1).pdf`: paleta oficial, tipografía `Georgia` para display/logotipo, `Trebuchet MS` para cuerpo/UI y uso visual de `Picaflor INK`.

## Stack

- Next.js 15 con App Router y React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7 con PostgreSQL y `@prisma/adapter-pg`
- Fabric.js para el editor de mockups
- Zustand para estado local de carrito
- Jest para pruebas unitarias e integración
- Docker Compose para entorno local con PostgreSQL

## Inicio rápido

```bash
npm install
docker compose up -d db
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

La app queda disponible normalmente en:

```text
http://localhost:3000
```

Si el puerto está ocupado, Next.js elegirá otro puerto disponible y lo mostrará en terminal.

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores necesarios:

```bash
cp .env.example .env
```

Para desarrollo local con el `docker-compose.yml` incluido:

```env
DATABASE_URL="postgresql://picaflor:picaflor@localhost:5433/picaflor_ink?schema=public"
```

## Comandos principales

```bash
npm run dev          # servidor local Next.js
npm run build        # build de producción
npm run start        # servidor de producción
npm run type-check   # validación TypeScript
npm run test         # pruebas Jest
npm run db:generate  # genera cliente Prisma
npm run db:push      # sincroniza schema Prisma con PostgreSQL
npm run db:seed      # carga datos iniciales
```

## Docker Compose

Levantar PostgreSQL solamente:

```bash
docker compose up -d db
```

Levantar app y base de datos:

```bash
docker compose up --build
```

La app del contenedor queda en:

```text
http://localhost:3010
```

Apagar servicios:

```bash
docker compose down
```

Borrar datos locales de PostgreSQL:

```bash
docker compose down -v
```

## Documentación

- [Documentación técnica](./docs/TECHNICAL.md)
- [Componentes](./components/README.md)
- [Servidor](./server/README.md)
- [Pruebas](./tests/README.md)
- [Checklist de lanzamiento](./tests/launch-checklist.md)
- [Notas Lighthouse](./tests/performance/lighthouse-notes.md)

## Estructura general

```text
app/          Rutas App Router, API routes y páginas públicas/admin
components/   Componentes React por dominio
lib/          Utilidades, tipos, validadores y clientes externos
server/       Prisma client, auth, guardas y queries server-side
prisma/       Schema y seed inicial
public/       Assets públicos, mockups y assets de marca
styles/       Tokens globales y estilos base
tests/        Unit, integración, e2e manual y performance
docs/         Documentación técnica extendida
```

## Estado verificado

Última verificación local realizada durante la documentación:

```bash
npm run type-check
npm run test -- --runInBand
npm run build
```
