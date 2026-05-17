# E2E Critical Flows

These are the browser flows that must be executed before release. They are kept
as a runnable checklist until Playwright is added to the project dependencies.

## Storefront Checkout

- Open `/productos`.
- Select a product.
- Open personalization.
- Choose a variant.
- Add either a catalog design or a PNG layer.
- Add the customized product to cart.
- Open `/carrito`.
- Continue to `/checkout`.
- Fill customer and delivery fields.
- Submit payment.
- Confirm the order confirmation page renders an order number and totals.

## Account

- Open `/cuenta`.
- Register with email and password.
- Confirm duplicate email shows a clear error.
- Log out.
- Log in again.
- Open `/cuenta/pedidos`.

## Admin

- Log in as an admin user.
- Open `/admin`.
- Confirm dashboard metrics render.
- Create or edit a product through admin API/UI.
- Create or edit a design through admin API/UI.
- Update an order status and confirm the notification path is triggered.

