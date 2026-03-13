## Why

BeeShop's cart and order flow is incomplete: the cart page lacks item selection (checkboxes), in-cart quantity adjustment, and a clear-all button; the checkout flow has no pre-order review page, no voucher/discount input, no address capture, and no shipping fee display. Users currently cannot complete a proper end-to-end purchase flow with promo codes or online payment via VNPAY.

## What Changes

- **Cart page**: add per-item checkbox + select-all toggle; add quantity increment/decrement controls (calls `PUT /cart/{cartDetailId}?quantity=N`); add "Clear Cart" button (calls `DELETE /cart/clear`); remove button already exists but needs to align with full selection model
- **Pre-order page** (`/order/confirm`): new full review screen showing selected cart items, editable address + note fields, voucher code input with real-time validation via `GET /api/order/check-voucher`, payment method selector (COD / VNPAY), and a price breakdown table (subTotal, discount, shipping 30,000 VNĐ, total)
- **Order placement** (`POST /api/order/pay`): extend request body to include `voucherCode` (nullable) and `address`; only submit items that are checked on the cart page
- **Payment result page** (`/order/result`): already exists for VNPAY callback; ensure COD path also lands on a success screen after `201` response

## Capabilities

### New Capabilities

<!-- None — all changes extend existing capabilities -->

### Modified Capabilities

- `cart`: Add checkbox selection (per-item + select-all), quantity update via `PUT /cart/{cartDetailId}?quantity=N`, and clear-cart via `DELETE /cart/clear`
- `order`: Add pre-order review page with address/note/voucher inputs, shipping fee line, computed totals display, and updated `POST /api/order/pay` payload (`voucherCode`, `address`)

## Impact

- **APIs added/used**:
  - `PUT /cart/{cartDetailId}?quantity=N` (Auth) — update item quantity
  - `DELETE /cart/clear` (Auth) — clear entire cart
  - `GET /api/order/check-voucher?code=X&subTotal=Y` (Public) — validate & compute discount
  - `POST /api/order/pay` (Auth) — payload extended with `voucherCode`, `address`
- **Files affected**:
  - `src/services/cart.service.ts` — add `updateCartItem`, `clearCart`
  - `src/services/order.service.ts` — extend `placeOrder` payload type
  - `src/types/cart.types.ts` — add `CartItem.id` if missing, confirm shape
  - `src/types/order.types.ts` — add `voucherCode`, `address` to `OrderRequest`; add voucher response type
  - `src/pages/cart-page.tsx` — rewrite with checkboxes, quantity controls, clear button
  - `src/pages/order-confirm-page.tsx` — rewrite as full pre-order review page
  - `src/pages/order-result-page.tsx` — ensure COD success path works
  - `src/routes/index.tsx` — verify `/order/confirm` and `/order/result` are routed correctly
- **Auth**: cart mutations require Bearer JWT; voucher check is Public
- **Backend quirk**: `paymentMethod` value for online is `"Online"` per the latest API doc (not `"VNPAY"` — confirm with BE)
