## MODIFIED Requirements

### Requirement: Order confirm page unwraps ApiResponse correctly
Order confirm page SHALL access the actual payload via `res.data.data` instead of casting `res.data as unknown as T`.

#### Scenario: COD order success
- **WHEN** `placeOrder` returns successfully with paymentMethod COD
- **THEN** page accesses `res.data.data` to get `OrderResponse` (not `res.data as unknown as OrderResponse`)
- **THEN** displays `order.code` in success message

#### Scenario: VNPAY order success
- **WHEN** `placeOrder` returns successfully with paymentMethod VNPAY
- **THEN** page accesses `res.data.data` to get `VNPayResponse` (not `res.data as unknown as VNPayResponse`)
- **THEN** redirects to `vnpay.paymentUrl`
