## MODIFIED Requirements

### Requirement: User can remove an item from their cart
The system SHALL call `DELETE /remove-product-from-cart/{cartDetailId}` when user clicks the remove button on a cart item. `cart.service.ts` SHALL export a `removeFromCart(cartDetailId: string)` function. The cart query SHALL be invalidated on success.

#### Scenario: Cart item is removed after confirmation
- **WHEN** user clicks the remove button and confirms
- **THEN** `DELETE /remove-product-from-cart/{cartDetailId}` is called with the `id` of that CartItem
- **THEN** the cart query is invalidated and the item disappears from the list

### Requirement: CartItem type exposes its own id
`CartItem` SHALL include `id: string` at the root level.  This is the CartDetail UUID needed for deletion (distinct from `productDetail.id` which is the ProductDetail UUID).

#### Scenario: Remove button receives correct CartDetail ID
- **WHEN** remove button is rendered for a cart row
- **THEN** `record.id` (CartItem root id) is passed as `cartDetailId` to `removeFromCart`
