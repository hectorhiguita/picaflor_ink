# Lighthouse Notes

Automated Lighthouse requires Chrome plus the `lighthouse` CLI. The local
environment includes Chrome, but the project does not yet include Lighthouse as
a dependency.

Current production build budget check:

- `/` first-load JS: about 106 kB.
- `/productos` first-load JS: about 113 kB.
- `/personalizar/[productSlug]` first-load JS: about 121 kB.
- Mockup editor is isolated to the personalization route.
- Public pages use Next image WebP configuration and lazy-loading components.

Before launch, run:

```bash
npm install --save-dev lighthouse
npm run build
npm run start
npx lighthouse http://localhost:3000/productos --preset=desktop
```

