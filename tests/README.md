# tests/

Test suite for Picaflor INK. Organized by type:

- `unit/` — Unit tests for utilities, validators and business logic
- `integration/` — API route and database integration tests
- `e2e/` — Manual critical-flow checklist for browser validation
- `performance/` — Lighthouse notes and performance checklist

Run tests:

```bash
npm test
npm run test -- --runInBand
npm run type-check
npm run build
```
