## ADDED Requirements

### Requirement: Pre-order review page shows full order details before submission
The system SHALL present a `/order/confirm` page that reads `selectedIds` from React Router `location.state`, fetches the cart via `GET /cart` (or uses cached data), and displays only the selected items. The page SHALL include: a read-only item list with images, names, quantities, and prices; an address input (required); a note input (optional); a voucher code field with an "Áp dụng" button; a payment method selector (`Radio.Group` with COD and Online); and a price breakdown table (Tổng tiền hàng, Giảm giá, Phí vận chuyển 30.000đ, **Tổng thanh toán**).

#### Scenario: Confirm page opens with selected items
- **WHEN** user navigates to `/order/confirm` with `location.state.selectedIds = [id1, id2]`
- **THEN** only cart items whose `id` is in `selectedIds` are displayed
- **THEN** `subTotal` is computed as `Σ (item.productDetail.salePrice * item.quantity)` for selected items

#### Scenario: Confirm page redirects if no selection
- **WHEN** user lands on `/order/confirm` with no `location.state` or empty `selectedIds`
- **THEN** the page redirects to `/cart`

#### Scenario: Price breakdown displays correct totals
- **WHEN** items are shown and no voucher applied
- **THEN** Giảm giá = 0, Phí vận chuyển = 30.000, Tổng thanh toán = subTotal + 30.000

#### Scenario: Price breakdown updates after voucher applied
- **WHEN** voucher is applied successfully with `discountAmount = D`
- **THEN** Giảm giá = D, Tổng thanh toán = subTotal − D + 30.000

### Requirement: User can validate and apply a voucher code
The system SHALL call `GET /api/order/check-voucher?code=X&subTotal=Y` (Public — no auth required) when user clicks "Áp dụng". On success it SHALL store `VoucherCheckResponse` in local state and update the price breakdown. On failure it SHALL display the error message from the API response as an Ant Design `message.error` toast.

#### Scenario: Valid voucher applied
- **WHEN** user enters a valid voucher code and the current subTotal meets minimum requirement
- **THEN** `GET /api/order/check-voucher?code=X&subTotal=Y` returns 200
- **THEN** `discountAmount` from the response is reflected in the price breakdown
- **THEN** a success toast "Áp dụng mã giảm giá thành công" is shown

#### Scenario: Invalid or expired voucher
- **WHEN** the API returns 400 with an error message
- **THEN** an `message.error` toast shows the API message (e.g., "Ma giam gia da het han")
- **THEN** no discount is applied

#### Scenario: Voucher removed
- **WHEN** user clears the voucher input field and clicks "Áp dụng" with empty input
- **THEN** discount is reset to 0 and price breakdown reflects no discount

## MODIFIED Requirements

### Requirement: User can place a COD order
The system SHALL submit `POST /api/order/pay` with `paymentMethod: "COD"`, `address` (required), optional `voucherCode`, and the `productDetail` array containing only the selected items. On `201` response FE SHALL navigate to `/order/result` passing `OrderResponse` via router state, where an Ant Design `Result` with `status="success"` displays the order code and total.

#### Scenario: Successful COD order
- **WHEN** user selects COD, fills in address, and submits
- **THEN** `POST /api/order/pay` is called with `paymentMethod: "COD"`
- **THEN** on `201` user is navigated to `/order/result` and sees Ant Design `Result status="success"` with order code

#### Scenario: Order form requires address
- **WHEN** user tries to submit without an address
- **THEN** Ant Design Form validation shows "Vui lòng nhập địa chỉ" and the form is not submitted

#### Scenario: Order form note field is optional
- **WHEN** user leaves note blank and submits
- **THEN** order is still placed successfully (`note` sent as empty string or omitted)

### Requirement: User can initiate VNPay online payment
The system SHALL submit `POST /api/order/pay` with `paymentMethod: "Online"` (not "VNPAY"), receive a `VNPayResponse` containing `paymentUrl`, and redirect the user's browser to that URL via `window.location.href = paymentUrl`.

#### Scenario: VNPay redirect happens automatically
- **WHEN** user selects "Online" payment and submits
- **THEN** `POST /api/order/pay` is called with `paymentMethod: "Online"`
- **THEN** on success `window.location.href` is set to `res.data.data.paymentUrl`

### Requirement: Order request payload includes voucher and address
The `OrderRequest` sent to `POST /api/order/pay` SHALL match the updated contract:
```ts
interface OrderRequest {
  productDetail: { id: string; quantity: number }[];
  note: string;
  paymentMethod: 'COD' | 'Online';
  voucherCode?: string | null;
  address: string;
}
```
The FE SHALL NOT send a `total` field; the backend computes the authoritative total.

#### Scenario: Payload includes voucherCode when applied
- **WHEN** user has applied a valid voucher before submitting
- **THEN** request body contains `voucherCode: "CODE"`

#### Scenario: Payload omits voucherCode when not applied
- **WHEN** no voucher is applied
- **THEN** `voucherCode` is `null` or omitted from the request body

#### Scenario: Payload uses productDetail ids from selected items only
- **WHEN** user selected 2 of 3 cart items
- **THEN** `productDetail` array contains exactly 2 entries matching `{ id: productDetail.id, quantity }` for each selected item
