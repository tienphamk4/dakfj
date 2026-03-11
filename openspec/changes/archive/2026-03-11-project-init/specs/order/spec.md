## ADDED Requirements

### Requirement: User can place a COD order
The system SHALL submit `POST /api/order/pay` with `paymentMethod: "COD"` and display the resulting `OrderResponse` (order code, total, items) on a success screen.

#### Scenario: Successful COD order
- **WHEN** user selects COD and submits the order
- **THEN** backend returns `OrderResponse` and user sees order confirmation with order code and total

#### Scenario: Order form requires note field (optional)
- **WHEN** user leaves note blank and submits
- **THEN** order is still placed successfully (note is optional)

### Requirement: User can initiate VNPay online payment
The system SHALL submit `POST /api/order/pay` with `paymentMethod: "VNPAY"`, receive a `VNPayResponse` containing `paymentUrl`, and redirect the user's browser to that URL.

#### Scenario: VNPay redirect happens automatically
- **WHEN** user selects VNPay and submits
- **THEN** browser is redirected to `paymentUrl` returned in the response

### Requirement: VNPay return page shows payment result
The `/order/result` page (public route) SHALL read `vnp_ResponseCode` from URL query params. If `"00"`, display success message; otherwise display failure message.

#### Scenario: Successful VNPay payment shows success screen
- **WHEN** VNPay redirects back with `vnp_ResponseCode=00`
- **THEN** user sees "Thanh toán thành công" with order details

#### Scenario: Failed VNPay payment shows failure screen
- **WHEN** VNPay redirects back with any code other than `00`
- **THEN** user sees "Thanh toán thất bại" with a retry or return-home option

### Requirement: Order request payload matches API contract exactly
The `OrderRequest` sent to `POST /api/order/pay` SHALL use the field `productDetail` (array of `{ id, quantity }`), `note`, `total`, and `paymentMethod`. The `total` value SHALL be calculated on the frontend from cart items before submission.

#### Scenario: Payload structure is correct
- **WHEN** order is submitted
- **THEN** request body matches `{ productDetail: [{id, quantity}], note, total, paymentMethod }`
