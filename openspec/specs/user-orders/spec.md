### Requirement: User can view their order history

Authenticated user navigates to `/orders`. The page calls `GET /api/user/orders` and displays a list of the user's past orders.

#### Scenario: Order list loads successfully

- **WHEN** an authenticated user navigates to the order history page
- **THEN** `GET /api/user/orders` is called
- **AND** a list/table of orders is rendered with: order id, total, status, created date

#### Scenario: Order status displays as label

- **WHEN** an order has a numeric status
- **THEN** it is displayed as a human-readable label:
  - 0 → "Chờ xử lý"
  - 1 → "Đã thanh toán"
  - 2 → "Đang giao"
  - 3 → "Hoàn thành"
  - -1 → "Đã hủy"

#### Scenario: Empty order history

- **WHEN** the user has no orders
- **THEN** an empty-state message is shown: "Bạn chưa có đơn hàng nào"

---

### Requirement: User can view a single order's detail

User clicks on an order in the list. The page calls `GET /api/user/orders/{id}` and displays full order details.

#### Scenario: Order detail loads successfully

- **WHEN** user clicks on an order row
- **THEN** `GET /api/user/orders/{id}` is called
- **AND** the detail view displays: items, quantities, prices, shippingFee, total, status, type (1=in-store, 2=delivery)

#### Scenario: Access denied for another user's order

- **WHEN** a user attempts to access an order that does not belong to them
- **THEN** the API returns 403
- **AND** the page shows an error: "Bạn không có quyền xem đơn hàng này"
