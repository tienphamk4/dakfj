## 1. Types & Interfaces

- [x] 1.1 Update `CartItem` in `src/types/cart.types.ts` — add `id: string` at root level and extend `productDetail` to include `colorName`, `sizeName`, `productName`, `quantity` (stock) matching the GET /cart response shape
- [x] 1.2 Update `OrderRequest` in `src/types/order.types.ts` — replace existing interface with `{ productDetail: {id:string;quantity:number}[]; note: string; paymentMethod: 'COD'|'Online'; voucherCode?: string|null; address: string }` (remove `total` field)
- [x] 1.3 Add `VoucherCheckResponse` interface to `src/types/order.types.ts` — fields: `ma`, `ten`, `loaiGiam`, `giaTriGiam`, `discountAmount`, `subTotal`, `totalAfterDiscount`
- [x] 1.4 Update `OrderResponse` in `src/types/order.types.ts` — add `shippingFee`, `subTotal`, `discount`, `voucherCode` fields matching the API response from cart_flow.md

## 2. Services

- [x] 2.1 Add `updateCartItem(cartDetailId: string, quantity: number)` to `src/services/cart.service.ts` — calls `PUT /cart/{cartDetailId}?quantity={quantity}`
- [x] 2.2 Add `clearCart()` to `src/services/cart.service.ts` — calls `DELETE /cart/clear`
- [x] 2.3 Add `checkVoucher(code: string, subTotal: number)` to `src/services/order.service.ts` — calls `GET /api/order/check-voucher?code=X&subTotal=Y` (no auth header needed, public endpoint)
- [x] 2.4 Update `placeOrder` in `src/services/order.service.ts` — accept updated `OrderRequest` type (with `voucherCode`, `address`; no `total`)

## 3. Cart Page — Rewrite `src/pages/cart-page.tsx`

- [x] 3.1 Replace current cart display with an Ant Design `Table` component using `rowSelection` prop for checkbox selection; track `selectedIds: string[]` with `useState`
- [x] 3.2 Add select-all behavior — `rowSelection.onChange` updates `selectedIds`; header checkbox auto-checks/unchecks when all/none selected
- [x] 3.3 Add quantity controls — render `InputNumber min={1}` per row; on `onChange` call `updateCartItem` via `useMutation`, invalidate `['cart']` on success; show `message.error` on 400 stock error
- [x] 3.4 Disable "−" decrement when quantity is 1 (enforced via `InputNumber min={1}`)
- [x] 3.5 Update remove-item button — keep existing `removeFromCart` call, wrap in `Popconfirm`
- [x] 3.6 Add "Xóa tất cả" (Clear Cart) button — wrap in `Popconfirm`; on confirm call `clearCart` via `useMutation`; reset `selectedIds` to `[]` and invalidate `['cart']` on success
- [x] 3.7 Add footer row showing computed subtotal for selected items (`Σ item.productDetail.salePrice * item.quantity` for checked rows)
- [x] 3.8 Update "Đặt hàng" button — disable when `selectedIds.length === 0`; on click navigate to `/order/confirm` via `useNavigate` with `{ state: { selectedIds } }`

## 4. Pre-Order Confirm Page — Rewrite `src/pages/order-confirm-page.tsx`

- [x] 4.1 Read `selectedIds` from `useLocation().state`; if missing or empty, redirect to `/cart`
- [x] 4.2 Fetch cart via `useQuery(['cart'], getCart)` and filter to only selected items
- [x] 4.3 Render read-only item list table — columns: image (50×50), product name, quantity, unit price, line total
- [x] 4.4 Compute `subTotal = Σ (item.productDetail.salePrice * item.quantity)` for selected items
- [x] 4.5 Add Ant Design `Form` with: address `Input` (required, rule "Vui lòng nhập địa chỉ"), note `Input.TextArea` (optional)
- [x] 4.6 Add voucher section — `Input.Search` with `enterButton="Áp dụng"`; on search call `checkVoucher(code, subTotal)`; store result in `voucherResult` state; show `message.success` or `message.error` per response
- [x] 4.7 Add payment method selector — `Radio.Group` with options: `COD` (label "Thanh toán khi nhận hàng"), `Online` (label "Thanh toán qua VNPAY"); default to `COD`
- [x] 4.8 Add price breakdown `Descriptions` (bordered) — rows: Tổng tiền hàng (`subTotal`), Giảm giá (`voucherResult?.discountAmount ?? 0`), Phí vận chuyển (30.000), **Tổng thanh toán** (`subTotal - discount + 30000`); format all numbers as VNĐ currency
- [x] 4.9 Add "Xác nhận đặt hàng" submit button — calls `placeOrder` via `useMutation` with full payload including `voucherCode`, `address`, `note`, `paymentMethod`, and `productDetail` array built from selected items
- [x] 4.10 On COD success (`201`) — navigate to `/order/result` with `{ state: { order: res.data.data, paymentMethod: 'COD' } }`
- [x] 4.11 On Online success (`200`) — `window.location.href = res.data.data.paymentUrl`
- [x] 4.12 On error — show `message.error` with the API error message

## 5. Order Result Page — Update `src/pages/order-result-page.tsx`

- [x] 5.1 Add COD success path — read `location.state?.order` (OrderResponse) and `location.state?.paymentMethod`; if `paymentMethod === 'COD'` and order exists, show Ant Design `Result status="success"` with order code and total
- [x] 5.2 Keep VNPAY path — read `vnp_ResponseCode` from URL search params; show `Result status="success"` for `"00"`, `Result status="error"` otherwise
- [x] 5.3 Add "Về trang chủ" button on both result screens that navigates to `/`

## 6. Routes & Verification

- [x] 6.1 Verify `/cart` route in `src/routes/index.tsx` renders `CartPage` inside the authenticated `PrivateRoute`
- [x] 6.2 Verify `/order/confirm` route renders `OrderConfirmPage` inside `PrivateRoute`
- [x] 6.3 Verify `/order/result` route renders `OrderResultPage` as a public route (accessible after VNPAY redirect without re-auth)

