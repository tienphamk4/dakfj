## ADDED Requirements

### Requirement: Authenticated user can view their cart
The system SHALL fetch cart items from `GET /cart` (requires `Authorization: Bearer`) using React Query `useQuery` with key `['cart']`, and render an Ant Design `Table` displaying each item with a checkbox, product image, name, quantity controls (`InputNumber`), unit price, line total, and a remove button. A "select-all" checkbox in the table header SHALL toggle selection of all items. A computed subtotal for selected items SHALL appear in the cart footer above the checkout button.

#### Scenario: Cart displays items with checkboxes
- **WHEN** authenticated user visits `/cart`
- **THEN** each row has a checkbox; the table header has a select-all checkbox
- **THEN** `quantity`, `totalPrice` per item, and a selected-items subtotal are shown in the footer

#### Scenario: Empty cart shows empty state
- **WHEN** cart has no items
- **THEN** an Ant Design `Empty` component is displayed with a link to the homepage

#### Scenario: Select all items
- **WHEN** user checks the select-all checkbox
- **THEN** all `CartItem.id` values are added to `selectedIds` state
- **THEN** the footer subtotal computes the sum of `totalPrice` for all items

#### Scenario: Deselect individual item
- **WHEN** user unchecks one item's checkbox
- **THEN** that item's id is removed from `selectedIds`
- **THEN** the footer subtotal recomputes excluding that item

### Requirement: User can add an item to cart from the homepage
The system SHALL call `GET /add-product-to-cart/{productDetailId}` with the user's access token. Each call adds one unit (quantity = 1). React Query cache for the cart (`/cart` query key) SHALL be invalidated after a successful add.

#### Scenario: Cart item count updates after adding
- **WHEN** user successfully adds a product
- **THEN** the cart query is refetched and the cart icon/badge reflects the new item count

### Requirement: User can update quantity of a cart item
The system SHALL call `PUT /cart/{cartDetailId}?quantity=N` (Auth) when user increments or decrements quantity. `cart.service.ts` SHALL export `updateCartItem(cartDetailId: string, quantity: number)`. The cart query key `['cart']` SHALL be invalidated on success. If the backend returns a message indicating deletion (quantity was set to 0 by BE), the FE SHALL accept it and refetch cleanly.

#### Scenario: User increments quantity
- **WHEN** user clicks "+" on a cart item with `CartItem.id = X`
- **THEN** `PUT /cart/X?quantity=currentQty+1` is called
- **THEN** on success the `['cart']` query is invalidated and the updated quantity is shown

#### Scenario: User decrements quantity to 1 (minimum)
- **WHEN** user clicks "−" and current quantity is 1
- **THEN** the "−" button is disabled (minimum enforced at FE, `InputNumber min={1}`)
- **THEN** no API call is made

#### Scenario: Quantity exceeds stock
- **WHEN** `PUT /cart/{cartDetailId}?quantity=N` returns 400 with message containing "ton kho"
- **THEN** an Ant Design `message.error` toast displays the error message from the response

### Requirement: User can clear the entire cart
The system SHALL call `DELETE /cart/clear` (Auth) when user confirms the "Xóa tất cả" (Clear Cart) action. `cart.service.ts` SHALL export `clearCart()`. The cart query SHALL be invalidated and the `selectedIds` selection state SHALL be reset to `[]` on success.

#### Scenario: User confirms clear cart
- **WHEN** user clicks "Xóa tất cả" and confirms in a `Popconfirm` dialog
- **THEN** `DELETE /cart/clear` is called
- **THEN** the cart list becomes empty and the Empty state is shown

#### Scenario: User cancels clear cart
- **WHEN** user clicks "Xóa tất cả" but clicks Cancel in the Popconfirm
- **THEN** no API call is made and the cart remains unchanged

### Requirement: Cart page provides checkout entry point
The cart page SHALL display a "Đặt hàng" (Checkout) button that is disabled when no items are selected. On click it SHALL navigate to `/order/confirm` via React Router `useNavigate`, passing `{ state: { selectedIds: string[] } }` so the confirm page knows which items to include.

#### Scenario: Checkout with selected items
- **WHEN** user has selected at least one item and clicks "Đặt hàng"
- **THEN** user is navigated to `/order/confirm` with `location.state.selectedIds` containing the chosen `CartItem.id` values

#### Scenario: Checkout button disabled with no selection
- **WHEN** no items are selected
- **THEN** the "Đặt hàng" button is disabled and clicking it has no effect

## MODIFIED Requirements

### Requirement: Cart page response unwrap is consistent
Cart page queryFn SHALL unwrap `AxiosResponse` via `.then(r => r.data)` and component SHALL access `data?.data ?? []` for the CartItem array.

#### Scenario: Cart page loads items
- **WHEN** cart page mounts and useQuery fires
- **THEN** `getCart().then(r => r.data)` returns `ApiResponse<CartItem[]>`
- **THEN** component accesses `data?.data ?? []` to get the cart items array

### Requirement: User can remove an item from their cart
The system SHALL call `DELETE /remove-product-from-cart/{cartDetailId}` when user clicks the remove button on a cart item. `cart.service.ts` SHALL export a `removeFromCart(cartDetailId: string)` function. The cart query SHALL be invalidated on success.

#### Scenario: Cart item is removed after confirmation
- **WHEN** user clicks the remove button and confirms
- **THEN** `DELETE /remove-product-from-cart/{cartDetailId}` is called with the `id` of that CartItem
- **THEN** the cart query is invalidated and the item disappears from the list

### Requirement: CartItem type exposes its own id
`CartItem` SHALL include `id: string` at the root level. This is the CartDetail UUID needed for deletion (distinct from `productDetail.id` which is the ProductDetail UUID).

#### Scenario: Remove button receives correct CartDetail ID
- **WHEN** remove button is rendered for a cart row
- **THEN** `record.id` (CartItem root id) is passed as `cartDetailId` to `removeFromCart`

