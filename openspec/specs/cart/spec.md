## ADDED Requirements

### Requirement: Authenticated user can view their cart
The system SHALL fetch cart items from `GET /cart` (requires `Authorization: Bearer`) using React Query `useQuery`, and display each item with product image, name, quantity, unit price, and line total.

#### Scenario: Cart displays items with totals
- **WHEN** authenticated user visits `/cart`
- **THEN** a list of cart items is shown with `quantity`, `totalPrice` per item, and an overall grand total

#### Scenario: Empty cart shows empty state
- **WHEN** cart has no items
- **THEN** an Ant Design `Empty` component is displayed with a link to the homepage

### Requirement: User can add an item to cart from the homepage
The system SHALL call `GET /add-product-to-cart/{productDetailId}` with the user's access token. Each call adds one unit (quantity = 1). React Query cache for the cart (`/cart` query key) SHALL be invalidated after a successful add.

#### Scenario: Cart item count updates after adding
- **WHEN** user successfully adds a product
- **THEN** the cart query is refetched and the cart icon/badge reflects the new item count

### Requirement: Cart page provides checkout entry point
The cart page SHALL display a "Thanh toán" (Checkout) button that navigates to the order confirmation page `/order/confirm`, passing selected cart items.

#### Scenario: Checkout button navigates to order page
- **WHEN** user clicks "Thanh toán" with items in cart
- **THEN** user is navigated to `/order/confirm`

## MODIFIED Requirements

### Requirement: Cart page response unwrap is consistent
Cart page queryFn SHALL unwrap `AxiosResponse` via `.then(r => r.data)` and component SHALL access `data?.data ?? []` for the CartItem array.

#### Scenario: Cart page loads items
- **WHEN** cart page mounts and useQuery fires
- **THEN** `getCart().then(r => r.data)` returns `ApiResponse<CartItem[]>`
- **THEN** component accesses `data?.data ?? []` to get the cart items array


## MODIFIED Requirements

### Requirement: Cart page response unwrap is consistent
Cart page queryFn SHALL unwrap `AxiosResponse` via `.then(r => r.data)` and component SHALL access `data?.data ?? []` for the CartItem array.

#### Scenario: Cart page loads items
- **WHEN** cart page mounts and useQuery fires
- **THEN** `getCart().then(r => r.data)` returns `ApiResponse<CartItem[]>`
- **THEN** component accesses `data?.data ?? []` to get the cart items array

