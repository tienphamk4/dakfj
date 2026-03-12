### Requirement: Employee can create an in-store order

Employee (or Admin acting as employee) accesses the POS page (`/employee/pos`). They select products, quantities, optional voucher, and create an order via `POST /api/employee/orders`. Payment method is always CASH.

#### Scenario: Create in-store order succeeds

- **WHEN** employee selects products and submits with `type: 1` (in-store)
- **THEN** `POST /api/employee/orders` is called with `paymentMethod: "CASH"` and `type: 1`
- **AND** a success notification is shown with the new order id

#### Scenario: Create delivery order succeeds

- **WHEN** employee fills in delivery address and submits with `type: 2`
- **THEN** `POST /api/employee/orders` is called with `paymentMethod: "CASH"` and `type: 2`
- **AND** shippingFee is included in the order summary

#### Scenario: Payment method is always CASH

- **WHEN** employee is on the POS page
- **THEN** the payment method field is fixed to "CASH" and cannot be changed

#### Scenario: Required product selection

- **WHEN** employee tries to submit with no products selected
- **THEN** form validation prevents submission and shows an error

---

### Requirement: Employee can list all orders

Employee navigates to `/employee/orders`. The page calls `GET /api/employee/orders` and displays all orders.

#### Scenario: Order list loads successfully

- **WHEN** employee navigates to the orders list page
- **THEN** `GET /api/employee/orders` is called
- **AND** a table is rendered with: id, total, status, type, created date

#### Scenario: Order status and type display as labels

- **WHEN** an order is displayed in the table
- **THEN** status uses the same label mapping as user orders (0/1/2/3/-1)
- **AND** type 1 shows "Tại quầy", type 2 shows "Giao hàng"

---

### Requirement: Employee can view an order's detail

Employee clicks on an order row. Calls `GET /api/employee/orders/{id}`.

#### Scenario: Detail loads successfully

- **WHEN** employee clicks on an order
- **THEN** `GET /api/employee/orders/{id}` is called
- **AND** full order details are shown: items, prices, shippingFee, status, type, paymentMethod

---

### Requirement: Employee can update an order's status

Employee clicks a status-update action on an order. Calls `PUT /api/employee/orders/{id}/status?status={n}` with the new status as a query parameter.

#### Scenario: Status update succeeds

- **WHEN** employee selects a new status and confirms
- **THEN** `PUT /api/employee/orders/{id}/status?status={n}` is called with the correct query param
- **AND** the order's displayed status updates accordingly

#### Scenario: Status transitions are constrained

- **WHEN** an order is at status 3 (done) or -1 (cancelled)
- **THEN** the update status action is disabled for that order
